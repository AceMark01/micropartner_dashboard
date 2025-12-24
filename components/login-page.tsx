"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Eye, EyeOff, Settings } from "lucide-react"
import GridBackgroundDemo from "@/components/ui/grid-background-demo"

interface LoginPageProps {
  onLogin: (user: { role: "admin" | "user"; name: string; id: string }) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // State for settings
  const [companyName, setCompanyName] = useState("Acemark Stationers")
  const [logoUrl, setLogoUrl] = useState("/ace-logo.jpg") // Default to new logo

  const [showAdminSettings, setShowAdminSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false) // hydration fix
  const { toast } = useToast()

  // Load settings from localStorage on mount
  React.useEffect(() => {
    setIsClient(true)
    const storedName = localStorage.getItem("app_companyName")
    const storedLogo = localStorage.getItem("app_logoUrl")
    if (storedName) setCompanyName(storedName)
    if (storedLogo) setLogoUrl(storedLogo)
  }, [])

  // Save settings when changed
  const updateSettings = (name: string, logo: string) => {
    setCompanyName(name)
    setLogoUrl(logo)
    localStorage.setItem("app_companyName", name)
    localStorage.setItem("app_logoUrl", logo)
    // Dispatch a custom event so duplicate tabs or other components update if listening (optional but good practice)
    window.dispatchEvent(new Event("storage"))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Hardcoded Admin Login
      if (username === "admin" && password === "admin") {
        toast({
          title: "Login Successful",
          description: `Welcome Admin to ${companyName}!`,
        })
        onLogin({ role: "admin", name: "Administrator", id: "admin" })
        return
      }

      // Fetch users from Google Sheet
      const { fetchUsers } = await import("@/lib/google-sheets")
      const users = await fetchUsers()

      const foundUser = users.find(u => {
        // Robust comparison: convert to string, trim
        const userId = String(u.ID || "").trim()
        const userPass = String(u.Password || "").trim()

        return userId === username.trim() && userPass === password.trim()
      })

      if (foundUser) {
        const consigneeName = (foundUser.Consigneename || foundUser.ConsigneeName || foundUser["Consignee Name"] || "User").trim()

        toast({
          title: "Login Successful",
          description: `Welcome ${consigneeName}!`,
        })
        onLogin({
          role: String(foundUser.ID).trim() === "admin" ? "admin" : "user",
          name: consigneeName,
          id: String(foundUser.ID).trim()
        })
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please check your ID and Password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Login Error",
        description: "Failed to connect to the database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return null // Prevent hydration mismatch for localstorage dependent content initially
  }

  return (
    <div className="w-full h-screen flex overflow-hidden bg-white">
      {/* Left Side - Hero / Logo */}
      {/* Left Side - Hero / Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50 overflow-hidden">
        <GridBackgroundDemo>
          {/* Big Logo */}
          <div className="relative z-10 w-full max-w-[500px] aspect-square flex items-center justify-center p-8">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Company Logo"
                className="w-full h-auto object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105 rounded-3xl"
              />
            ) : (
              <div className="text-4xl font-bold text-slate-300">Logo</div>
            )}
          </div>
        </GridBackgroundDemo>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 bg-white relative">
        <div className="w-full max-w-[420px] space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />}
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tighter text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access <span className="font-semibold text-slate-900">{companyName}</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : "Sign In"}
            </Button>
          </form>

          {/* Admin Settings */}
          {username === "admin" && password === "admin" && (
            <div className="pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setShowAdminSettings(!showAdminSettings)}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Settings className="h-4 w-4" />
                {showAdminSettings ? "Close Settings" : "Admin Settings"}
              </button>

              {showAdminSettings && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => updateSettings(e.target.value, logoUrl)}
                      className="h-9 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={(e) => updateSettings(companyName, e.target.value)}
                      className="h-9 bg-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-8 text-center">
            <p className="text-xs text-slate-400">Powered by <a href="https://botivate.in" target="_blank" className="font-medium hover:text-blue-600 transition-colors">Botivate</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
