"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead } from "@/utils/dto/lead";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TipTapEditor } from "@/components/common/tiptap-editor";
import { LeadChatSidebar } from "@/components/crm/lead-chat-sidebar";
import { LeadAttachmentsTab } from "@/components/crm/leads/lead-attachments-tab";
import { ActionItemsTab } from "@/components/crm/leads/lead-action-items-tab";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LeadDetailsPage() {
  const params = useParams();
  const leadId = params.leadId as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable State
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descContent, setDescContent] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleContent, setTitleContent] = useState("");

  const fetchLead = useCallback(async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setLead(data);
      setDescContent(data.description || "");
      setTitleContent(data.title || "");
    } catch (error) {
      console.error("Error loading lead:", error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) fetchLead();
  }, [leadId, fetchLead]);

  const handleUpdateLead = async (field: Partial<Lead>) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify(field),
      });
      if (!res.ok) throw new Error("Update failed");

      setLead((prev) => (prev ? { ...prev, ...field } : null));
      toast.success("Updated successfully");
      return true;
    } catch {
      toast.error("Failed to update");
      return false;
    }
  };

  const saveDescription = async () => {
    const success = await handleUpdateLead({ description: descContent });
    if (success) setIsEditingDesc(false);
  };

  const saveTitle = async () => {
    const success = await handleUpdateLead({ title: titleContent });
    if (success) setIsEditingTitle(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!lead) return <div className="p-8">Lead not found</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* 
          Main Layout: 
          Left: Main Content (Scrollable)
          Right: Chat Sidebar (Fixed width)
      */}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/5">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          {/* Header / Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="pl-0 gap-2 hover:bg-transparent hover:text-primary"
            >
              <Link href="/dashboard/crm/leads">
                <ArrowLeft className="h-4 w-4" /> Back to Leads
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Convert to Client
              </Button>
            </div>
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
                <h1
                  className="text-3xl font-bold tracking-tight text-foreground"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {lead.title}
                </h1>
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
              variant={lead.status === "CONVERTED" ? "secondary" : "default"}
            >
              {lead.status}
            </Badge>
          </div>

          {/* Details & Description Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Meta info */}
            <div className="space-y-4 text-sm bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider mb-4">
                Client Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{lead.company || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(lead.value || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Assigned To</span>
                  <div className="flex items-center gap-2">
                    {lead.assignedTo?.image && (
                      <Image
                        src={lead.assignedTo.image}
                        alt={lead.assignedTo.name || "Assigned User"}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full"
                      />
                    )}
                    <span className="font-medium">
                      {lead.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description (Editable) */}
            <div className="md:col-span-2 bg-card p-6 rounded-xl border shadow-sm group relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                  Description
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
                    content={lead.description || "No description."}
                    onChange={() => {}}
                    editable={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="pt-4">
            <Tabs defaultValue="action-items" className="w-full">
              <div className="border-b">
                <TabsList className="bg-transparent h-auto p-0 space-x-1 pb-2">
                  <TabsTrigger value="action-items">Action Items</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="action-items" className="pt-6">
                <ActionItemsTab leadId={leadId} />
              </TabsContent>

              <TabsContent value="attachments" className="pt-6">
                <LeadAttachmentsTab
                  leadId={leadId}
                  attachments={lead.attachments}
                  onRefresh={fetchLead}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Activity / Chat */}
      <aside className="border-l bg-background flex flex-col shrink-0">
        <div className="p-4 border-b bg-muted/10 font-medium text-sm">
          Activity & Chat
        </div>
        <div className="flex-1 min-h-0">
          <LeadChatSidebar
            initialComments={lead.chatHistory || []}
            leadId={leadId}
          />
        </div>
      </aside>
    </div>
  );
}
