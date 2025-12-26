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
  clientId: string;
}
