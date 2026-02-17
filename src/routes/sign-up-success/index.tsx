import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, Typography } from '@mui/material'

export const Route = createFileRoute('/sign-up-success/')({
  component: SignUpSuccess,
})

function SignUpSuccess() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Typography className="text-2xl">
                Thank you for signing up!
              </Typography>
              <Typography>Check your email to confirm</Typography>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
