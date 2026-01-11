"use client";

import { Project } from "@/utils/dto/project";
import { Task } from "@/utils/dto/task";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TaskListViewProps {
  project: Project;
  onUpdate: () => void;
}

export function TaskListView({ project, onUpdate }: TaskListViewProps) {
  const tasks = project.tasks || [];

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={task.status === "DONE" ? "default" : "outline"}
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>{task.priority || "Normal"}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? format(new Date(task.dueDate), "MMM d, yyyy")
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
