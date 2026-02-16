export interface ProjectDto {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  creatorName: string;
  taskCount: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name: string;
  description?: string;
}
