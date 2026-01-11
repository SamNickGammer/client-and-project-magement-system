"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Tag } from "lucide-react";
import { ClientProjectsTab } from "@/components/crm/clients/client-projects-tab";
import { LeadChatTab } from "@/components/crm/leads/lead-chat-tab";
import { Lead } from "@/utils/dto/lead";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClientDetailsProps {
  params: Promise<{ clientId: string }>;
}

export default function ClientDetailsPage({ params }: ClientDetailsProps) {
  const { clientId } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (!res.ok) throw new Error("Failed to fetch client");
        const data = await res.json();
        setClient(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load client details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  if (isLoading) return <div className="p-8">Loading client details...</div>;
  if (!client) return <div className="p-8">Client not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://avatar.vercel.sh/${client.title}`} />
            <AvatarFallback>{client.title[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{client.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {client.company && (
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" /> {client.company}
                </span>
              )}
              <Badge
                variant={client.status === "CLIENT" ? "default" : "secondary"}
                className="ml-2"
              >
                {client.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        defaultValue="overview"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b px-4">
          <TabsList className="bg-transparent h-12 w-full justify-start gap-6 rounded-none p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2"
            >
              Chat & Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {client.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tags:</span>
                    <div className="flex gap-1 flex-wrap">
                      {client.tags && client.tags.length > 0 ? (
                        client.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Value:</span>
                    <span>
                      {client.value ? `$${client.value.toLocaleString()}` : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {client.contacts && client.contacts.length > 0 ? (
                    <div className="space-y-3">
                      {client.contacts.map((c: any) => (
                        <div
                          key={c.contactId}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {c.contact?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">
                              {c.contact?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {c.contact?.email || ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No contacts linked.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-0 h-full">
            <ClientProjectsTab leadId={clientId} />
          </TabsContent>

          <TabsContent value="chat" className="mt-0 h-full">
            {/* Reusing LeadChatTab but wrapping it card or keeping full height */}
            <Card className="h-full border-0 shadow-none bg-background">
              <LeadChatTab
                apiEndpoint={`/api/clients/${clientId}/chat`}
                initialComments={(client.chatHistory as any) || []}
              />{" "}
              {/* Note: LeadChatTab posts to `/api/leads/[id]/chat`.
                  Since we are using the clients API redirect, this works.
              */}
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
