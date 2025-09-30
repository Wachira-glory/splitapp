'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/context/AuthContext'
import { FcGoogle } from 'react-icons/fc'
import { toast } from "react-hot-toast"

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithGoogle } = useAuth()
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      await signup(email, password,fullName)
      router.push('/check-email')
    }catch (err: unknown) {
  let msg = 'Signup failed. Please try again.'
  
  if (err instanceof Error) {
    msg = err.message
  }

  toast.error(msg)

  if (msg === 'Email already exists. Please log in.') {
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }
}
 finally {
      setIsLoading(false)
    }
  }
  const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault()
  toast.error("Pasting is not allowed in password fields.")
}

  return (
    <div className="min-h-screen flex ">
  
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
          


            <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="mt-2 text-gray-600">Enter your email and password to sign up</p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 py-3 bg-transparent"
              type="button"
              onClick={signInWithGoogle} 
            >
              <FcGoogle className="w-5 h-5" />
              <span>Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="py-3"
                />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="py-3"
              />

              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPaste={handlePaste} 
                required
                className="py-3"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onPaste={handlePaste}
                required
                className="py-3"
              />

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3" disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>

            {error && <p className="text-center text-red-600 text-sm">{error}</p>}

            <div className="text-center">
              <Button variant="ghost" className="text-gray-600" onClick={() => router.push('/login')}>
                Already have an account? Login
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <a href="#" className="underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

    
    </div>
  )
}