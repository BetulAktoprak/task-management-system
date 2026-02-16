import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import { taskService, projectService, userService } from '../services/api';
import type { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../types/task';
import type { ProjectDto } from '../types/project';
import type { UserDto } from '../types/user';

const STATUS_COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 0, label: 'Yapılacaklar', color: 'bg-gray-100' },
  { status: 1, label: 'Devam Ediyor', color: 'bg-blue-100' },
  { status: 2, label: 'Tamamlandı', color: 'bg-green-100' },
];

export default function TaskBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: '',
    description: '',
    projectId: parseInt(projectId || '0'),
    status: 0,
    assignedUserId: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [usersForAssignment, setUsersForAssignment] = useState<UserDto[]>([]);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTasks();
    }
  }, [projectId]);

  const loadUsersForAssignment = async () => {
    try {
      const data = await userService.getUsersForAssignment();
      setUsersForAssignment(data);
    } catch {
      setUsersForAssignment([]);
    }
  };

  const loadProject = async () => {
    try {
      const data = await projectService.getProjectById(
        parseInt(projectId || '0')
      );
      setProject(data);
    } catch (err: any) {
      const errorMessage = 'Proje yüklenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getTasksByProject(
        parseInt(projectId || '0')
      );
      setTasks(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Görevler yüklenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await taskService.createTask(formData);
      toast.success('Görev başarıyla oluşturuldu!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        projectId: parseInt(projectId || '0'),
        status: 0,
        assignedUserId: undefined,
      });
      loadTasks();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Görev oluşturulurken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updateDto: UpdateTaskDto = {
        title: task.title,
        description: task.description || '',
        status: newStatus,
      };

      await taskService.updateTask(taskId, updateDto);
      toast.success('Görev durumu güncellendi!');
      loadTasks();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Görev güncellenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const getTasksByStatus = (status: TaskStatus): TaskDto[] => {
    return tasks.filter((task) => task.status === status);
  };

  const openDeleteTaskConfirm = (taskId: number) => {
    setTaskToDelete(taskId);
  };

  const handleConfirmDeleteTask = async () => {
    if (taskToDelete == null) return;
    setDeletingTaskId(taskToDelete);
    try {
      await taskService.deleteTask(taskToDelete);
      setTaskToDelete(null);
      toast.success('Görev silindi.');
      loadTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Görev silinirken bir hata oluştu.');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const openCreateModal = () => {
    loadUsersForAssignment();
    setShowCreateModal(true);
  };

  if (loading) {
    return <Loading message="Görevler yükleniyor..." />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Proje bulunamadı.</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Projelere Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="text-indigo-600 hover:text-indigo-700 mb-2 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Projelere Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-gray-600">{project.description}</p>
          )}
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Yeni Görev
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          return (
            <div key={column.status} className="flex flex-col">
              <div className={`${column.color} rounded-t-lg p-4`}>
                <h3 className="font-semibold text-gray-900">
                  {column.label}
                </h3>
                <span className="text-sm text-gray-600">
                  {columnTasks.length} görev
                </span>
              </div>
              <div className="bg-gray-50 rounded-b-lg p-4 min-h-[400px] space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {task.assignedUserName && (
                      <div className="text-xs text-gray-500 mb-3">
                        👤 {task.assignedUserName}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {STATUS_COLUMNS.map((col) => {
                        if (col.status === task.status) return null;
                        return (
                          <button
                            key={col.status}
                            onClick={() => handleStatusChange(task.id, col.status)}
                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            {col.label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => openDeleteTaskConfirm(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 ml-auto"
                        title="Görevi sil"
                      >
                        {deletingTaskId === task.id ? '...' : 'Sil'}
                      </button>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    Bu sütunda görev yok
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Yeni Görev Oluştur
            </h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Görev Başlığı *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Görev başlığını girin"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Görev açıklamasını girin"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Durum
                  </label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: parseInt(e.target.value) as TaskStatus,
                      })
                    }
                  >
                    {STATUS_COLUMNS.map((col) => (
                      <option key={col.status} value={col.status}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="assignedUserId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Atanacak Kişi
                  </label>
                  <select
                    id="assignedUserId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.assignedUserId ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedUserId: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  >
                    <option value="">Atama yapılmadı</option>
                    {usersForAssignment.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      projectId: parseInt(projectId || '0'),
                      status: 0,
                      assignedUserId: undefined,
                    });
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Görevi sil"
        message="Bu görevi silmek istediğinize emin misiniz?"
        confirmLabel="Sil"
        cancelLabel="İptal"
        variant="danger"
        loading={deletingTaskId !== null}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
