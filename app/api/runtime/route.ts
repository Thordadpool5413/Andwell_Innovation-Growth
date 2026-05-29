import { NextResponse } from 'next/server';
import { isAIExtractionConfigured, getAITransportDiagnostics } from '../../../lib/ai-extractor';
import { isMongoConfigured } from '../../../lib/mongodb';
import { isSupabaseConfigured } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function persistenceProvider() {
  if (isSupabaseConfigured()) return 'supabase';
  if (isMongoConfigured()) return 'mongodb';
  return 'json-dev-fallback';
}

export async function GET() {
  const persistence = persistenceProvider();
  return NextResponse.json({
    ok: true,
    route: '/api/runtime',
    app: 'Andwell Innovation Command Center',
    persistence,
    persistenceConfidence: persistence === 'supabase' ? 'production' : persistence === 'mongodb' ? 'server persistence' : 'local/dev JSON fallback',
    aiConfigured: isAIExtractionConfigured(),
    aiTransport: getAITransportDiagnostics(),
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.VERCEL_URL || process.env.HOSTINGER_APP_URL || 'local',
    buildVersion: process.env.VERCEL_GIT_COMMIT_SHA || process.env.CIH_BUILD_VERSION || 'local',
    knowledgeVersion: 'andwell-expert-2026.05',
    checkedAt: new Date().toISOString()
  });
}
