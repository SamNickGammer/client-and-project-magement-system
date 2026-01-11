"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/crm/projects/create-project-dialog";
import { Project } from "@/utils/dto/project";
import Link from "next/link";
import { format } from "date-fns";
import { Users, Calendar } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 px-4 md:px-8 lg:px-12 xl:px-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all ongoing projects.
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/5 border-dashed">
          <p className="text-muted-foreground mb-4">No projects found</p>
          <CreateProjectDialog onProjectCreated={fetchProjects} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary/50 hover:border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">
                        {project.title}
                      </CardTitle>
                      {project.lead && (
                        <CardDescription className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.lead.title}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={
                        project.status === "Completed" ? "secondary" : "default"
                      }
                    >
                      {project.status || "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                      {project.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.endDate
                            ? format(new Date(project.endDate), "MMM d, yyyy")
                            : "No deadline"}
                        </span>
                      </div>
                      <div className="text-xs">
                        {project.tasks?.length || 0} tasks
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
