'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function CheckEmailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Confirm your email</h1>
        <p className="text-gray-600">
          We&apos;ve sent a confirmation email to your inbox. Please click the link in that email to activate your account.
        </p>
        <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700 w-full">
          Go to Login
        </Button>
        <p className="text-xs text-gray-500">
          Didn&apos;t receive it? Try checking your spam folder or sign up again with the correct email.
        </p>
      </div>
    </div>
  )
}
