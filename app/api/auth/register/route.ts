import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, isAdmin } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId));

    if (existingUser.length > 0) {
      return NextResponse.json(existingUser[0], { status: 200 });
    }

    // Create new user
    const newUser = await db.insert(users).values({
      id: userId,
      email: email || `user_${userId.slice(0, 8)}@example.com`,
      name: name || 'Anonymous User',
      isAdmin: isAdmin || false,
    }).returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
