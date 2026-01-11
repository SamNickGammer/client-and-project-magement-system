import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lead } from "@/utils/dto/lead";
import { Contact } from "@/components/crm/contacts/contact-columns";
import { useEffect, useState } from "react";
import { MultiSelect, Option } from "@/components/ui/multi-select";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Lead | null;
  onSubmit: (data: Partial<Lead> & { contactIds?: string[] }) => Promise<void>;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSubmit,
}: ClientFormDialogProps) {
  const isEditing = !!client;
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Dropdown options
  const [contactOptions, setContactOptions] = useState<Option[]>([]);

  // Fetch options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const contactRes = await fetch("/api/contacts");

        if (contactRes.ok) {
          const data = await contactRes.json();
          setContactOptions(
            data.map((c: Contact) => ({ label: c.name, value: c.id })),
          );
        }
      } catch (e) {
        console.error("Failed to fetch options", e);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (client) {
      setTitle(client.title);
      setCompany(client.company || "");
      setSelectedContactIds([]); // TODO: Pre-select contacts if available
    } else {
      // Reset
      setTitle("");
      setCompany("");
      setSelectedContactIds([]);
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        title,
        company,
        contactIds: selectedContactIds,
      } as any);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Client" : "Create Client"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update client details."
              : "Add a new client to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Name
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="col-span-3"
            />
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

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
