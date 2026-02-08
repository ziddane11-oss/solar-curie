import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { mapPathForTemplate, outputDir, profilePath, scriptsDir, yearPath } from '@/lib/paths';
import { isAllowedTemplateFile, sanitizeTemplateId } from '@/lib/validate';

export const runtime = 'nodejs';

const readLog = async (logPath: string) => {
  try {
    return await fs.readFile(logPath, 'utf-8');
  } catch (error) {
    return '';
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
  }

  const pdfPath = path.join(outputDir, jobId, 'result.pdf');
  try {
    const file = await fs.readFile(pdfPath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="result-${jobId}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'PDF not found.' }, { status: 404 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const templateId = sanitizeTemplateId(String(formData.get('template_id') || ''));
    const file = formData.get('file') as File | null;

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'template_id is required.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'file is required.' }, { status: 400 });
    }

    if (!isAllowedTemplateFile(file.name)) {
      return NextResponse.json({ success: false, error: '지원하지 않는 파일 형식입니다.' }, { status: 400 });
    }

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const jobDir = path.join(outputDir, jobId);
    await fs.mkdir(jobDir, { recursive: true });

    const ext = path.extname(file.name).toLowerCase();
    const inputPath = path.join(jobDir, `input${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    const logPath = path.join(jobDir, 'log.txt');
    const mapPath = mapPathForTemplate(templateId);
    const scriptPath = path.join(scriptsDir, 'hwp_fill_and_export.py');

    const pythonProcess = spawn('python', [
      scriptPath,
      inputPath,
      mapPath,
      profilePath,
      yearPath,
      jobDir
    ]);

    let timedOut = false;
    const timeoutMs = 120000;

    const timeout = setTimeout(() => {
      timedOut = true;
      pythonProcess.kill('SIGTERM');
    }, timeoutMs);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    const exitCode: number = await new Promise((resolve) => {
      pythonProcess.on('close', (code) => resolve(code ?? 1));
    });

    clearTimeout(timeout);
    await fs.appendFile(logPath, output);

    const log = await readLog(logPath);

    if (timedOut || exitCode !== 0) {
      return NextResponse.json(
        {
          success: false,
          error: timedOut ? '한글 자동화가 시간 초과되었습니다.' : '문서 처리에 실패했습니다.',
          log
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl: `/api/generate?jobId=${jobId}`,
      log
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '서버 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
