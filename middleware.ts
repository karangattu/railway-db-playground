import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get or create user ID from session storage (via cookie)
  let userId = request.cookies.get('userId')?.value;
  let isAdmin = request.cookies.get('isAdmin')?.value === 'true';

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add headers for API routes to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-is-admin', String(isAdmin));

  // Set cookies for persistence
  response.cookies.set('userId', userId, { 
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,
    path: '/'
  });

  response.cookies.set('isAdmin', String(isAdmin), { 
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,
    path: '/'
  });

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
