"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Target,
  Briefcase,
  Contact,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead } from "@/utils/dto/lead";

interface DashboardStats {
  totalClients: number;
  activeLeads: number;
  totalContacts: number;
  recentLeads: Lead[];
  recentClients: Lead[];
}

export default function CRMDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/crm");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 px-64">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Overview</h1>
          <p className="text-muted-foreground">
            Manage your clients, leads, and pipeline from here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/crm/leads?new=true">
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/crm/contacts?new=true">
              <Contact className="mr-2 h-4 w-4" /> Add Contact
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={Briefcase}
          description="Active accounts managed"
        />
        <StatsCard
          title="Active Leads"
          value={stats?.activeLeads || 0}
          icon={Target}
          description="Potential opportunities"
        />
        <StatsCard
          title="Total Contacts"
          value={stats?.totalContacts || 0}
          icon={Users}
          description="People in your network"
        />
      </div>

      {/* Recent Lists */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Leads */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>
              New opportunities added to the pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLeadsList leads={stats?.recentLeads || []} />
          </CardContent>
        </Card>

        {/* Recent Clients (or maybe Top Clients?) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Recently converted accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentClientsList clients={stats?.recentClients || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function RecentLeadsList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No recent leads.</div>
    );
  }
  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{lead.title[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{lead.title}</p>
              <p className="text-xs text-muted-foreground">
                {lead.company || "No Company"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{lead.status}</Badge>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/dashboard/crm/leads/${lead.id}`}>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentClientsList({ clients }: { clients: Lead[] }) {
  if (clients.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No recent clients.</div>
    );
  }
  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={`https://avatar.vercel.sh/${client.title}`}
                alt={client.title}
              />
              <AvatarFallback>{client.title[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{client.title}</p>
              <p className="text-xs text-muted-foreground">
                {client.value
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(client.value)
                  : "-"}
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/dashboard/crm/clients/${client.id}`}>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-7">
        <Skeleton className="col-span-4 h-64" />
        <Skeleton className="col-span-3 h-64" />
      </div>
    </div>
  );
}
