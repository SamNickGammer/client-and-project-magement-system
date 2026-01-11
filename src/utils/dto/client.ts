import { Project } from "./project";

export interface Client {
  id: string;
  name: string;
  company: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  chatHistory?: any;
  tags?: string[];
  description?: string | null;
  value?: number | null;
  contacts?: any[];
  assignedTo?: any;
}
