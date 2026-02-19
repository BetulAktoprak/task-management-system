import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import { taskService, projectService, userService } from '../services/api';
import type { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../types/task';
import type { ProjectDto } from '../types/project';
import type { UserDto } from '../types/user';

const STATUS_COLUMNS: {
  status: TaskStatus;
  label: string;
  color: string;
  gradient: string;
  icon: string;
}[] = [
  {
    status: 0,
    label: 'Yapılacaklar',
    color: 'bg-gray-100',
    gradient: 'from-gray-500 to-gray-600',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    status: 1,
    label: 'Devam Ediyor',
    color: 'bg-blue-100',
    gradient: 'from-blue-500 to-indigo-600',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    status: 2,
    label: 'Tamamlandı',
    color: 'bg-green-100',
    gradient: 'from-emerald-500 to-green-600',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

export default function TaskBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectLoading, setProjectLoading] = useState(true);
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
    if (!projectId) return;
    setProjectLoading(true);
    setLoading(true);
    loadProject();
    loadTasks();
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
      const data = await projectService.getProjectById(parseInt(projectId || '0'));
      setProject(data);
    } catch (err: unknown) {
      const errorMessage = 'Proje yüklenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProjectLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setError('');
      const data = await taskService.getTasksByProject(parseInt(projectId || '0'));
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
      setLoading(true);
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
      setLoading(true);
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

  if (loading || projectLoading) {
    return <Loading message="Görevler yükleniyor..." />;
  }

  if (!project && !projectLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-4">Proje bulunamadı.</p>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-5 h-5"
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-3 font-medium transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-lg text-gray-600">{project.description}</p>
          )}
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yeni Görev
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          return (
            <div key={column.status} className="flex flex-col">
              {/* Column Header */}
              <div
                className={`bg-gradient-to-r ${column.gradient} rounded-t-xl p-4 shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={column.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {column.label}
                      </h3>
                      <span className="text-sm text-white/80">
                        {columnTasks.length} görev
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column Body */}
              <div className="bg-gray-50 rounded-b-xl p-4 min-h-[500px] space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-4 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    {task.assignedUserName && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {task.assignedUserName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {task.assignedUserName}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-gray-100">
                      {STATUS_COLUMNS.map((col) => {
                        if (col.status === task.status) return null;
                        return (
                          <button
                            key={col.status}
                            onClick={() => handleStatusChange(task.id, col.status)}
                            className={`text-xs px-3 py-1.5 bg-gradient-to-r ${col.gradient} text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium`}
                          >
                            {col.label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => openDeleteTaskConfirm(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto font-medium"
                        title="Görevi sil"
                      >
                        {deletingTaskId === task.id ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          'Sil'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-xl flex items-center justify-center opacity-50">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                      Bu sütunda görev yok
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setFormData({
                title: '',
                description: '',
                projectId: parseInt(projectId || '0'),
                status: 0,
                assignedUserId: undefined,
              });
              setError('');
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Yeni Görev Oluştur
                </h2>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Görev bilgilerini doldurarak başlayın
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTask}>
              <div className="px-6 py-6 space-y-5">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <div className="flex items-center gap-2 text-sm text-red-800">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Görev Başlığı{' '}
                      <span className="text-red-500 font-normal">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="title"
                      type="text"
                      required
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Örn: Login sayfası tasarla"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Açıklama
                    </div>
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Görev hakkında detaylı bilgi yazın..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                    <div className="absolute left-3 top-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description?.length || 0} karakter
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Durum
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {STATUS_COLUMNS.map((col) => (
                      <button
                        key={col.status}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            status: col.status,
                          })
                        }
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.status === col.status
                            ? `border-indigo-500 bg-gradient-to-br ${col.gradient} text-white shadow-lg scale-105`
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              formData.status === col.status
                                ? 'bg-white/20'
                                : `bg-gradient-to-br ${col.gradient}`
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 ${
                                formData.status === col.status
                                  ? 'text-white'
                                  : 'text-white'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={col.icon}
                              />
                            </svg>
                          </div>
                          <span
                            className={`text-xs font-semibold ${
                              formData.status === col.status
                                ? 'text-white'
                                : 'text-gray-700'
                            }`}
                          >
                            {col.label}
                          </span>
                        </div>
                        {formData.status === col.status && (
                          <div className="absolute top-2 right-2">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="assignedUserId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Atanacak Kişi
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      id="assignedUserId"
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white appearance-none cursor-pointer"
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {formData.assignedUserId && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {usersForAssignment
                            .find((u) => u.id === formData.assignedUserId)
                            ?.name.charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <span>
                        {
                          usersForAssignment.find(
                            (u) => u.id === formData.assignedUserId
                          )?.name
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
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
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-white transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Oluştur
                    </>
                  )}
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
