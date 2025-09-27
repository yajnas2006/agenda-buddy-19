import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setEmail(data.user.email)
      }
    }
    getUser()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl">Welcome, {email}</h1>
      <button onClick={signOut} className="mt-4 px-4 py-2 bg-white/10 rounded">
        Sign Out
      </button>
    </div>
  )
}
