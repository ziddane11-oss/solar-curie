import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { templatesDir } from '@/lib/paths';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });
    const templates = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const mapPath = path.join(templatesDir, entry.name, 'map.json');
      try {
        const data = await fs.readFile(mapPath, 'utf-8');
        const map = JSON.parse(data);
        templates.push({
          id: entry.name,
          name: map.template_name || map.template_id || entry.name,
          displayName: map.display_name || map.template_name || entry.name,
          ruleCount: map.rules?.length || 0
        });
      } catch (error) {
        templates.push({ id: entry.name, name: entry.name, displayName: entry.name, ruleCount: 0 });
      }
    }

    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ templates: [] });
  }
}
