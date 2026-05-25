import { NextRequest, NextResponse } from 'next/server';
import type { GrowthRow, GrowthTotals } from '../../../lib/growth-plan';

export interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'alert' | 'tip';
  title: string;
  body: string;
  action?: string;
  actionView?: string;
  priority: number; // 1 = highest
}

function computeInsights(rows: GrowthRow[], totals: GrowthTotals): Insight[] {
  const insights: Insight[] = [];

  if (!rows.length) return insights;

  // ── Top opportunity county ──────────────────────────────────────────────────
  const countyRevMap: Record<string, number> = {};
  const countyScoreMap: Record<string, number> = {};
  for (const r of rows) {
    countyRevMap[r.county] = (countyRevMap[r.county] ?? 0) + (r.revenue?.[0] ?? 0);
    countyScoreMap[r.county] = Math.max(countyScoreMap[r.county] ?? 0, r.opportunityScore ?? 0);
  }
  const topByScore = Object.entries(countyScoreMap).sort((a, b) => b[1] - a[1])[0];
  if (topByScore) {
    insights.push({
      id: 'top-opp',
      type: 'opportunity',
      title: `${topByScore[0]} is your highest-scoring market`,
      body: `Opportunity score ${topByScore[1]}/100 with $${Math.round((countyRevMap[topByScore[0]] ?? 0) / 1000)}K projected Y1 revenue. Consider prioritizing outreach here first.`,
      action: 'View county plan',
      actionView: 'county-plan',
      priority: 1,
    });
  }

  // ── Low-competition window ──────────────────────────────────────────────────
  const singleProviderCounties = rows
    .filter((r) => r.market?.hh?.prov === 1)
    .map((r) => r.county);
  const uniqueSingle = [...new Set(singleProviderCounties)];
  if (uniqueSingle.length > 0) {
    insights.push({
      id: 'single-prov',
      type: 'opportunity',
      title: `${uniqueSingle.length} count${uniqueSingle.length === 1 ? 'y has' : 'ies have'} only 1 HH provider`,
      body: `${uniqueSingle.slice(0, 3).join(', ')} ${uniqueSingle.length > 3 ? `and ${uniqueSingle.length - 3} more` : ''} — low-competition window. CMS data shows minimal incumbent resistance in these markets.`,
      action: 'View competitive view',
      actionView: 'competitive-view',
      priority: 2,
    });
  }

  // ── Contribution margin check ────────────────────────────────────────────────
  const y1Rev = totals.revenue?.[0] ?? 0;
  const y1Contrib = rows.reduce((s, r) => s + (r.contribution?.[0] ?? 0), 0);
  if (y1Rev > 0) {
    const margin = y1Contrib / y1Rev;
    if (margin < 0.25) {
      insights.push({
        id: 'low-margin',
        type: 'risk',
        title: `Y1 contribution margin is ${Math.round(margin * 100)}% — below 25% threshold`,
        body: 'Consider adjusting capture rates or reviewing reimbursement assumptions in the financial model to improve contribution margin before the board review.',
        action: 'Open financial model',
        actionView: 'financial-model',
        priority: 2,
      });
    } else if (margin >= 0.38) {
      insights.push({
        id: 'strong-margin',
        type: 'tip',
        title: `Strong Y1 margin at ${Math.round(margin * 100)}%`,
        body: 'Your current scenario shows healthy contribution across service lines. This is board-presentable. Consider running the aggressive growth scenario to stress-test it.',
        action: 'Run scenario compare',
        actionView: 'scenarios',
        priority: 4,
      });
    }
  }

  // ── Growth gap: high score but low capture ──────────────────────────────────
  const highScoreLowCapture = rows.filter(
    (r) => (r.opportunityScore ?? 0) >= 70 && (r.starts?.[0] ?? 0) < 10,
  );
  const uniqueGap = [...new Set(highScoreLowCapture.map((r) => r.county))];
  if (uniqueGap.length >= 2) {
    insights.push({
      id: 'high-score-low-starts',
      type: 'alert',
      title: `${uniqueGap.length} high-scoring counties show low Y1 starts`,
      body: `${uniqueGap.slice(0, 3).join(', ')} score well but current capture rates produce fewer than 10 starts in Year 1. Increase HH capture rate or conversion assumptions to close this gap.`,
      action: 'Adjust scenario',
      actionView: 'growth',
      priority: 3,
    });
  }

  // ── Y1 → Y3 growth rate check ────────────────────────────────────────────────
  const y3Rev = totals.revenue?.[2] ?? 0;
  if (y1Rev > 0 && y3Rev > 0) {
    const cagr = Math.pow(y3Rev / y1Rev, 1 / 2) - 1;
    if (cagr > 0.3) {
      insights.push({
        id: 'strong-growth',
        type: 'opportunity',
        title: `Projected ${Math.round(cagr * 100)}% annual revenue growth Y1→Y3`,
        body: `This trajectory exceeds typical home health sector growth. Staffing plan should be reviewed now to ensure FTE capacity matches demand before Year 2 ramp.`,
        action: 'Review staffing',
        actionView: 'staffing-model',
        priority: 3,
      });
    }
  }

  // ── Service line imbalance ──────────────────────────────────────────────────
  const serviceRevMap: Record<string, number> = {};
  for (const r of rows) {
    serviceRevMap[r.service] = (serviceRevMap[r.service] ?? 0) + (r.revenue?.[0] ?? 0);
  }
  const entries = Object.entries(serviceRevMap).sort((a, b) => b[1] - a[1]);
  if (entries.length >= 2) {
    const [top, bottom] = [entries[0], entries[entries.length - 1]];
    if (top[1] > bottom[1] * 4) {
      insights.push({
        id: 'service-imbalance',
        type: 'tip',
        title: `${top[0]} dominates — ${bottom[0]} is underweighted`,
        body: `${top[0]} accounts for ${Math.round((top[1] / y1Rev) * 100)}% of Y1 revenue. Consider whether ${bottom[0]} capture assumptions are too conservative in the current scenario.`,
        action: 'View service lines',
        actionView: 'service-lines',
        priority: 5,
      });
    }
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export async function POST(req: NextRequest) {
  try {
    const { rows, totals } = await req.json() as { rows: GrowthRow[]; totals: GrowthTotals };
    const insights = computeInsights(rows ?? [], totals ?? {} as GrowthTotals);

    // Optionally enhance with OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && insights.length > 0) {
      try {
        const prompt = `You are a strategic analyst for Andwell Health Partners (a Maine home health operator).
Review these ${insights.length} data-driven insights and rewrite each one's "body" field in a single sharp sentence — direct, board-ready language, no fluff.
Return JSON array in the same format: [{ id, type, title, body, action, actionView, priority }]

Insights to rewrite:
${JSON.stringify(insights, null, 2)}`;

        const res = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
            input: prompt,
            temperature: 0.2,
            max_output_tokens: 600,
          }),
          signal: AbortSignal.timeout(8_000),
        });

        if (res.ok) {
          const data = await res.json() as { output?: { content?: { text?: string }[] }[] };
          const text = data?.output?.[0]?.content?.[0]?.text ?? '';
          const match = text.match(/\[[\s\S]*\]/);
          if (match) {
            const enhanced = JSON.parse(match[0]) as Insight[];
            return NextResponse.json({ insights: enhanced, enhanced: true });
          }
        }
      } catch {
        // fall through to return unenhanced insights
      }
    }

    return NextResponse.json({ insights, enhanced: false });
  } catch {
    return NextResponse.json({ insights: [], enhanced: false });
  }
}
