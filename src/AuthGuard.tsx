// src/AuthGuard.tsx
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    // if you open http://localhost:8080/?logout=1 it will clear and reload
const url = new URL(window.location.href)
if (url.searchParams.get('logout') === '1') {
  supabase.auth.signOut().finally(() => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.replace('/login')
  })
  return
}

    let mounted = true

    const init = async () => {
      // hydrate session (parse magic link, etc.)
      await supabase.auth.getSession()
      const { data } = await supabase.auth.getUser()
      if (!mounted) return

      // Don't redirect if we're already on /login
      const onLogin = loc.pathname.startsWith('/login')

      if (!data.user && !onLogin) {
        const from = encodeURIComponent(loc.pathname + loc.search)
        navigate(`/login?from=${from}`, { replace: true })
        // keep checking=true to render nothing while redirect happens
        return
      }

      setChecking(false)
    }

    init()

    // stay in sync
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const onLogin = loc.pathname.startsWith('/login')
      if (!session && !onLogin) {
        const from = encodeURIComponent(loc.pathname + loc.search)
        navigate(`/login?from=${from}`, { replace: true })
      } else if (session && onLogin) {
        // if logged in and on /login, go home (or go "from")
        const params = new URLSearchParams(window.location.search)
        const dest = params.get('from') || '/'
        navigate(dest, { replace: true })
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loc.pathname, loc.search, navigate])

  if (checking) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-6">
        <div className="meeting-card flex items-center gap-3">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <p className="text-sm text-muted-foreground">Checking session…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
