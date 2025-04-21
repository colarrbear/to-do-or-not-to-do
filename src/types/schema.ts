// Common schema types
export type Status = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Todo {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  status: Status;
  priority: number;
  dueDate?: Date | null;
  photoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
}

export interface TodoWithTags extends Todo {
  tags: {
    tag: Tag;
  }[];
} 