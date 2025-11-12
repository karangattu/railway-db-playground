import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify admin password
 * This endpoint validates the password server-side to keep it private
 * Password is never exposed to the browser/client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get the correct password from server-side environment variables
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate the password
    const isValid = password === correctPassword;

    // Rate limiting: Consider adding rate limiting in production
    // to prevent brute force attacks
    if (!isValid) {
      // Log failed attempt (for security monitoring)
      console.warn('Failed admin password attempt');
      
      // Return generic error message to prevent user enumeration
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Password is valid
    return NextResponse.json(
      { success: true, message: 'Password verified' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
