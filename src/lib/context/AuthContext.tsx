"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "../../../types"
import { toast } from "react-hot-toast"
import { supabase } from "../supabaseClient"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, businessName?: string) => Promise<void> 
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>  
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const user = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || 'No name',
            avatar: session.user.user_metadata?.avatar_url || '/placeholder.svg?height=32&width=32',
          }
          setUser(user)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || 'No name',
          avatar: session.user.user_metadata?.avatar_url || '/placeholder.svg?height=32&width=32',
        }
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      if (!email || !password) {
        throw new Error("Email and password are required.")
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address.")
      }
   
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        toast.error(error.message || "Login failed")
        throw new Error(error.message)
      }

      const user = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || 'No name',
        avatar: data.user.user_metadata?.avatar_url || '/placeholder.svg?height=32&width=32',
      }

      setUser(user)
      toast.success("Login successful!")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, fullName: string, businessName?: string) => {
    setIsLoading(true)

    try {
      if (!email || !password || !fullName) {
        throw new Error("All fields are required.")
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address.")
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.")
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      if (!passwordRegex.test(password)) {
        throw new Error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // Fixed: was using 'name' instead of 'fullName'
            business_name: businessName || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`, // Add callback URL
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already been registered")) {
          toast.error("Email already exists. Please log in.")
          throw new Error("Email already exists. Please log in.")
        }
        toast.error(signUpError.message || "Signup failed")
        throw new Error(signUpError.message)
      }

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        toast.success("Signup successful! Please check your email to confirm your account.")
      } else if (data?.session) {
        toast.success("Signup successful! You are now logged in.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          queryParams: { prompt: "select_account" },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        toast.error(error.message || "Google sign-in failed")
        throw new Error(error.message)
      }
    } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Auth error:", err.message)
  } else {
    console.error("Auth error:", err)
  }
}

  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error: unknown) {
  toast.error("Error logging out")
  if (error instanceof Error) {
    console.error("Logout error:", error.message)
  } else {
    console.error("Logout error:", error)
  }
}

  }

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}