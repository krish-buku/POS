import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTranslate } from '@/lib/i18n-context'
import {
  OnboardingProvider,
  useOnboarding,
  stepIndex,
  ONBOARDING_STEP_ORDER,
  type OnboardingStepId,
} from '@/lib/onboarding-context'
import { Stepper, type StepperStep } from '@/components/onboarding/Stepper'
import { Store } from 'lucide-react'

export const Route = createFileRoute('/_auth/onboarding')({
  component: OnboardingLayout,
})

function OnboardingLayout() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <OnboardingProvider>
      <OnboardingShell />
    </OnboardingProvider>
  )
}

function OnboardingShell() {
  const t = useTranslate()
  const navigate = useNavigate()
  const { draft } = useOnboarding()
  const routerState = useRouterState()

  const pathname = routerState.location.pathname
  const currentStep = useMemo<OnboardingStepId>(() => {
    const match = pathname.match(/\/onboarding\/([^/]+)/)
    const id = match?.[1] as OnboardingStepId | undefined
    if (id && ONBOARDING_STEP_ORDER.includes(id)) return id
    return 'business'
  }, [pathname])

  const steps: StepperStep[] = useMemo(
    () => [
      { id: 'business', label: t('onboarding.step.business') },
      { id: 'menu', label: t('onboarding.step.menu') },
      { id: 'payments', label: t('onboarding.step.payments') },
      { id: 'staff', label: t('onboarding.step.staff') },
      { id: 'review', label: t('onboarding.step.review') },
    ],
    [t]
  )

  const completedSteps = useMemo<OnboardingStepId[]>(() => {
    const done: OnboardingStepId[] = []
    const lastIdx = stepIndex(draft.lastStep)
    if (draft.businessId) done.push('business')
    if (draft.menu.skipped || (draft.createdMenuItemIds?.length ?? 0) > 0 || lastIdx > stepIndex('menu')) {
      done.push('menu')
    }
    if (draft.payments.skipped || (draft.createdPaymentMethodIds?.length ?? 0) > 0 || lastIdx > stepIndex('payments')) {
      done.push('payments')
    }
    if (draft.staff.skipped || (draft.createdStaffIds?.length ?? 0) > 0 || lastIdx > stepIndex('staff')) {
      done.push('staff')
    }
    return done
  }, [draft])

  const handleStepClick = (id: OnboardingStepId) => {
    void navigate({ to: `/onboarding/${id}` })
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A6B]">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">
              <span className="text-[#1E3A6B]">Buku</span>
              <span className="text-[#D4A726]">Kasir</span>
            </h1>
            <p className="text-xs text-muted-foreground">{t('onboarding.title')}</p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-5xl px-6 pb-6">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
