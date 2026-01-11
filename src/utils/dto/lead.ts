export interface ChatReaction {
  emoji: string;
  count: number;
  userIds: string[]; // Track who reacted
}

export interface ChatComment {
  id: string;
  content: string; // HTML content
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
  createdAt: string;
  updatedAt?: string;
  reactions: ChatReaction[];
  replies: ChatComment[];
}

export type ChatMutationPayload =
  | { type: "comment"; content: string }
  | { type: "reply"; parentId: string; content: string }
  | { type: "reaction"; parentId: string; emoji: string };

export interface LeadAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  uploadedBy?: string | null;
  leadId: string;
}

export interface Lead {
  id: string;
  title: string;
  description: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST" | "CLIENT";
  value: number | null;
  company: string | null;
  createdAt: string;
  updatedAt: string;
  assignedToId: string | null;
  tags: string[];
  chatHistory: ChatComment[];
  attachments?: LeadAttachment[];
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  contacts?: {
    contactId: string;
    contact: {
      id: string;
      name: string;
      email: string | null;
      image: string | null;
      position: string | null;
    };
  }[];
  projects?: {
    id: string;
    title: string;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
    tasks: { status: string }[];
    assignments: {
      employee: {
        id: string;
        name: string;
        image: string | null;
      };
    }[];
  }[];
}
