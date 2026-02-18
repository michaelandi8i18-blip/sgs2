import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET - Get all foremen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get('divisionId');
    
    const where = divisionId ? { divisionId } : {};
    
    const foremen = await db.foreman.findMany({
      where,
      orderBy: [{ divisionId: 'asc' }, { code: 'asc' }],
      include: { division: true },
    });
    
    return NextResponse.json({ success: true, foremen });
  } catch (error) {
    console.error('Get foremen error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kemandoran' },
      { status: 500 }
    );
  }
}

// POST - Create new foreman
export async function POST(request: NextRequest) {
  try {
    const { code, name, divisionId } = await request.json();
    
    const foreman = await db.foreman.create({
      data: {
        id: uuidv4(),
        code,
        name,
        divisionId,
      },
    });
    
    return NextResponse.json({ success: true, foreman });
  } catch (error) {
    console.error('Create foreman error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kemandoran baru' },
      { status: 500 }
    );
  }
}

// DELETE - Delete foreman
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID kemandoran diperlukan' },
        { status: 400 }
      );
    }
    
    await db.foreman.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete foreman error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kemandoran' },
      { status: 500 }
    );
  }
}
