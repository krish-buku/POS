import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingStepId } from '@/lib/onboarding-context'
import { stepIndex } from '@/lib/onboarding-context'

export interface StepperStep {
  id: OnboardingStepId
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: OnboardingStepId
  completedSteps: OnboardingStepId[]
  onStepClick?: (id: OnboardingStepId) => void
}

export function Stepper({ steps, currentStep, completedSteps, onStepClick }: StepperProps) {
  const currentIndex = stepIndex(currentStep)
  const currentLabel = steps.find((s) => s.id === currentStep)?.label ?? ''

  return (
    <div className="w-full">
      {/* Desktop */}
      <ol className="hidden items-center md:flex">
        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isClickable = Boolean(onStepClick) && (isDone || isCurrent)
          const isLast = idx === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors',
                  isClickable && 'cursor-pointer hover:bg-muted/50',
                  !isClickable && 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isDone && 'bg-[#D4A726] text-white',
                    isCurrent && !isDone && 'bg-[#1E3A6B] text-white ring-4 ring-[#1E3A6B]/15',
                    !isDone && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    isDone && 'text-foreground'
                  )}
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div
                  className={cn(
                    'mx-3 h-0.5 flex-1 rounded-full transition-colors',
                    idx < currentIndex || completedSteps.includes(steps[idx + 1].id)
                      ? 'bg-[#D4A726]'
                      : 'bg-border'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{currentLabel}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-[#D4A726] transition-all"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
