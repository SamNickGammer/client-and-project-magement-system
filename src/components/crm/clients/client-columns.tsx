"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type Client = {
  id: string
  name: string
  company: string | null
  status: string | null
  createdAt: string
  projects: any[]
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("status") || "Active"}</Badge>
  },
  {
    id: "projects",
    header: "Projects",
    cell: ({ row }) => {
        const count = row.original.projects.length
        return <span>{count} Project{count !== 1 ? 's' : ''}</span>
    }
  },
]
