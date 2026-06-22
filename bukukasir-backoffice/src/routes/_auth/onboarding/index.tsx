import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_auth/onboarding/')({
  component: OnboardingIndexRedirect,
})

function OnboardingIndexRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    void navigate({ to: '/onboarding/business', replace: true })
  }, [navigate])
  return null
}
