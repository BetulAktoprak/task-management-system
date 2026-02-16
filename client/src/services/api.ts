import axios from 'axios';
import type { LoginDto, RegisterDto, TokenDto } from '../types/auth';
import type { DashboardDto } from '../types/dashboard';
import type {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
} from '../types/project';
import type {
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
} from '../types/task';
import type { UserDto, RoleDto } from '../types/user';

const API_BASE_URL = 'http://localhost:5227/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 durumunda token temizleme
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // authUtils import edilemez (circular dependency), bu yüzden direkt localStorage kullanıyoruz
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (loginDto: LoginDto): Promise<TokenDto> => {
    const response = await apiClient.post<TokenDto>('/auth/login', loginDto);
    return response.data;
  },

  register: async (registerDto: RegisterDto): Promise<TokenDto> => {
    const response = await apiClient.post<TokenDto>('/auth/register', registerDto);
    return response.data;
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardDto> => {
    const response = await apiClient.get<DashboardDto>('/dashboard/stats');
    return response.data;
  },
};

export const projectService = {
  getProjects: async (): Promise<ProjectDto[]> => {
    const response = await apiClient.get<ProjectDto[]>('/projects');
    return response.data;
  },

  getProjectById: async (id: number): Promise<ProjectDto> => {
    const response = await apiClient.get<ProjectDto>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (
    createProjectDto: CreateProjectDto
  ): Promise<ProjectDto> => {
    const response = await apiClient.post<ProjectDto>(
      '/projects',
      createProjectDto
    );
    return response.data;
  },

  updateProject: async (
    id: number,
    updateProjectDto: UpdateProjectDto
  ): Promise<ProjectDto> => {
    const response = await apiClient.put<ProjectDto>(
      `/projects/${id}`,
      updateProjectDto
    );
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

export const taskService = {
  getTasks: async (): Promise<TaskDto[]> => {
    const response = await apiClient.get<TaskDto[]>('/tasks');
    return response.data;
  },

  getTasksByProject: async (projectId: number): Promise<TaskDto[]> => {
    const response = await apiClient.get<TaskDto[]>(
      `/tasks/project/${projectId}`
    );
    return response.data;
  },

  getTaskById: async (id: number): Promise<TaskDto> => {
    const response = await apiClient.get<TaskDto>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (createTaskDto: CreateTaskDto): Promise<TaskDto> => {
    const response = await apiClient.post<TaskDto>('/tasks', createTaskDto);
    return response.data;
  },

  updateTask: async (
    id: number,
    updateTaskDto: UpdateTaskDto
  ): Promise<TaskDto> => {
    const response = await apiClient.put<TaskDto>(
      `/tasks/${id}`,
      updateTaskDto
    );
    return response.data;
  },

  assignTask: async (
    id: number,
    assignTaskDto: AssignTaskDto
  ): Promise<void> => {
    await apiClient.put(`/tasks/${id}/assign`, assignTaskDto);
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export const userService = {
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>('/users/me');
    return response.data;
  },

  getUsers: async (): Promise<UserDto[]> => {
    const response = await apiClient.get<UserDto[]>('/users');
    return response.data;
  },

  getUsersForAssignment: async (): Promise<UserDto[]> => {
    const response = await apiClient.get<UserDto[]>('/users/for-assignment');
    return response.data;
  },

  getRoles: async (): Promise<RoleDto[]> => {
    const response = await apiClient.get<RoleDto[]>('/users/roles');
    return response.data;
  },

  assignRole: async (userId: number, roleId: number): Promise<void> => {
    await apiClient.put(`/users/${userId}/role`, null, {
      params: { roleId },
    });
  },
};

export default apiClient;
