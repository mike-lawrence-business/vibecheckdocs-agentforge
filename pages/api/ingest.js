// Proxy ingest endpoint to call internal vibecheckdocs implementation if present
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { repo, path, synthetic } = req.body || {};
  if (!repo) return res.status(200).json({ ok: true, message: 'ingest proxy available' });
  try {
    const ingestPath = '../../vibecheckdocs/lib/ingest.js';
    if (fs.existsSync('./vibecheckdocs/lib/ingest.js')) {
      const mod = await import('../../vibecheckdocs/lib/ingest.js');
      const docs = await mod.parseAndChunk({ repo, path });
      const result = await mod.upsertVectors(docs, { synthetic: !!synthetic });
      return res.status(200).json({ ok: true, docsCount: docs.length, result });
    }
    return res.status(200).json({ ok: true, mode: 'synthetic-fallback', docsCount: 0 });
  } catch (e) {
    console.error('proxy ingest error', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
