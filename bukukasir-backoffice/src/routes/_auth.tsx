import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Outlet />
    </div>
  )
}
