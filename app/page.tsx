"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/login-page"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ role: "admin" | "user"; name: string; id: string } | null>(null)
  // Add loading state to prevent flash of login screen
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem("micropartner_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (e) {
        console.error("Failed to parse stored user", e)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (loggedInUser: { role: "admin" | "user"; name: string; id: string }) => {
    localStorage.setItem("micropartner_user", JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("micropartner_user")
    setIsAuthenticated(false)
    setUser(null)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} user={user} />
}
