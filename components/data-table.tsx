"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { MicropartnerData } from "@/lib/google-sheets"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps {
  data: MicropartnerData[]
  status: "Beatwise" | "BaseCat"
}

export function DataTable({ data, status }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
              <svg
                className="w-5 h-5 text-fuchsia-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{status} Data Table</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Detailed view of all records</CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 border-0 w-fit flex-shrink-0"
          >
            {data.length} Records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100">
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap min-w-[70px]">
                    Year
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap min-w-[80px]">
                    Month
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap min-w-[150px]">
                    Account Name
                  </TableHead>
                  {status === "Beatwise" ? (
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap min-w-[120px]">
                      Account Beat
                    </TableHead>
                  ) : (
                    <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm whitespace-nowrap min-w-[120px]">
                      Base Cat
                    </TableHead>
                  )}
                  <TableHead className="font-semibold text-slate-700 text-right text-xs sm:text-sm whitespace-nowrap min-w-[110px]">
                    Total Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500 text-xs sm:text-sm">
                      No data found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-violet-50/50 transition-colors">
                      <TableCell className="font-medium text-xs sm:text-sm">{row.year}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{row.month}</TableCell>
                      <TableCell className="font-medium text-slate-900 text-xs sm:text-sm">{row.accountName}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {status === "Beatwise" ? (
                          <Badge
                            variant="outline"
                            className="border-violet-300 text-violet-700 text-[10px] sm:text-xs whitespace-nowrap"
                          >
                            {row.accountBeat}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-fuchsia-300 text-fuchsia-700 text-[10px] sm:text-xs whitespace-nowrap"
                          >
                            {row.baseCat}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                        ₹{row.totalAmt.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {
        totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      }
    </Card >
  )
}
