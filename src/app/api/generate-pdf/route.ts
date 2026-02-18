import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface TPHAttachment {
  tphNumber: number;
  photoData: string;
}

interface PDFTask {
  id: string;
  clerkName: string;
  divisionCode: string;
  foremanCode: string;
  notes: string;
  attachments: TPHAttachment[];
  signature?: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const task: PDFTask = await request.json();
    
    // Create Python script for PDF generation
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_report_pdf.py');
    const scriptDir = path.dirname(scriptPath);
    
    // Ensure scripts directory exists
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }
    
    // Write data to temp file
    const tempDataPath = path.join(scriptDir, `task_data_${Date.now()}.json`);
    fs.writeFileSync(tempDataPath, JSON.stringify(task, null, 2));
    
    // Call Python script
    const outputPath = path.join(process.cwd(), 'download', `GroundCheck_${task.divisionCode}_${task.foremanCode}_${new Date().toISOString().split('T')[0]}.pdf`);
    const downloadDir = path.dirname(outputPath);
    
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    // Generate PDF using Python
    await new Promise<void>((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, tempDataPath, outputPath]);
      
      let stderr = '';
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempDataPath);
        } catch {
          // Ignore cleanup errors
        }
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`PDF generation failed: ${stderr}`));
        }
      });
    });
    
    // Read the generated PDF
    const pdfBuffer = fs.readFileSync(outputPath);
    
    // Clean up the output file after reading
    try {
      fs.unlinkSync(outputPath);
    } catch {
      // Ignore cleanup errors
    }
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="GroundCheck_${task.divisionCode}_${task.foremanCode}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat PDF' },
      { status: 500 }
    );
  }
}
