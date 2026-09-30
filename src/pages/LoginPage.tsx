import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Button, ErrorText, Field, Input } from '../components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[320px]">
        <div className="mb-8 text-center">
          <img src="/favicon.svg" alt="" className="mx-auto size-14 rounded-lg" />
          <h1 className="mt-4 text-[26px] leading-tight font-bold text-slate-800">ADU ATM bo'limi</h1>
          <p className="mt-1 text-[15px] text-slate-500">Ishlar va topshiriqlar tizimiga kiring</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Login">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
          </Field>
          <Field label="Parol">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={busy} className="h-9 w-full">
            {busy ? 'Kirilmoqda…' : 'Kirish'}
          </Button>
        </form>
      </div>
    </div>
  )
}
