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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

// Mock data until specific project schema/api is confirmed fully working
// In real app, this would be fetched via React Query based on clientId
interface ProjectStats {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  onHoldTasks: number;
  status: string;
  dueDate: string;
}

export function ClientProjectsTab({ leadId }: { leadId: string }) {
  const [projects, setProjects] = useState<ProjectStats[]>([]);

  useEffect(() => {
    // Simulate fetch - replace with real API call later
    const timer = setTimeout(() => {
      setProjects([
        {
          id: "1",
          title: "Website Redesign",
          totalTasks: 12,
          completedTasks: 5,
          pendingTasks: 5,
          onHoldTasks: 2,
          status: "In Progress",
          dueDate: "2024-12-31",
        },
        {
          id: "2",
          title: "Mobile App Phase 1",
          totalTasks: 45,
          completedTasks: 20,
          pendingTasks: 25,
          onHoldTasks: 0,
          status: "Active",
          dueDate: "2025-03-15",
        },
      ]);
    }, 500);

    return () => clearTimeout(timer);
  }, [leadId]);

  return (
    <div className="h-[600px] flex flex-col gap-4">
      <ScrollArea className="h-full">
        <div className="grid grid-cols-1 gap-4 p-1">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>
                      Due: {format(new Date(project.dueDate), "MMM dd, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-sm font-medium mr-2">
                    Tasks Breakdown:
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 cursor-help">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm text-muted-foreground">
                            {project.totalTasks}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total Tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 cursor-help">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm text-muted-foreground">
                            {project.completedTasks}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Completed Tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 cursor-help">
                          <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600" />
                          <span className="text-sm text-muted-foreground">
                            {project.pendingTasks}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pending Tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 cursor-help">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm text-muted-foreground">
                            {project.onHoldTasks}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>On Hold Tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
