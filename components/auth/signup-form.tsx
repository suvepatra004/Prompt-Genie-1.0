"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"

interface SignupFormProps {
  onSignup: (name: string, email: string, password: string) => Promise<boolean>
  onSwitchToLogin: () => void
  isLoading: boolean
}

export function SignupForm({ onSignup, onSwitchToLogin, isLoading }: SignupFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    }
    return requirements
  }

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (!isPasswordValid) {
      setError("Password does not meet requirements")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const success = await onSignup(name, email, password)
      if (!success) {
        setError("Account creation failed. Email may already be in use.")
      }
    } catch (error) {
      setError("Signup failed. Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <p className="text-muted-foreground">Join PromptGenie and start creating amazing prompts</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {password && (
              <div className="space-y-1 text-xs">
                <div
                  className={`flex items-center gap-2 ${passwordRequirements.length ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordRequirements.length ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                  )}
                  At least 8 characters
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordRequirements.uppercase ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordRequirements.uppercase ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                  )}
                  One uppercase letter
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordRequirements.lowercase ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordRequirements.lowercase ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                  )}
                  One lowercase letter
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordRequirements.number ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {passwordRequirements.number ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                  )}
                  One number
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !isPasswordValid}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={onSwitchToLogin} className="text-sm">
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
