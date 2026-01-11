import { TaskStatus } from "@/generated/prisma";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: string | null;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  // assignments: TaskAssignment[]; // TODO: Define TaskAssignment if needed
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: string;
  projectId: string;
  order?: number;
}
