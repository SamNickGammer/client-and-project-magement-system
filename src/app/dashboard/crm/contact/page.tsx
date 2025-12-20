"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Contact, getContactColumns } from "@/components/crm/contacts/contact-columns"
import { ContactDataTable } from "@/components/crm/contacts/contact-data-table"
import { ContactCard } from "@/components/crm/contacts/contact-card"
import { ContactFormDialog } from "@/components/crm/contacts/contact-form-dialog"

export default function ContactsPage() {
    const [viewMode, setViewMode] = useState<"table" | "grid">("table")
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

    const fetchContacts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/contacts")
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setContacts(data)
        } catch (error) {
            toast.error("Failed to load contacts")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    const handleCreate = () => {
        setSelectedContact(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact)
        setIsDialogOpen(true)
    }

    const handleDelete = async (contactId: string) => {
        if (!confirm("Are you sure you want to delete this contact?")) return

        try {
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Contact deleted")
            fetchContacts()
        } catch (error) {
            toast.error("Failed to delete contact")
        }
    }

    const handleSubmit = async (data: Partial<Contact>) => {
        try {
            const url = selectedContact ? `/api/contacts/${selectedContact.id}` : "/api/contacts"
            const method = selectedContact ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json();

            if (!res.ok) {
                 if(result.error && typeof result.error === 'object') {
                     // Zod error format
                     const errors = Object.values(result.error.fieldErrors).flat().join(", ");
                     throw new Error(errors || "Validation Failed")
                 }
                 throw new Error(result.error || "Operation failed")
            }

            toast.success(selectedContact ? "Contact updated" : "Contact created")
            fetchContacts()
        } catch (error:any) {
            toast.error(error.message)
            throw error; // Re-throw to keep dialog open or handle loading state there
        }
    }

    const columns = getContactColumns({ onEdit: handleEdit, onDelete: handleDelete })

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 relative">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 lg:px-6">
                <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
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
                        <Plus className="mr-2 h-4 w-4" /> Add Contact
                    </Button>
                </div>
            </div>

            <div className="px-4 lg:px-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">Loading...</div>
                ) : viewMode === "table" ? (
                    <ContactDataTable columns={columns} data={contacts} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {contacts.map((contact) => (
                            <ContactCard
                                key={contact.id}
                                contact={contact}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ContactFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                contact={selectedContact}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
