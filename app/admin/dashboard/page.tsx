'use client';

import { useEffect, useState } from 'react';
import { getAuthEmail } from '@/lib/session';
import { useAuthGuard } from '@/lib/useAuth';
import { adminApi } from '@/lib/api';
import { toastError } from '@/lib/useToast';

interface User {
  userId: number;
  email: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalAdmins: number;
}

export default function AdminDashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Waits for the refresh-cookie token restore before guarding, so a
  // browser refresh no longer bounces a logged-in admin to /admin/login.
  const authReady = useAuthGuard({
    loginPath: '/admin/login',
    requireAdmin: true,
  });

  useEffect(() => {
    if (!authReady) return;

    setEmail(getAuthEmail());

    fetchDashboard();
    fetchUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  const fetchDashboard = async () => {
    try {
      const data = await adminApi.getDashboard();
      setDashboardStats(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch dashboard statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingId(userId);

    try {
      await adminApi.deleteUser(userId);

      setUsers(users.filter((u) => u.userId !== userId));

      // Refresh dashboard statistics after deleting a user
      const updatedStats = await adminApi.getDashboard();
      setDashboardStats(updatedStats);
    } catch (err: any) {
      toastError(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'bg-purple-100 text-purple-700';

      case 'REAL_ESTATE_AGENT':
        return 'bg-blue-100 text-blue-700';

      case 'LEGAL_REVIEWER':
        return 'bg-green-100 text-green-700';

      case 'FINANCIAL_INSTITUTION':
        return 'bg-amber-100 text-amber-700';

      case 'BUYER':
        return 'bg-slate-100 text-slate-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!authReady || email === null) return null;

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>

          <p className="page-subtitle">
            System administration and analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="pill bg-emerald-50 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Admin: {email}
          </span>
        </div>
      </header>

      {/* Dashboard Analytics */}
      <section className="mt-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Total Users */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dashboardStats?.totalUsers ?? 0}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Registered users
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </div>

          {/* Total Properties */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Properties
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dashboardStats?.totalProperties ?? 0}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Properties in system
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <span className="text-xl">🏠</span>
              </div>
            </div>
          </div>

          {/* Total Admins */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Admins
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dashboardStats?.totalAdmins ?? 0}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  System administrators
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-xl">🛡️</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* User Management */}
      <section className="mt-8">
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              User Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Total users: {users.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {user.userId}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-900">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`pill ${getRoleBadgeColor(
                          user.roleName
                        )}`}
                      >
                        {user.roleName}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`pill ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {user.roleName !== 'ADMINISTRATOR' && (
                        <button
                          onClick={() =>
                            handleDeleteUser(user.userId)
                          }
                          disabled={
                            deletingId === user.userId
                          }
                          className="btn-ghost text-red-600 hover:bg-red-50"
                        >
                          {deletingId === user.userId
                            ? 'Deleting…'
                            : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No users found.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}