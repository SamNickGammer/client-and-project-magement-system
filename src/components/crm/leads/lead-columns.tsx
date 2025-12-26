"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Contact } from "../contacts/contact-columns";

// Define types based on API response
export type Lead = {
  id: string;
  title: string;
  description: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
  value: number | null;
  assignedToId: string | null;
  assignedTo?: { name: string } | null;
  contacts: { contact: Contact }[];
  createdAt: string;
};

interface LeadColumnsProps {
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onConvert: (lead: Lead) => void;
}

export const getLeadColumns = ({
  onEdit,
  onDelete,
  onConvert,
}: LeadColumnsProps): ColumnDef<Lead>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "CONVERTED" ? "secondary" : "default"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("value"));
      if (isNaN(value)) return "-";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },
  },
  {
    // Assiged To Column
    id: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const lead = row.original;
      return lead.assignedTo ? lead.assignedTo.name : "-";
    },
  },
  {
    // Contacts Column
    id: "contacts",
    header: "Contacts",
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="flex -space-x-2">
          {lead.contacts.slice(0, 3).map((c) => (
            <div
              key={c.contact.id}
              title={c.contact.name}
              className="relative h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] overflow-hidden"
            >
              {c.contact.image ? (
                <Image
                  src={c.contact.image}
                  alt={c.contact.name}
                  fill
                  className="object-cover"
                />
              ) : (
                c.contact.name.charAt(0)
              )}
            </div>
          ))}
          {lead.contacts.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
              +{lead.contacts.length - 3}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onConvert(lead)}
              disabled={lead.status === "CONVERTED"}
            >
              <ArrowRightCircle className="mr-2 h-4 w-4" />
              Convert to Client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(lead)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(lead.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
