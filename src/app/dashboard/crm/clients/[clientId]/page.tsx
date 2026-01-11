"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Edit2, Save, X } from "lucide-react";
import { ClientProjectsTab } from "@/components/crm/clients/client-projects-tab";
import { LeadChatSidebar } from "@/components/crm/lead-chat-sidebar";
import { Lead } from "@/utils/dto/lead";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { TipTapEditor } from "@/components/common/tiptap-editor";
import { ActionItemsTab } from "@/components/crm/leads/lead-action-items-tab";
import { LeadAttachmentsTab } from "@/components/crm/leads/lead-attachments-tab";

interface ClientDetailsProps {
  params: Promise<{ clientId: string }>;
}

export default function ClientDetailsPage({ params }: ClientDetailsProps) {
  const { clientId } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editable State
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descContent, setDescContent] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleContent, setTitleContent] = useState("");

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (!res.ok) throw new Error("Failed to fetch client");
        const data = await res.json();
        setClient(data);
        setDescContent(data.description || "");
        setTitleContent(data.title || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load client details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  const handleUpdate = async (field: Partial<Lead>) => {
    try {
      // Use Lead API directly for updates since they are Leads.
      const res = await fetch(`/api/leads/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify(field),
      });

      if (!res.ok) throw new Error("Update failed");

      setClient((prev) => (prev ? { ...prev, ...field } : null));
      toast.success("Updated successfully");
      return true;
    } catch {
      toast.error("Failed to update");
      return false;
    }
  };

  const saveDescription = async () => {
    const success = await handleUpdate({ description: descContent });
    if (success) setIsEditingDesc(false);
  };

  const saveTitle = async () => {
    const success = await handleUpdate({ title: titleContent });
    if (success) setIsEditingTitle(false);
  };

  if (isLoading) return <div className="p-8">Loading client details...</div>;
  if (!client) return <div className="p-8">Client not found</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/5">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          {/* Header / Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="pl-0 gap-2 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Clients
            </Button>
          </div>

          {/* Editable Title */}
          <div className="group flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1 max-w-lg">
                <Input
                  value={titleContent}
                  onChange={(e) => setTitleContent(e.target.value)}
                  autoFocus
                />
                <Button size="icon" onClick={saveTitle}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${client.title}`}
                    />
                    <AvatarFallback>{client.title[0]}</AvatarFallback>
                  </Avatar>
                  <h1
                    className="text-3xl font-bold tracking-tight text-foreground cursor-pointer"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {client.title}
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </>
            )}
            <Badge
              variant={client.status === "CLIENT" ? "default" : "secondary"}
            >
              {client.status}
            </Badge>
          </div>

          {/* Details & Description Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Meta info */}
            <div className="space-y-4 text-sm bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-4">
                Client Information
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium flex items-center gap-1">
                    <Building className="h-3 w-3" /> {client.company || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium">
                    {client.value
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(client.value)
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Account Mgr</span>
                  <div className="flex items-center gap-2">
                    {client.assignedTo?.image && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={client.assignedTo.image} />
                        <AvatarFallback>
                          {client.assignedTo.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="font-medium">
                      {client.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contacts List Mini-View */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 text-xs uppercase text-muted-foreground">
                  Contacts
                </h4>
                {client.contacts && client.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {client.contacts.map((c) => (
                      <div
                        key={c.contactId}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {c.contact?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="truncate font-medium">
                            {c.contact?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.contact?.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No contacts linked
                  </p>
                )}
              </div>
            </div>

            {/* Description (Editable) */}
            <div className="md:col-span-2 bg-card p-6 rounded-xl border shadow-sm group relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                  Description / Notes
                </h3>
                {!isEditingDesc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <TipTapEditor
                    content={descContent}
                    onChange={setDescContent}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDesc(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveDescription}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground cursor-pointer hover:bg-muted/30 p-2 -m-2 rounded transition-colors"
                  onClick={() => setIsEditingDesc(true)}
                >
                  <TipTapEditor
                    content={client.description || "No description provided."}
                    onChange={() => {}}
                    editable={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="pt-4">
            <Tabs defaultValue="projects" className="w-full">
              <div className="border-b">
                <TabsList className="bg-transparent h-auto p-0 space-x-1 pb-2">
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="action-items">Action Items</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="projects" className="pt-6">
                {/* Pass leadId (which is clientId) */}
                <ClientProjectsTab
                  leadId={clientId}
                  projects={client.projects}
                />
              </TabsContent>

              <TabsContent value="action-items" className="pt-6">
                <ActionItemsTab leadId={clientId} />
              </TabsContent>

              <TabsContent value="attachments" className="pt-6">
                <LeadAttachmentsTab leadId={clientId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Activity / Chat */}
      <aside className="border-l bg-background flex flex-col shrink-0 w-80">
        <div className="p-4 border-b bg-muted/10 font-medium text-sm">
          Activity & Chat
        </div>
        <div className="flex-1 min-h-0">
          <LeadChatSidebar
            initialComments={client.chatHistory || []}
            leadId={clientId}
          />
        </div>
      </aside>
    </div>
  );
}
