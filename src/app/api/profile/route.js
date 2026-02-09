import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { dataDir, profilePath } from '@/lib/paths';

export const runtime = 'nodejs';

const defaultProfilePath = path.join(process.cwd(), 'data', 'profile.json');
async function getDefaultProfile() {
  const raw = await fs.readFile(defaultProfilePath, 'utf-8');
  return JSON.parse(raw);
}

export async function GET() {
  try {
    const data = await fs.readFile(profilePath, 'utf-8');
    return NextResponse.json({ profile: JSON.parse(data) });
  } catch {
    const defaultProfile = await getDefaultProfile();
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(profilePath, JSON.stringify(defaultProfile, null, 2), 'utf-8');
    return NextResponse.json({ profile: defaultProfile });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const profile = body.profile;

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid profile payload.' }, { status: 400 });
  }
}
