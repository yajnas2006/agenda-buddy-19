import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else setMsg('Signed up. Check email if confirmation is enabled.')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-3">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        className="p-2 rounded bg-zinc-800"
        type="email" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)}
      />
      <input
        className="p-2 rounded bg-zinc-800"
        type="password" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)}
      />
      <div className="space-x-2">
        <button onClick={signIn} className="px-4 py-2 bg-white/10 rounded">Log In</button>
        <button onClick={signUp} className="px-4 py-2 bg-white/10 rounded">Sign Up</button>
      </div>
      {msg && <p className="text-sm text-red-400">{msg}</p>}
    </div>
  )
}
