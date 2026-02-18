import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET - Get all divisions
export async function GET() {
  try {
    const divisions = await db.division.findMany({
      orderBy: { code: 'asc' },
    });
    
    return NextResponse.json({ success: true, divisions });
  } catch (error) {
    console.error('Get divisions error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data divisi' },
      { status: 500 }
    );
  }
}

// POST - Create new division
export async function POST(request: NextRequest) {
  try {
    const { code, name } = await request.json();
    
    const existing = await db.division.findUnique({
      where: { code },
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kode divisi sudah digunakan' },
        { status: 400 }
      );
    }
    
    const division = await db.division.create({
      data: {
        id: uuidv4(),
        code,
        name,
      },
    });
    
    return NextResponse.json({ success: true, division });
  } catch (error) {
    console.error('Create division error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat divisi baru' },
      { status: 500 }
    );
  }
}

// DELETE - Delete division
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID divisi diperlukan' },
        { status: 400 }
      );
    }
    
    await db.division.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete division error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus divisi' },
      { status: 500 }
    );
  }
}
