import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const response = NextResponse.redirect('https://worldshifttech.com/projects')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    const guestProjectId = request.cookies.get('guestProjectId')?.value
    if (guestProjectId && session?.user?.id) {
      const userId = session.user.id
      try {
        const db = getSupabase()
        await db
          .from('projects')
          .update({ user_id: userId, guest: false })
          .eq('id', guestProjectId)
          .eq('guest', true)
          .is('user_id', null)
        await db
          .from('projects')
          .update({ status: 'submitted' })
          .eq('id', guestProjectId)
        fetch('https://worldshifttech.com/api/notify-slack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: guestProjectId, type: 'submission' }),
        })
        console.log('[GUEST PROJECT ATTACHED IN CALLBACK]')
      } catch (err) {
        console.log('[GUEST PROJECT ATTACH FAILED IN CALLBACK]', err)
      }
      response.cookies.set('guestProjectId', '', { maxAge: 0, path: '/' })
    }
  }

  return response
}
