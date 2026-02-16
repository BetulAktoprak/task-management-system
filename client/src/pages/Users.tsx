import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import RequireRole from '../components/RequireRole';
import { userService } from '../services/api';
import type { UserDto, RoleDto } from '../types/user';

export default function Users() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, rolesData] = await Promise.all([
        userService.getUsers(),
        userService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Veriler yüklenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    setAssigningUserId(userId);
    try {
      await userService.assignRole(userId, roleId);
      toast.success('Rol başarıyla atandı.');
      loadData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Rol atanırken bir hata oluştu.'
      );
    } finally {
      setAssigningUserId(null);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Project Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Developer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loading message="Kullanıcılar yükleniyor..." />;
  }

  return (
    <RequireRole
      roles={['Admin']}
      fallback={
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-red-800">
            Bu sayfayı görüntülemek için Admin yetkisine sahip olmalısınız.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="mt-2 text-gray-600">
            Kullanıcıları listeleyin ve rolleri atayın
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mevcut Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol Ata
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.roleName)}`}
                    >
                      {user.roleName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="block w-full max-w-[180px] rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={user.roleId}
                      disabled={assigningUserId === user.id}
                      onChange={(e) =>
                        handleAssignRole(user.id, parseInt(e.target.value))
                      }
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {assigningUserId === user.id && (
                      <span className="ml-2 text-xs text-gray-500">
                        Kaydediliyor...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Henüz kullanıcı bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
