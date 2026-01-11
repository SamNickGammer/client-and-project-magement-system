"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lead } from "@/utils/dto/lead";
import { CreateProjectDialog } from "@/components/crm/projects/create-project-dialog";

interface ClientProjectsTabProps {
  leadId: string;
  projects?: Lead["projects"];
  onRefresh?: () => void;
}

export function ClientProjectsTab({
  projects = [],
  leadId,
  onRefresh,
}: ClientProjectsTabProps) {
  return (
    <div className="h-[600px] flex flex-col gap-4">
      <div className="flex justify-end items-center px-1">
        <CreateProjectDialog leadId={leadId} onProjectCreated={onRefresh} />
      </div>
      <ScrollArea className="h-full">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
            <p>No projects found for this client.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-1">
            {projects.map((project) => {
              // Calculate task stats
              const totalTasks = project.tasks.length;
              const completedTasks = project.tasks.filter(
                (t) => t.status === "COMPLETED" || t.status === "DONE",
              ).length;
              const pendingTasks = project.tasks.filter(
                (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
              ).length;
              const onHoldTasks = project.tasks.filter(
                (t) => t.status === "ON_HOLD",
              ).length; // Adjust status string as needed based on Enum

              return (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow gap-2"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                        <CardDescription>
                          {project.startDate
                            ? format(
                                new Date(project.startDate),
                                "MMM dd, yyyy",
                              )
                            : "Start TBD"}{" "}
                          -{" "}
                          {project.endDate
                            ? format(new Date(project.endDate), "MMM dd, yyyy")
                            : "End TBD"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {project.status || "Active"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
                      {/* Task Breakdown */}
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium mr-2">
                          Tasks Breakdown:
                        </div>

                        <div className="flex items-center gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 cursor-help">
                                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                                  <span className="text-sm text-muted-foreground">
                                    {totalTasks}
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
                                    {completedTasks}
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
                                    {pendingTasks}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Pending Tasks</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {onHoldTasks > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1 cursor-help">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <span className="text-sm text-muted-foreground">
                                      {onHoldTasks}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>On Hold Tasks</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      {/* Assignments */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Team:
                        </span>
                        <div className="flex -space-x-2">
                          {project.assignments &&
                          project.assignments.length > 0 ? (
                            project.assignments.map((assign, idx) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                      <AvatarImage
                                        src={assign.employee?.image || ""}
                                      />
                                      <AvatarFallback>
                                        {assign.employee?.name?.[0] || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{assign.employee?.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              No team assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
