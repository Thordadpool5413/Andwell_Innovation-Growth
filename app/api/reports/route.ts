import { NextRequest, NextResponse } from 'next/server';
import { getReport, readStore, deleteReport } from '../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (id) {
    const report = await getReport(id);
    if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    return NextResponse.json({ report });
  }
  const store = await readStore();
  return NextResponse.json({
    reports: store.reports.map((report) => ({
      id: report.id,
      generatedAt: report.generatedAt,
      competitorsAnalyzed: report.competitorsAnalyzed,
      pagesReviewed: report.pagesReviewed,
      serviceLinesMapped: report.serviceLinesMapped,
      subservicesMapped: report.subservicesMapped,
      matchedServiceFindings: report.matchedServiceFindings,
      potentialAndwellAdvantages: report.potentialAndwellAdvantages,
      humanReviewItems: report.humanReviewItems,
      competitors: report.analyses.map((analysis) => analysis.name),
      executiveSummary: report.executiveSummary
    }))
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json() as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array required.' }, { status: 400 });
    }
    await Promise.all(ids.map((id) => deleteReport(id)));
    return NextResponse.json({ deleted: ids.length });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed.' }, { status: 500 });
  }
}
