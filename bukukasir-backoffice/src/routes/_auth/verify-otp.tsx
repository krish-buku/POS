import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Store } from 'lucide-react'

export const Route = createFileRoute('/_auth/verify-otp')({
  component: VerifyOtpPage,
})

function VerifyOtpPage() {
  const { verifyOtp, phone, otpSent, login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const t = useTranslate()
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if not in OTP flow
  useEffect(() => {
    if (!otpSent && !isAuthenticated) {
      void navigate({ to: '/login' })
    }
  }, [otpSent, isAuthenticated, navigate])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: '/select-business' })
    }
  }, [isAuthenticated, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleVerify = useCallback(
    async (code: string) => {
      setLoading(true)
      setError('')
      try {
        const success = await verifyOtp(code)
        if (!success) {
          setError(t('auth.otp.wrongCode'))
          setOtp(Array(6).fill(''))
          inputRefs.current[0]?.focus()
        }
      } catch {
        setError(t('auth.otp.verifyFailed'))
      } finally {
        setLoading(false)
      }
    },
    [verifyOtp, t]
  )

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all digits are entered
    const fullCode = newOtp.join('')
    if (fullCode.length === 6) {
      void handleVerify(fullCode)
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return

    const newOtp = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)

    if (pasted.length === 6) {
      void handleVerify(pasted)
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return
    setResendTimer(60)
    setError('')
    await login(phone)
  }

  const maskedPhone = phone
    ? `+62 ${phone.replace('+62', '').slice(0, 3)}****${phone.slice(-4)}`
    : ''

  return (
    <div className="flex w-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A6B]">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold"><span className="text-[#1E3A6B]">Buku</span><span className="text-[#D4A726]">Kasir</span></h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => void navigate({ to: '/login' })}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('auth.otp.back')}
        </Button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            {t('auth.otp.title')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('auth.otp.subtitle')}{' '}
            <span className="font-medium text-foreground">{maskedPhone}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-14 w-12 rounded-lg border border-input bg-background text-center text-xl font-semibold outline-none transition-colors focus:border-[#1E3A6B] focus:ring-2 focus:ring-[#1E3A6B]/30"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E3A6B] border-t-transparent" />
              {t('auth.otp.verifying')}
            </div>
          )}

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('auth.otp.resendIn')}{' '}
                <span className="font-medium text-foreground">
                  {t('auth.otp.seconds', { count: resendTimer })}
                </span>
              </p>
            ) : (
              <Button
                variant="link"
                className="text-[#2B5EA7]"
                onClick={() => void handleResend()}
              >
                {t('auth.otp.resend')}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t('auth.otp.demoHint', { code: '123456' })}
          </p>
        </div>
      </div>
    </div>
  )
}
