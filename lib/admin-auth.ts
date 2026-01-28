import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
