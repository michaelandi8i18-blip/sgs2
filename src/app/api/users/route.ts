import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// GET - Get all users
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        divisionId: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pengguna' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { username, password, name, role, divisionId } = await request.json();
    
    // Check if username already exists
    const existing = await db.user.findUnique({
      where: { username },
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Username sudah digunakan' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await db.user.create({
      data: {
        id: uuidv4(),
        username,
        password: hashedPassword,
        name,
        role,
        divisionId: divisionId || null,
      },
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        divisionId: user.divisionId,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pengguna baru' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const { id, username, password, name, role, divisionId } = await request.json();
    
    const updateData: Record<string, string | null | undefined> = {
      username,
      name,
      role,
      divisionId: divisionId || null,
    };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await db.user.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        divisionId: user.divisionId,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate pengguna' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pengguna diperlukan' },
        { status: 400 }
      );
    }
    
    await db.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pengguna' },
      { status: 500 }
    );
  }
}
