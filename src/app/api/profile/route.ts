import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { dataDir, profilePath } from '@/lib/paths';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';

const defaultProfile: Profile = {
  person: {
    name: '',
    birth: '',
    phone: '',
    email: '',
    address: ''
  },
  education: [{ school: '', major: '', period: '', degree: '' }],
  career: [{ school: '', period: '', subject: '', role: '', notes: '' }]
};

export async function GET() {
  try {
    const data = await fs.readFile(profilePath, 'utf-8');
    return NextResponse.json({ profile: JSON.parse(data) });
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(profilePath, JSON.stringify(defaultProfile, null, 2), 'utf-8');
    return NextResponse.json({ profile: defaultProfile });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const profile = body.profile as Profile;

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid profile payload.' }, { status: 400 });
  }
}
