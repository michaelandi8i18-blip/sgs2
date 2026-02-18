import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// POST - Initialize default data
export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { username: 'admin' },
    });
    
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data sudah diinisialisasi' 
      });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.user.create({
      data: {
        id: uuidv4(),
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
      },
    });
    
    // Create divisions
    const divisions = [
      { id: uuidv4(), code: '1', name: 'Divisi 1' },
      { id: uuidv4(), code: '2', name: 'Divisi 2' },
      { id: uuidv4(), code: '3', name: 'Divisi 3' },
    ];
    
    for (const division of divisions) {
      await db.division.create({ data: division });
    }
    
    // Create foremen for each division
    const foremen = [
      // Division 1
      { id: uuidv4(), code: 'A', name: 'Kemandoran A - Divisi 1', divisionId: divisions[0].id },
      { id: uuidv4(), code: 'B', name: 'Kemandoran B - Divisi 1', divisionId: divisions[0].id },
      { id: uuidv4(), code: 'C', name: 'Kemandoran C - Divisi 1', divisionId: divisions[0].id },
      // Division 2
      { id: uuidv4(), code: 'A', name: 'Kemandoran A - Divisi 2', divisionId: divisions[1].id },
      { id: uuidv4(), code: 'B', name: 'Kemandoran B - Divisi 2', divisionId: divisions[1].id },
      { id: uuidv4(), code: 'C', name: 'Kemandoran C - Divisi 2', divisionId: divisions[1].id },
      // Division 3
      { id: uuidv4(), code: 'A', name: 'Kemandoran A - Divisi 3', divisionId: divisions[2].id },
      { id: uuidv4(), code: 'B', name: 'Kemandoran B - Divisi 3', divisionId: divisions[2].id },
      { id: uuidv4(), code: 'C', name: 'Kemandoran C - Divisi 3', divisionId: divisions[2].id },
    ];
    
    for (const foreman of foremen) {
      await db.foreman.create({ data: foreman });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data berhasil diinisialisasi',
      admin: { username: 'admin', password: 'admin123' }
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menginisialisasi data' },
      { status: 500 }
    );
  }
}

// GET - Check initialization status
export async function GET() {
  try {
    const admin = await db.user.findUnique({
      where: { username: 'admin' },
    });
    
    return NextResponse.json({ 
      success: true, 
      initialized: !!admin 
    });
  } catch (error) {
    console.error('Check init error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengecek status inisialisasi' },
      { status: 500 }
    );
  }
}
