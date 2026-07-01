import * as React from 'react'
import { Outlet, ScrollRestoration, createRootRouteWithContext, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import '../styles.css'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/' || location.pathname === '') {
      throw redirect({ to: '/dash/' })
    }
  },
  component: RootComponent,
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useRouterState({ select: (s) => s.location })

  React.useEffect(() => {
    if (!loading && !user && location.pathname !== '/login') {
      navigate({ to: '/login' })
    }
  }, [user, loading, location.pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#F9F5F0" }}>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#E0249C]" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#E0249C]" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#E0249C]" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    )
  }

  if (!user && location.pathname !== '/login') return null

  return <>{children}</>
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Bebas+Neue&family=Montserrat:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <HeadContent />
      </head>
      <body className="overflow-x-hidden">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthGuard>
              <Outlet />
            </AuthGuard>
          </AuthProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
