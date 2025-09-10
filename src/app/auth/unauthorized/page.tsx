import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">CenterGuessr</h1>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription>
              Only users with @cdtm.com email addresses are allowed to access CenterGuessr.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">
              Please sign in with your CDTM Google account or contact an administrator if you believe this is an error.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">
                Try Again
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}