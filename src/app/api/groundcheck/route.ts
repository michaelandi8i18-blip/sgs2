import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET - Get all ground check tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const task = await db.groundCheckTask.findUnique({
        where: { id },
        include: {
          division: true,
          foreman: true,
          attachments: true,
        },
      });
      
      return NextResponse.json({ success: true, task });
    }
    
    const tasks = await db.groundCheckTask.findMany({
      include: {
        division: true,
        foreman: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Get ground check tasks error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data ground check' },
      { status: 500 }
    );
  }
}

// POST - Create new ground check task
export async function POST(request: NextRequest) {
  try {
    const { clerkName, divisionId, foremanId, notes, attachments, signature, createdBy } = await request.json();
    
    const taskId = uuidv4();
    
    const task = await db.groundCheckTask.create({
      data: {
        id: taskId,
        clerkName,
        divisionId,
        foremanId,
        notes,
        status: 'saved',
        signature,
        createdBy,
        attachments: {
          create: attachments.map((att: { tphNumber: number; photoData: string }) => ({
            id: uuidv4(),
            tphNumber: att.tphNumber,
            photoData: att.photoData,
          })),
        },
      },
      include: {
        attachments: true,
      },
    });
    
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Create ground check task error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan ground check' },
      { status: 500 }
    );
  }
}

// PUT - Update ground check task
export async function PUT(request: NextRequest) {
  try {
    const { id, signature } = await request.json();
    
    const task = await db.groundCheckTask.update({
      where: { id },
      data: { signature },
    });
    
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Update ground check task error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate ground check' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ground check task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID task diperlukan' },
        { status: 400 }
      );
    }
    
    await db.attachment.deleteMany({
      where: { taskId: id },
    });
    
    await db.groundCheckTask.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ground check task error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus ground check' },
      { status: 500 }
    );
  }
}
