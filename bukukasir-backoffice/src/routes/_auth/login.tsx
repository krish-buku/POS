import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Smartphone,
  ShieldCheck,
  BarChart3,
  Store,
} from 'lucide-react'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const t = useTranslate()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already authenticated, redirect
  if (isAuthenticated) {
    void navigate({ to: '/select-business' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setError(t('auth.phoneMinDigits'))
      return
    }

    setLoading(true)
    try {
      await login(`+62${cleanPhone}`)
      void navigate({ to: '/verify-otp' })
    } catch {
      setError(t('auth.otpFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col lg:flex-row">
      {/* Left Side - Illustration & Features */}
      <div className="hidden flex-1 flex-col justify-center bg-gradient-to-br from-[#1E3A6B] to-[#2B5EA7] px-12 py-16 text-white lg:flex xl:px-20">
        <div className="max-w-lg">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Store className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-bold"><span className="text-white">Buku</span><span className="text-[#D4A726]">Kasir</span></h1>
            </div>
            <p className="text-lg text-blue-100">
              {t('auth.tagline')}
            </p>
          </div>

          <div className="space-y-6">
            <FeatureItem
              icon={<Smartphone className="h-5 w-5" />}
              title={t('auth.features.multiOutlet')}
              description={t('auth.features.multiOutletDesc')}
            />
            <FeatureItem
              icon={<BarChart3 className="h-5 w-5" />}
              title={t('auth.features.realtime')}
              description={t('auth.features.realtimeDesc')}
            />
            <FeatureItem
              icon={<ShieldCheck className="h-5 w-5" />}
              title={t('auth.features.secure')}
              description={t('auth.features.secureDesc')}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A6B]">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold"><span className="text-[#1E3A6B]">Buku</span><span className="text-[#D4A726]">Kasir</span></h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {t('auth.title')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t('auth.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground"
              >
                {t('auth.phoneLabel')}
              </label>
              <div className="flex gap-2">
                <div className="flex h-8 items-center rounded-lg border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                  +62
                </div>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="8123456789"
                  value={phone}
                  onChange={(e) => {
                    // Strip anything non-numeric and cap at 10 digits
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhone(val)
                  }}
                  maxLength={10}
                  className="flex-1"
                  autoFocus
                  aria-describedby={error ? 'phone-error' : undefined}
                  aria-invalid={!!error}
                />
              </div>
              {error && (
                <p id="phone-error" role="alert" className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full bg-[#D4A726] text-white hover:bg-[#C0961F]"
              disabled={loading || phone.replace(/\D/g, '').length !== 10}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('auth.sending')}
                </span>
              ) : (
                t('auth.sendOtp')
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {t('auth.terms')}
          </p>

          <div className="mt-12 text-center text-xs text-muted-foreground">
            BukuKasir Back Office v0.1.0
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-[#A8C4E0]">{description}</p>
      </div>
    </div>
  )
}
