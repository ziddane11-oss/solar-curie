import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { dataDir, coverLetterPath } from '@/lib/paths';

export const runtime = 'nodejs';

const defaultCoverLetter = {
  version: 1,
  sections: [
    { id: 'self_intro', title: '자기소개', body: '', max_length: 1000 },
    { id: 'motivation', title: '지원동기', body: '', max_length: 1000 },
    { id: 'philosophy', title: '교육관', body: '', max_length: 1000 },
    { id: 'future_plan', title: '향후 계획', body: '', max_length: 500 },
  ],
};

export async function GET() {
  try {
    const data = await fs.readFile(coverLetterPath, 'utf-8');
    return NextResponse.json({ coverLetter: JSON.parse(data) });
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(coverLetterPath, JSON.stringify(defaultCoverLetter, null, 2), 'utf-8');
    return NextResponse.json({ coverLetter: defaultCoverLetter });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const coverLetter = body.coverLetter;

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(coverLetterPath, JSON.stringify(coverLetter, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid cover letter payload.' }, { status: 400 });
  }
}
