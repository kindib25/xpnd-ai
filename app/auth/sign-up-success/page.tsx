import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
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
              <CardTitle className="text-2xl">Account Created!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your account has been created successfully.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your email to confirm your account before logging in.
                </p>
              </div>
              <Link href="/auth/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
