"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Lead, getLeadColumns } from "@/components/crm/leads/lead-columns"
import { LeadDataTable } from "@/components/crm/leads/lead-data-table"
import { LeadCard } from "@/components/crm/leads/lead-card"
import { LeadFormDialog } from "@/components/crm/leads/lead-form-dialog"

export default function LeadsPage() {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<"table" | "grid">("table")
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/leads")
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setLeads(data)
        } catch (error) {
            toast.error("Failed to load leads")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleCreate = () => {
        setSelectedLead(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (lead: Lead) => {
        setSelectedLead(lead)
        setIsDialogOpen(true)
    }

    const handleDelete = async (leadId: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return

        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Lead deleted")
            fetchLeads()
        } catch (error) {
            toast.error("Failed to delete lead")
        }
    }

    const handleConvert = async (lead: Lead) => {
        if (!confirm(`Convert "${lead.title}" to a Client? This will create a new Client and copy all contacts.`)) return

        try {
            const res = await fetch(`/api/leads/${lead.id}/convert`, {
                method: "POST",
            })
            if (!res.ok) {
                 const data = await res.json();
                 throw new Error(data.error || "Failed to convert")
            }
            toast.success("Lead converted to Client successfully!")
            fetchLeads()
            // Optionally redirect to clients page
            // router.push('/dashboard/crm/clients')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleSubmit = async (data: Partial<Lead> & { contactIds?: string[] }) => {
        try {
            const url = selectedLead ? `/api/leads/${selectedLead.id}` : "/api/leads"
            const method = selectedLead ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json();

             if (!res.ok) {
                 if(result.error && typeof result.error === 'object') {
                     const errors = Object.values(result.error.fieldErrors).flat().join(", ");
                     throw new Error(errors || "Validation Failed")
                 }
                 throw new Error(result.error || "Operation failed")
            }

            toast.success(selectedLead ? "Lead updated" : "Lead created")
            fetchLeads()
        } catch (error: any) {
            toast.error(error.message)
            throw error;
        }
    }

    const columns = getLeadColumns({ onEdit: handleEdit, onDelete: handleDelete, onConvert: handleConvert })

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 relative">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 lg:px-6">
                <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
                <div className="flex items-center gap-2">
                    <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "table" | "grid")}>
                        <ToggleGroupItem value="table" aria-label="Table view">
                            <List className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="grid" aria-label="Grid view">
                            <LayoutGrid className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </div>
            </div>

            <div className="px-4 lg:px-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">Loading...</div>
                ) : viewMode === "table" ? (
                    <LeadDataTable columns={columns} data={leads} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {leads.map((lead) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onConvert={handleConvert}
                            />
                        ))}
                    </div>
                )}
            </div>

            <LeadFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                lead={selectedLead}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
