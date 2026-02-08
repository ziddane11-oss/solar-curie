import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { dataDir, profilePath } from '@/lib/paths';

export const runtime = 'nodejs';

const defaultProfile = {
  version: 2,
  personal: {
    name: '', name_hanja: '', birth: '', gender: '',
    phone: '', phone_secondary: '', email: '',
    address: '', address_detail: '', postal_code: '',
  },
  teacher_cert: [{ cert_type: '', cert_subject: '', cert_number: '', cert_date: '', issuer: '' }],
  other_certs: [],
  education: [{ school: '', major: '', degree: '', status: '', start_date: '', end_date: '', thesis_title: '' }],
  career: [{ institution: '', position: '', subject: '', start_date: '', end_date: '', is_contract: true, total_months: 0, notes: '' }],
  military: { status: '', branch: '', rank: '', start_date: '', end_date: '' },
  additional: { disability: '', veteran: '', multi_cultural: false, custom_fields: [] },
};

export async function GET() {
  try {
    const data = await fs.readFile(profilePath, 'utf-8');
    return NextResponse.json({ profile: JSON.parse(data) });
  } catch {
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
