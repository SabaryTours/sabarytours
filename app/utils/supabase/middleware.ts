import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { PASSWORD_RECOVERY_COOKIE, PASSWORD_RESET_PATH } from '../../lib/passwordRecovery'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isRecoveryPending = request.cookies.get(PASSWORD_RECOVERY_COOKIE)?.value === '1'
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  // Only block dashboard/admin during recovery — allow home, login, forgot-password, etc.
  if (isRecoveryPending && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = PASSWORD_RESET_PATH.split('?')[0]
    url.search = PASSWORD_RESET_PATH.split('?')[1] ?? ''
    return NextResponse.redirect(url)
  }

  const isLoginLikeRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginLikeRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
