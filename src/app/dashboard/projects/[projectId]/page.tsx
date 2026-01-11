"use client";

import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import { Project } from "@/utils/dto/project";
import { Task } from "@/utils/dto/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/crm/projects/kanban-board";
import { TaskListView } from "@/components/crm/projects/task-list-view";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  LayoutList,
  Kanban as KanbanIcon,
} from "lucide-react";
import { CreateTaskDialog } from "@/components/crm/tasks/create-task-dialog";

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Failed to fetch project", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return <div className="p-8">Loading project details...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-8 py-6 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.title}
              </h1>
              <Badge variant="outline" className="text-sm">
                {project.status || "Active"}
              </Badge>
            </div>
            {project.lead && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Client: {project.lead.title}</span>
                {project.lead.company && (
                  <span className="text-muted-foreground/60">
                    • {project.lead.company}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CreateTaskDialog
              projectId={project.id}
              onTaskCreated={fetchProject}
            />
          </div>
        </div>

        <p className="text-muted-foreground max-w-3xl mb-6">
          {project.description || "No description provided."}
        </p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {project.startDate
                ? format(new Date(project.startDate), "MMM d, yyyy")
                : "TBD"}
              {" - "}
              {project.endDate
                ? format(new Date(project.endDate), "MMM d, yyyy")
                : "TBD"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 pt-6">
        <Tabs defaultValue="list" className="h-full space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <LayoutList className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <KanbanIcon className="h-4 w-4" />
                Board
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="h-full border rounded-lg p-0">
            <TaskListView project={project} onUpdate={fetchProject} />
          </TabsContent>

          <TabsContent value="kanban" className="h-full">
            <KanbanBoard project={project} onUpdate={fetchProject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
