'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera,
  KeyRound,
  LogOut,
  Mail,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface SettingsFormProps {
  profile: {
    full_name?: string | null
    currency?: string | null
    monthly_budget?: number | null
  } | null

  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      name?: string
      avatar_url?: string
    }
  }
}

export function SettingsForm({
  profile,
  user,
}: SettingsFormProps) {
  const router = useRouter()
  const metadata = user.user_metadata ?? {}

  const [fullName, setFullName] = useState(
    profile?.full_name ||
      metadata.full_name ||
      metadata.name ||
      ''
  )

  const [avatarUrl, setAvatarUrl] = useState(
    metadata.avatar_url || ''
  )

  const [isUploadingAvatar, setIsUploadingAvatar] =
    useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState(user.email || '')
  const [password, setPassword] = useState('')

  const [currency, setCurrency] = useState(
    profile?.currency || 'USD'
  )

  const [monthlyBudget, setMonthlyBudget] = useState(
    profile?.monthly_budget?.toString() || ''
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  /*
   * Upload avatar
   */
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        'Choose a JPG, PNG, WebP, or GIF image.'
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        'Avatar images must be 5 MB or smaller.'
      )
      return
    }

    setIsUploadingAvatar(true)

    try {
      const supabase = createClient()

      const extension =
        file.name.split('.').pop()?.toLowerCase() || 'jpg'

      const path = `${user.id}/avatar.${extension}`

      const { error: uploadError } =
        await supabase.storage
          .from('avatars')
          .upload(path, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: true,
          })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      setAvatarUrl(
        `${data.publicUrl}?v=${Date.now()}`
      )

      toast.success(
        'Avatar uploaded. Save your profile to apply it.'
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to upload avatar.'
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  /*
   * Save profile
   */
  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    const budget =
      monthlyBudget.trim() === ''
        ? 0
        : Number(monthlyBudget)

    /*
     * Validation
     */
    if (!fullName.trim()) {
      toast.error('Enter a profile name.')
      return
    }

    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      toast.error('Enter a valid email address.')
      return
    }

    if (
      password &&
      password.length < 8
    ) {
      toast.error(
        'Your new password must be at least 8 characters.'
      )
      return
    }

    if (
      !Number.isFinite(budget) ||
      budget < 0
    ) {
      toast.error(
        'Enter a valid monthly budget.'
      )
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      const currentEmail =
        (user.email ?? '').toLowerCase()

      const emailChanged =
        normalizedEmail !== currentEmail

      const authChanged =
        emailChanged || Boolean(password)

      /*
       * Update Supabase Auth
       */
      const { error: authError } =
        await supabase.auth.updateUser({
          ...(emailChanged
            ? { email: normalizedEmail }
            : {}),

          ...(password
            ? { password }
            : {}),

          data: {
            ...metadata,
            full_name: fullName.trim(),
            avatar_url: avatarUrl.trim(),
          },
        })

      if (authError) {
        throw authError
      }

      /*
       * Update profile table
       */
      const { error: profileError } =
        await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            currency,
            monthly_budget: budget,
          })
          .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      setPassword('')

      toast.success(
        authChanged && emailChanged
          ? 'Profile saved. Check your email to confirm the new address.'
          : 'Profile saved successfully.'
      )

      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save profile changes.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  /*
   * Delete account
   */
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account and all associated data? This cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()

      const { error } =
        await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast.success('You have been signed out.')

      router.replace('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to delete the account.'
      )

      setIsDeleting(false)
    }
  }

  /*
   * Logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const supabase = createClient()

      const { error } =
        await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast.success('You have been signed out.')

      router.replace('/auth/login')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to sign out.'
      )

      setIsLoggingOut(false)
    }
  }

  /*
   * Profile initials
   */
  const initials = (
    fullName ||
    email ||
    'U'
  )
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 md:space-y-6 xl:grid xl:grid-cols-[1fr_360px] xl:gap-6 xl:space-y-0">

      {/* =========================
          PROFILE INFORMATION
      ========================== */}
      <div className="min-w-0">
        <Card className="w-full">

          <CardHeader className="px-4 py-5 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              Profile information
            </CardTitle>

            <CardDescription className="text-sm">
              Update how your account appears across Xpnd.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">

            <form
              onSubmit={handleSave}
              className="space-y-5"
            >

              {/* =========================
                  PROFILE AVATAR
              ========================== */}
              <div className="flex flex-col items-center rounded-xl border bg-muted/30 px-4 py-6 text-center sm:py-7">

                {/* Avatar */}
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xl font-semibold text-primary ring-2 ring-background sm:size-28">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${fullName || 'Profile'} avatar`}
                      className="size-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Profile Name */}
                <p className="mt-4 max-w-full truncate text-base font-semibold sm:text-lg">
                  {fullName || 'Your Profile'}
                </p>

                {/* Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-10"
                  onClick={() =>
                    avatarInputRef.current?.click()
                  }
                  disabled={
                    isSaving ||
                    isUploadingAvatar
                  }
                >
                  <Camera
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />

                  {isUploadingAvatar
                    ? 'Uploading...'
                    : 'Upload image'}
                </Button>

                {/* File Requirements */}
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  JPG, PNG, WebP, or GIF up to 5 MB.
                </p>

                <input
                  ref={avatarInputRef}
                  id="avatarUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="sr-only"
                />

              </div>

              {/* =========================
                  PROFILE NAME + EMAIL
              ========================== */}
              <div className="grid grid-cols-1 gap-5">

                {/* Profile Name */}
                <div>
                  <Label htmlFor="fullName">
                    Profile name
                  </Label>

                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    disabled={isSaving}
                    placeholder="Your name"
                    className="mt-2 h-11"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">
                    Email address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    disabled={isSaving}
                    className="mt-2 h-11"
                  />
                </div>

              </div>

              {/* Email notice */}
              <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">

                <Mail
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />

                <span>
                  Changing your email may require confirmation.
                </span>

              </div>

              {/* =========================
                  PASSWORD
              ========================== */}
              <div>

                <Label htmlFor="password">
                  New password
                </Label>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={isSaving}
                  placeholder="Leave blank to keep current password"
                  className="mt-2 h-11 text-base placeholder:text-sm sm:placeholder:text-sm"
                />

              </div>

              {/* =========================
                  SAVE BUTTON
              ========================== */}
              <Button
                type="submit"
                disabled={isSaving}
                className="h-11 w-full sm:w-auto"
              >
                {isSaving
                  ? 'Saving changes...'
                  : 'Save profile changes'}
              </Button>

            </form>

          </CardContent>

        </Card>
      </div>

      {/* =========================
          RIGHT COLUMN
      ========================== */}
      <div className="min-w-0 space-y-5 md:space-y-6">

        {/* =========================
            ACCOUNT SECURITY
        ========================== */}
        <Card>

          <CardHeader className="px-4 py-5 sm:px-6">

            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">

              <KeyRound
                className="size-4 shrink-0"
                aria-hidden="true"
              />

              Account security

            </CardTitle>

            <CardDescription className="text-sm leading-5">
              Your password is updated securely through Supabase Auth.
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-3 px-4 pb-5 text-sm leading-5 text-muted-foreground sm:px-6 sm:pb-6">

            <p>
              Use a unique password with at least 8 characters.
            </p>

            <p>
              Changes to email and password may trigger a confirmation email.
            </p>

          </CardContent>

        </Card>

        {/* =========================
            DELETE ACCOUNT
        ========================== */}
        <Card className="border-destructive/30">

          <CardHeader className="px-4 py-5 sm:px-6">

            <CardTitle className="flex items-center gap-2 text-base text-destructive sm:text-lg">

              <ShieldAlert
                className="size-4 shrink-0"
                aria-hidden="true"
              />

              Delete account

            </CardTitle>

            <CardDescription className="text-sm leading-5">
              Permanently remove your account and associated data.
            </CardDescription>

          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">

            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="h-11 w-full"
            >
              {isDeleting
                ? 'Processing...'
                : 'Delete my account'}
            </Button>

            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
              This action cannot be undone.
            </p>

          </CardContent>

        </Card>

        {/* =========================
            MOBILE LOGOUT
        ========================== */}
        <div className="md:hidden">

          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-11 w-full"
          >
            <LogOut
              className="mr-2 size-4"
              aria-hidden="true"
            />

            {isLoggingOut
              ? 'Logging out...'
              : 'Log out'}
          </Button>

        </div>

      </div>

    </div>
  )
}