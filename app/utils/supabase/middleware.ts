import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { PASSWORD_RECOVERY_COOKIE, PASSWORD_RESET_PATH } from '../../lib/passwordRecovery'

function isInvalidRefreshToken(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { code?: string; message?: string }
  return candidate.code === 'refresh_token_not_found' ||
    /invalid refresh token|refresh token not found/i.test(candidate.message || '')
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach(({ name }) => {
    if (!name.startsWith('sb-') || !name.includes('auth-token')) return
    request.cookies.delete(name)
    response.cookies.set(name, '', { path: '/', maxAge: 0 })
  })
}

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  let user = null
  const { data, error } = await supabase.auth.getUser()
  user = data.user
  const invalidRefreshToken = isInvalidRefreshToken(error)

  if (invalidRefreshToken) user = null

  const pathname = request.nextUrl.pathname
  const isRecoveryPending = request.cookies.get(PASSWORD_RECOVERY_COOKIE)?.value === '1'
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  // Only block dashboard/admin during recovery — allow home, login, forgot-password, etc.
  if (isRecoveryPending && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = PASSWORD_RESET_PATH.split('?')[0]
    url.search = PASSWORD_RESET_PATH.split('?')[1] ?? ''
    const redirectResponse = NextResponse.redirect(url)
    if (invalidRefreshToken) clearSupabaseAuthCookies(request, redirectResponse)
    return redirectResponse
  }

  const isLoginLikeRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    if (invalidRefreshToken) clearSupabaseAuthCookies(request, redirectResponse)
    return redirectResponse
  }

  if (user && isLoginLikeRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (invalidRefreshToken) clearSupabaseAuthCookies(request, supabaseResponse)
  return supabaseResponse
}
