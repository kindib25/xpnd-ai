'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, KeyRound, LogOut, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { NotificationsSettings } from '@/components/notifications-settings'
import { AppearanceSettings } from '@/components/appearance-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface SettingsFormProps {
  profile: { full_name?: string | null; currency?: string | null; monthly_budget?: number | null } | null
  user: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string; avatar_url?: string } }
}

export function SettingsForm({ profile, user }: SettingsFormProps) {
  const router = useRouter()
  const metadata = user.user_metadata ?? {}

  const [fullName, setFullName] = useState(profile?.full_name || metadata.full_name || metadata.name || '')
  const [avatarUrl, setAvatarUrl] = useState(metadata.avatar_url || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const [currency, setCurrency] = useState(profile?.currency || 'USD')
  const [monthlyBudget, setMonthlyBudget] = useState(profile?.monthly_budget?.toString() || '')

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Choose a JPG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar images must be 5 MB or smaller.')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const supabase = createClient()
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar.${extension}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(`${data.publicUrl}?v=${Date.now()}`)
      toast.success('Avatar uploaded. Save your profile to apply it.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to upload avatar.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const budget = monthlyBudget.trim() === '' ? 0 : Number(monthlyBudget)

    if (!fullName.trim()) return toast.error('Enter a profile name.')
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return toast.error('Enter a valid email address.')
    if (password && password.length < 8) return toast.error('Your new password must be at least 8 characters.')
    if (!Number.isFinite(budget) || budget < 0) return toast.error('Enter a valid monthly budget.')

    setIsSaving(true)
    try {
      const supabase = createClient()
      const currentEmail = (user.email ?? '').toLowerCase()
      const emailChanged = normalizedEmail !== currentEmail
      const authChanged = emailChanged || Boolean(password)

      const { error: authError } = await supabase.auth.updateUser({
        ...(emailChanged ? { email: normalizedEmail } : {}),
        ...(password ? { password } : {}),
        data: { ...metadata, full_name: fullName.trim(), avatar_url: avatarUrl.trim() },
      })
      if (authError) throw authError

      const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName.trim(), currency, monthly_budget: budget }).eq('id', user.id)
      if (profileError) throw profileError

      setPassword('')
      toast.success(authChanged && emailChanged ? 'Profile saved. Check your email to confirm the new address.' : 'Profile saved successfully.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save profile changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account and all associated data? This cannot be undone.')) return
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('You have been signed out.')
      router.replace('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete the account.')
      setIsDeleting(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('You have been signed out.')
      router.replace('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out.')
      setIsLoggingOut(false)
    }
  }

  const initials = (fullName || email || 'U').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      {/* AMBIENT BACKGROUND */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-background transition-colors duration-500 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#30333a_0%,#1a1d22_42%,#13161a_72%,#0f1115_100%)]" 
        />
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 dark:bg-primary/15 blur-[130px]" />
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[140px]" />
      </div>

      <div className="relative isolate mx-auto w-full max-w-6xl space-y-5 md:space-y-6 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6 xl:space-y-0">
        <div className="min-w-0 space-y-5 md:space-y-6">
          
          {/* PROFILE INFORMATION */}
          <Card className="relative w-full overflow-hidden rounded-[26px] border border-border bg-card/80 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/65 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-foreground/[0.01] dark:from-white/[0.045] dark:to-white/[0.01]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <CardHeader className="relative z-10 border-b border-border px-4 py-5 sm:px-6 sm:py-6 dark:border-white/[0.07]">
              <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">Profile information</CardTitle>
              <CardDescription className="text-sm leading-5 text-muted-foreground dark:text-white/45">Update how your account appears across Xpnd.</CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 px-4 pb-5 sm:px-6 sm:pb-6">
              <form onSubmit={handleSave} className="space-y-5">
                
                {/* AVATAR */}
                <div className="relative flex flex-col items-center overflow-hidden rounded-[22px] border border-border bg-foreground/[0.02] px-4 py-6 text-center shadow-sm sm:py-7 dark:border-white/[0.09] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-primary/[0.02] dark:from-white/[0.035] dark:to-primary/[0.025]" />
                  
                  <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/10 text-xl font-semibold text-primary shadow-sm ring-4 ring-primary/5 sm:size-28">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="size-full object-cover" /> : initials}
                  </div>

                  <p className="relative mt-4 max-w-full truncate text-base font-semibold text-foreground sm:text-lg dark:text-white">{fullName || 'Your Profile'}</p>

                  <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={isSaving || isUploadingAvatar} className="relative mt-3 h-10 rounded-xl border-border bg-background text-foreground shadow-sm hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:border-white/[0.12] dark:bg-white/[0.045] dark:text-white/80">
                    <Camera className="mr-2 size-4" /> {isUploadingAvatar ? 'Uploading...' : 'Upload image'}
                  </Button>

                  <p className="relative mt-2 text-xs leading-5 text-muted-foreground dark:text-white/40">JPG, PNG, WebP, or GIF up to 5 MB.</p>
                  <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="sr-only" />
                </div>

                {/* NAME & EMAIL */}
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-foreground/80 dark:text-white/75">Profile name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSaving} placeholder="Your name" className="mt-2 h-11 rounded-xl border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/20 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80 dark:text-white/75">Email address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} className="mt-2 h-11 rounded-xl border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/20 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25" />
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2.5 text-xs leading-5 text-muted-foreground dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/45">
                  <Mail className="mt-0.5 size-3.5 shrink-0 text-primary/80" /> <span>Changing your email may require confirmation.</span>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-foreground/80 dark:text-white/75">New password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSaving} placeholder="Leave blank to keep current password" className="mt-2 h-11 rounded-xl border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/20 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25" />
                </div>

                <Button type="submit" disabled={isSaving} className="h-11 w-full rounded-xl border border-primary/30 bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 sm:w-auto">
                  {isSaving ? 'Saving changes...' : 'Save profile changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* APPEARANCE */}
          <Card className="relative w-full overflow-hidden rounded-[26px] border border-border bg-card/80 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/65 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader className="relative z-10 border-b border-border px-4 py-5 sm:px-6 sm:py-6 dark:border-white/[0.07]">
              <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">Appearance</CardTitle>
              <CardDescription className="text-sm leading-5 text-muted-foreground dark:text-white/45">Personalize how Xpnd AI looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-4 pb-5 pt-6 sm:px-6 sm:pb-6">
              <AppearanceSettings />
            </CardContent>
          </Card>

          <div className="relative mt-5 overflow-hidden rounded-[26px] border border-border bg-card/60 shadow-sm backdrop-blur-[28px] md:mt-6 dark:border-white/[0.10] dark:bg-[#11131c]/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_55px_-35px_rgba(0,0,0,0.8)] [&>div]:border-0 [&>div]:bg-transparent [&>div]:shadow-none">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <NotificationsSettings />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="min-w-0 space-y-5 md:space-y-6">
          <Card className="relative overflow-hidden rounded-[26px] border border-border bg-card/80 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/65 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.04]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/20" />

            <CardHeader className="relative z-10 border-b border-border px-4 py-5 sm:px-6 dark:border-white/[0.07]">
              <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                <KeyRound className="size-4 shrink-0 text-primary/80" /> Account security
              </CardTitle>
              <CardDescription className="text-sm leading-5 text-muted-foreground dark:text-white/45">Your password is updated securely through Supabase Auth.</CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-3 px-4 pb-5 pt-5 text-sm leading-5 text-muted-foreground sm:px-6 sm:pb-6 dark:text-white/55">
              <p>Use a unique password with at least 8 characters.</p>
              <p>Changes to email and password may trigger a confirmation email.</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-[26px] border border-red-200 bg-red-50/50 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-red-400/[0.20] dark:bg-[#171219]/70 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/[0.02] via-transparent to-transparent dark:from-red-400/[0.045]" />

            <CardHeader className="relative z-10 border-b border-red-100 px-4 py-5 sm:px-6 dark:border-white/[0.07]">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-600 sm:text-lg dark:text-red-300">
                <ShieldAlert className="size-4 shrink-0 text-red-600 dark:text-red-300" /> Delete account
              </CardTitle>
              <CardDescription className="text-sm leading-5 text-red-500/80 dark:text-white/45">Permanently remove your account and associated data.</CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 px-4 pb-5 pt-5 sm:px-6 sm:pb-6">
              <Button type="button" variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="h-11 w-full rounded-xl border border-red-200 bg-red-100 text-red-600 shadow-sm hover:bg-red-200 hover:text-red-700 dark:border-red-400/20 dark:bg-red-500/[0.09] dark:text-red-200 dark:hover:border-red-400/35 dark:hover:bg-red-500/[0.16] dark:hover:text-red-100">
                {isDeleting ? 'Processing...' : 'Delete my account'}
              </Button>
              <p className="mt-3 text-center text-xs leading-5 text-red-400 dark:text-white/40">This action cannot be undone.</p>
            </CardContent>
          </Card>

          <div className="md:hidden">
            <Button type="button" variant="outline" onClick={handleLogout} disabled={isLoggingOut} className="h-11 w-full rounded-xl border-border bg-background text-foreground hover:bg-foreground/5 dark:border-white/[0.12] dark:bg-white/[0.035] dark:text-white/75 dark:hover:bg-white/[0.07] dark:hover:text-white">
              <LogOut className="mr-2 size-4" /> {isLoggingOut ? 'Logging out...' : 'Log out'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}