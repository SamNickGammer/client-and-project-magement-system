"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Lead } from "./lead-columns"
import { useEffect, useState } from "react"
import { MultiSelect, Option } from "@/components/ui/multi-select"

interface LeadFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead | null;
    onSubmit: (data: Partial<Lead> & { contactIds?: string[] }) => Promise<void>;
}

export function LeadFormDialog({ open, onOpenChange, lead, onSubmit }: LeadFormDialogProps) {
    const isEditing = !!lead;
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<Lead['status']>("NEW");
    const [value, setValue] = useState<string>("");
    const [assignedToId, setAssignedToId] = useState<string>("");
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

    // Dropdown options
    const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);
    const [contactOptions, setContactOptions] = useState<Option[]>([]);

    // Fetch options on mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [empRes, contactRes] = await Promise.all([
                    fetch('/api/employees'),
                    fetch('/api/contacts')
                ]);
                
                if (empRes.ok) {
                    const data = await empRes.json();
                    setEmployees(data);
                }
                
                if (contactRes.ok) {
                    const data = await contactRes.json();
                    setContactOptions(data.map((c: any) => ({ label: c.name, value: c.id })));
                }
            } catch (e) {
                console.error("Failed to fetch options", e);
            }
        }
        fetchOptions();
    }, []);

    useEffect(() => {
        if (lead) {
            setTitle(lead.title);
            setDescription(lead.description || "");
            setStatus(lead.status);
            setValue(lead.value ? lead.value.toString() : "");
            setAssignedToId(lead.assignedToId || "");
            setSelectedContactIds(lead.contacts.map(c => c.contact.id));
        } else {
            // Reset
            setTitle("");
            setDescription("");
            setStatus("NEW");
            setValue("");
            setAssignedToId("");
            setSelectedContactIds([]);
        }
    }, [lead, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({
                title,
                description,
                status,
                value: value ? parseFloat(value) : undefined,
                assignedToId: assignedToId || null,
                contactIds: selectedContactIds
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Lead" : "Create Lead"}</DialogTitle>
            <DialogDescription>
                {isEditing ? "Update lead details." : "Add a new lead to the pipeline."}
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="QUALIFIED">Qualified</SelectItem>
                            <SelectItem value="CONVERTED" disabled>Converted</SelectItem>
                            <SelectItem value="LOST">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">Value ($)</Label>
                    <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3" placeholder="0.00" />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                    <Select value={assignedToId} onValueChange={setAssignedToId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Contacts</Label>
                    <div className="col-span-3">
                        <MultiSelect
                            options={contactOptions}
                            selected={selectedContactIds}
                            onChange={setSelectedContactIds}
                            placeholder="Select contacts..."
                        />
                    </div>
                </div>

                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                </div>

            <DialogFooter>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save details"}</Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    )
}
