import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/utils/prisma";

export async function GET(req: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { name: 'asc' },
      select: {
          id: true,
          name: true,
          position: true,
          image: true
      }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}
