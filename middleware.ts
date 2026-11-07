import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // สร้าง Supabase Client สำหรับฝั่ง Server/Middleware
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
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ตรวจสอบว่าผู้ใช้ Login หรือยัง
  const { data: { user } } = await supabase.auth.getUser()

  // ถ้ายังไม่ Login แล้วพยายามเข้าหน้า /admin หรือเส้นทางลูก (ยกเว้นหน้า /admin/login)
  if (!user && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return response
}

// กำหนดให้ Middleware ทำงานเฉพาะเส้นทาง /admin เท่านั้น
export const config = {
  matcher: '/admin/:path*',
}