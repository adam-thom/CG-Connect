import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'super-secret-key-for-cg-connect-dev-only-change-me';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Exclude static assets, core routing loops, and login
  if (path === '/login' || path.startsWith('/_next') || path.startsWith('/api') || path === '/' || path.includes('.')) {
    return NextResponse.next();
  }

  const session = req.cookies.get('session')?.value;
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });

    const role = (payload.role as string)?.toLowerCase() || '';
    
    // Strict Silo Guards
    // If you are trying to view employee files:
    if (path.startsWith('/employee')) {
        if (role !== 'employee' && role !== 'admin') {
             // Managers get bounced safely to their manager dashboard
             return NextResponse.redirect(new URL('/manager/dashboard', req.url));
        }
    }
    
    // If you are trying to view manager files:
    if (path.startsWith('/manager')) {
       if (role !== 'manager' && role !== 'admin') {
            // Employees get bounced safely to employee dashboard
            return NextResponse.redirect(new URL('/employee/dashboard', req.url));
       }
    }

    // Admins only routes:
    if (path.startsWith('/admin') && role !== 'admin') {
      const fallback = role === 'manager' ? '/manager/dashboard' : '/employee/dashboard';
      return NextResponse.redirect(new URL(fallback, req.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Cryptography rejected payload (Expired or Forged JWT)
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
