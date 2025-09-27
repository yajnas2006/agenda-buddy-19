// src/main.tsx
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useNavigate, useLocation } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import AuthGuard from './AuthGuard'
import { supabase } from '@/lib/supabase' // <-- use the singleton

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const from = params.get('from') || '/'

  const signUp = async () => {
    setBusy(true); setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    setMsg(error ? error.message : 'Signed up. Check email if confirmation is on.')
  }

  const signIn = async () => {
    setBusy(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) return setMsg(error.message)
    navigate(from, { replace: true })
  }

  useEffect(() => {
    supabase.auth.getSession()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate(from, { replace: true })
    })
  }, [from, navigate])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-primary" />
            <span className="font-semibold tracking-tight">AI Meeting Buddy</span>
          </div>
          <span className="text-sm text-muted-foreground">Sign in</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-8 py-14">
          <section className="hidden lg:flex flex-col justify-center">
            <h1 className="text-3xl font-semibold leading-tight">Access your dashboard</h1>
            <p className="mt-3 text-muted-foreground max-w-prose">
              Secure Supabase Auth. Email + password now; OAuth and magic links later.
            </p>
          </section>

          <section className="flex items-center">
            <div className="meeting-card w-full">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Use your email and password.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <input
                    className="meeting-input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Password</label>
                  <input
                    className="meeting-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                {msg && <div className="status-pill status-pill-warning">{msg}</div>}

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={signIn} disabled={busy} className="meeting-button-primary disabled:opacity-50">
                    {busy ? 'Signing in…' : 'Sign In'}
                  </button>
                  <button onClick={signUp} disabled={busy} className="meeting-button-ghost disabled:opacity-50">
                    Create account
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 h-12 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} AI Meeting Buddy</span>
          <span className="hidden sm:inline">v0 – Supabase Auth</span>
        </div>
      </footer>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: (<AuthGuard><App /></AuthGuard>) },
  { path: '/login', element: <Login /> },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

