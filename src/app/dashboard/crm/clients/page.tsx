"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientDataTable } from "@/components/crm/clients/client-data-table";
import { ClientFormDialog } from "@/components/crm/clients/client-form-dialog";
import { columns } from "@/components/crm/clients/client-columns";
import { Lead } from "@/utils/dto/lead";

export default function ClientsPage() {
  const [clients, setClients] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Lead | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load clients");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (client: Lead) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Lead>) => {
    try {
      if (editingClient) {
        // Edit logic
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Client updated successfully");
      } else {
        // Create logic
        const res = await fetch("/api/clients", {
          method: "POST",
          body: JSON.stringify({ ...data, status: "CLIENT" }),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Client created successfully");
      }

      // Refresh list
      await fetchClients();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  // Define columns with meta handler
  // Note: To pass handlers to columns efficiently, we typically use table meta,
  // but for simplicity here we assume the columns definition handles it or we'd
  // need to reconstruct columns here to pass `handleEdit`.
  // The current columns.tsx implementation tries to use `table.options.meta`.
  // We need to pass meta to the DataTable.

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-64">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
      </div>

      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ClientDataTable
            columns={columns}
            data={clients}
            onAddClick={handleCreate}
            meta={{ onEdit: handleEdit }}
          />
        )}
      </div>

      <ClientFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Temporary ignore while resolving form dialog types
        client={editingClient as any}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onSubmit={handleSubmit}
      />
    </div>
  );
}
