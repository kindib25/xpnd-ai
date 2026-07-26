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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border bg-card">
        <Navigation variant="sidebar" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-card">
        <Navigation variant="mobile" />
      </div>
    </div>
  )
}
