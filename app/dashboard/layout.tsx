import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background md:flex-row">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block md:w-64 md:border-r md:border-border md:bg-card">
        <Navigation variant="sidebar" />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-card">
        <Navigation variant="mobile" />
      </div>
    </div>
  )
}
