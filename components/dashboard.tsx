"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { DataChart } from "@/components/data-chart"
import { fetchDashboardData, type MicropartnerData } from "@/lib/google-sheets"
import { Toaster } from "@/components/ui/toaster"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DashboardProps {
  onLogout: () => void
  user: { role: "admin" | "user"; name: string; id: string }
}

export function Dashboard({ onLogout, user }: DashboardProps) {
  const [data, setData] = useState<MicropartnerData[]>([])
  const [loading, setLoading] = useState(true)
  const [logoUrl, setLogoUrl] = useState("/ace-logo.jpg")

  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedConsignee, setSelectedConsignee] = useState<string>("all")
  const [openConsignee, setOpenConsignee] = useState(false)
  const [selectedAccountName, setSelectedAccountName] = useState<string>("all")
  const [openAccountName, setOpenAccountName] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"Beatwise" | "BaseCat">("BaseCat")

  const clearFilters = () => {
    setSelectedYear("all")
    setSelectedMonth("all")

    setSelectedConsignee("all")
    setOpenConsignee(false)
    setSelectedAccountName("all")
    setOpenAccountName(false)
    setSelectedEmployee("all")
  }

  // Fetch data
  useEffect(() => {
    fetchDashboardData().then((fetchedData) => {
      setData(fetchedData)
      setLoading(false)
    })

    // Load logo from storage
    const storedLogo = localStorage.getItem("app_logoUrl")
    if (storedLogo) {
      setLogoUrl(storedLogo)
    }

    // Listen for storage events (if user changes settings in another tab)
    const handleStorageChange = () => {
      const newLogo = localStorage.getItem("app_logoUrl")
      if (newLogo) setLogoUrl(newLogo)
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const filteredData = useMemo(() => {
    let result = data

    // Filter by User Role (Security)
    if (user.role === "user") {
      // Match Consignee in data with user.name (which is ConsigneeName)
      result = result.filter(item => item.consignee === user.name)
    }

    return result.filter((item) => {
      // Logic for filtering based on selections
      if (selectedYear !== "all" && item.year !== selectedYear) return false
      if (selectedMonth !== "all" && item.month !== selectedMonth) return false

      if (selectedEmployee !== "all" && item.employee !== selectedEmployee) return false
      if (selectedConsignee !== "all" && item.consignee !== selectedConsignee) return false
      if (selectedAccountName !== "all" && item.accountName !== selectedAccountName) return false
      return true
    })
  }, [data, user, selectedYear, selectedMonth, selectedEmployee, selectedConsignee, selectedAccountName])



  // Get unique values for filters (based on available data)
  // For non-admin users, we only show options relevant to their data
  const filterSourceData = useMemo(() => {
    if (user.role === "user") {
      return data.filter(item => item.consignee === user.name)
    }
    return data
  }, [data, user])

  const years = Array.from(new Set(filterSourceData.map((item) => item.year.trim()))).filter(Boolean).sort()
  // Sort months chronologically if possible, or just unique them.
  // A simple way to sort months if they are names (Jan, Feb...) is using a helper or just leaving them as is if order in sheet is consistent.
  // Here we just keep them unique.
  const months = useMemo(() => {
    let source = filterSourceData

    if (selectedYear !== "all") {
      source = source.filter((item) => item.year === selectedYear)
    }
    if (selectedConsignee !== "all") {
      source = source.filter((item) => item.consignee === selectedConsignee)
    }
    if (selectedAccountName !== "all") {
      source = source.filter((item) => item.accountName === selectedAccountName)
    }
    if (selectedEmployee !== "all") {
      source = source.filter((item) => item.employee === selectedEmployee)
    }

    return Array.from(new Set(source.map((item) => item.month.trim()))).filter(Boolean)
  }, [filterSourceData, selectedYear, selectedConsignee, selectedAccountName, selectedEmployee])

  const consigneeNames = Array.from(new Set(filterSourceData.map((item) => item.consignee.trim()))).filter(Boolean).sort()

  const employees = useMemo(() => {
    const source = selectedConsignee === "all"
      ? filterSourceData
      : filterSourceData.filter(item => item.consignee === selectedConsignee)

    return Array.from(new Set(source.map((item) => item.employee.trim()))).filter(Boolean).sort()
  }, [filterSourceData, selectedConsignee])

  const accountNames = useMemo(() => {
    const source = selectedConsignee === "all"
      ? filterSourceData
      : filterSourceData.filter(item => item.consignee === selectedConsignee)

    return Array.from(new Set(source.map((item) => item.accountName.trim()))).filter(Boolean).sort()
  }, [filterSourceData, selectedConsignee])

  // Calculate stats
  const totalAmount = filteredData.reduce((sum, item) => sum + item.totalAmt, 0)
  const totalRecords = filteredData.length
  const avgAmount = totalRecords > 0 ? totalAmount / totalRecords : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-200">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <div className="h-8 sm:h-10 flex-shrink-0">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200 rounded-full" />
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">Acemark Stationers</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate font-medium">Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{user.name}</p>
              <p className="text-xs text-slate-500 leading-none">ID: {user.id}</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-100 bg-transparent flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 flex-1">
        {/* Filters Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Data
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 h-8 text-xs font-medium px-3 rounded-full"
            >
              Reset All
            </Button>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md">
            {user.role === "admin" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Consignee</label>
                  <Popover open={openConsignee} onOpenChange={setOpenConsignee}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openConsignee}
                        className="w-full justify-between border-slate-300 h-8 text-xs font-normal"
                      >
                        <span className="truncate">
                          {selectedConsignee === "all"
                            ? "All Consignees"
                            : consigneeNames.find((name) => name === selectedConsignee) || "Select Consignee"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command className="w-full">
                        <CommandInput placeholder="Search consignee..." />
                        <CommandList>
                          <CommandEmpty>No consignee found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setSelectedConsignee("all")
                                setOpenConsignee(false)
                                setSelectedAccountName("all")
                                setSelectedEmployee("all")
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedConsignee === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              All Consignees
                            </CommandItem>
                            {consigneeNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  // We use the original name because currentValue might be normalized by cmdk
                                  setSelectedConsignee(name)
                                  setOpenConsignee(false)
                                  setSelectedAccountName("all")
                                  setSelectedEmployee("all")
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedConsignee === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Account Name</label>
                  <Popover open={openAccountName} onOpenChange={setOpenAccountName}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAccountName}
                        className="w-full justify-between border-slate-300 h-8 text-xs font-normal"
                      >
                        <span className="truncate">
                          {selectedAccountName === "all"
                            ? "All Accounts"
                            : accountNames.find((name) => name === selectedAccountName) || "Select Account"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command className="w-full">
                        <CommandInput placeholder="Search account..." />
                        <CommandList>
                          <CommandEmpty>No account found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setSelectedAccountName("all")
                                setOpenAccountName(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedAccountName === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              All Accounts
                            </CommandItem>
                            {accountNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  setSelectedAccountName(name)
                                  setOpenAccountName(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAccountName === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Employee</label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="border-slate-300 h-8 w-full text-xs">
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee} value={employee}>
                          {employee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Status</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as "Beatwise" | "BaseCat")}
                  >
                    <SelectTrigger className="border-slate-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 h-8 w-full text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beatwise">Beatwise</SelectItem>
                      <SelectItem value="BaseCat">BaseCat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="border-slate-300 h-8 w-full text-xs">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="border-slate-300 h-8 w-full text-xs">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Consignee Name</label>
                  <div className="h-8 w-full px-3 py-1.5 text-xs border border-slate-300 bg-slate-100 rounded-md flex items-center text-slate-700 truncate cursor-not-allowed">
                    {user.name}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Account Name</label>
                  <Popover open={openAccountName} onOpenChange={setOpenAccountName}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAccountName}
                        className="w-full justify-between border-slate-300 h-8 text-xs font-normal"
                      >
                        <span className="truncate">
                          {selectedAccountName === "all"
                            ? "All Accounts"
                            : accountNames.find((name) => name === selectedAccountName) || "Select Account"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command className="w-full">
                        <CommandInput placeholder="Search account..." />
                        <CommandList>
                          <CommandEmpty>No account found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setSelectedAccountName("all")
                                setOpenAccountName(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedAccountName === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              All Accounts
                            </CommandItem>
                            {accountNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  setSelectedAccountName(name)
                                  setOpenAccountName(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAccountName === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Status</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as "Beatwise" | "BaseCat")}
                  >
                    <SelectTrigger className="border-slate-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 h-8 w-full text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beatwise">Beatwise</SelectItem>
                      <SelectItem value="BaseCat">BaseCat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="border-slate-300 h-8 w-full text-xs">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="border-slate-300 h-8 w-full text-xs">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden rounded-2xl">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-violet-100 text-xs sm:text-sm">Total Amount</CardDescription>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                ₹{totalAmount.toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-violet-100">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Filtered Data</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white overflow-hidden rounded-2xl">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-fuchsia-100 text-xs sm:text-sm">Total Records</CardDescription>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">{totalRecords}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-fuchsia-100">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Active Entries</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-cyan-500 to-blue-600 text-white overflow-hidden sm:col-span-2 lg:col-span-1 rounded-2xl">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-cyan-100 text-xs sm:text-sm">Average Amount</CardDescription>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                ₹{avgAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span>Per Record</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <DataChart data={filteredData} status={selectedStatus} loading={loading} />

        {/* Table Section */}
        <DataTable data={filteredData} status={selectedStatus} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 sm:py-4 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Powered By - <a href="https://www.botivate.in/" target="_blank" rel="noopener noreferrer" className="font-bold text-violet-600 hover:underline">Botivate</a>
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
