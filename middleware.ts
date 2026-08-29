import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  // Only protect /admin/* routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow access to /admin/login without authentication
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  try {
    // Get cookies (now async in Next.js 15)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('oven_admin_session')?.value;

    if (!sessionToken) {
      // No session token found, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, redirect to login (fail secure)
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};