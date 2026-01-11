import { Task } from "./task";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  leadId: string;
  lead?: { id: string; title: string; company?: string | null };
  tasks?: Task[];
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  leadId: string;
}
