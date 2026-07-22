import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Xpnd</h1>
            <p className="text-sm text-muted-foreground mt-2">Smart expense tracking with AI</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-red-600">
                Authentication Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {params?.error
                  ? `Error: ${params.error}`
                  : 'An error occurred during authentication. Please try again.'}
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/auth/login">
                  <Button className="w-full">Back to Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="outline" className="w-full">Create Account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
