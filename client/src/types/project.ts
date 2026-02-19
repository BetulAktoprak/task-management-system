export interface ProjectDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  createdBy: number;
  creatorName: string;
  taskCount: number;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProjectDto {
  name: string;
  description?: string;
  imageUrl?: string;
}
