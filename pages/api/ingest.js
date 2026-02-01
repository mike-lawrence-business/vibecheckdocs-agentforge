// Temporary stub to ensure /api/ingest route exists and responds while we debug full ingest implementation
import { parseAndChunk, upsertVectors } from '../../lib/ingest.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { repo, path, synthetic } = req.body || {};
  // If called without body, return a quick smoke response
  if (!repo) {
    return res.status(200).json({ ok: true, message: 'ingest endpoint available', mode: process.env.SUPABASE_URL ? 'supabase' : 'synthetic' });
  }
  try {
    // Run in synthetic mode to avoid side effects if creds are missing
    const docs = await parseAndChunk({ repo, path });
    const result = await upsertVectors(docs, { synthetic: !!synthetic });
    return res.status(200).json({ ok: true, docsCount: docs.length, result });
  } catch (e) {
    console.error('ingest error', e && e.stack ? e.stack : e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
