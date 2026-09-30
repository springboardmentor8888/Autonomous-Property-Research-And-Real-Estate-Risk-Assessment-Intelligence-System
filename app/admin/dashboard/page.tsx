'use client';

import { useEffect, useState } from 'react';
import { getAuthEmail } from '@/lib/session';
import { useAuthGuard } from '@/lib/useAuth';
import { adminApi } from '@/lib/api';
import type { ApiLogEntry, ActivityLogEntry, LogPage } from '@/lib/api';
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

type AdminTab = 'users' | 'api-logs' | 'activity-logs';
type ApiLogFilter = 'all' | 'success' | 'error';

export default function AdminDashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [tab, setTab] = useState<AdminTab>('users');
  const [apiLogs, setApiLogs] = useState<LogPage<ApiLogEntry> | null>(null);
  const [activityLogs, setActivityLogs] =
    useState<LogPage<ActivityLogEntry> | null>(null);
  const [apiLogFilter, setApiLogFilter] = useState<ApiLogFilter>('all');
  const [apiLogPage, setApiLogPage] = useState(0);
  const [activityLogPage, setActivityLogPage] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);

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

  const fetchApiLogs = async (page: number, filter: ApiLogFilter) => {
    setLogsLoading(true);
    try {
      const data = await adminApi.getApiLogs(
        page,
        20,
        filter === 'all' ? undefined : filter === 'success'
      );
      setApiLogs(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch API logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchActivityLogs = async (page: number) => {
    setLogsLoading(true);
    try {
      const data = await adminApi.getActivityLogs(page, 20);
      setActivityLogs(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch activity logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const switchTab = (next: AdminTab) => {
    setTab(next);
    if (next === 'api-logs' && !apiLogs) fetchApiLogs(apiLogPage, apiLogFilter);
    if (next === 'activity-logs' && !activityLogs)
      fetchActivityLogs(activityLogPage);
  };

  const handleApiLogFilter = (filter: ApiLogFilter) => {
    setApiLogFilter(filter);
    setApiLogPage(0);
    fetchApiLogs(0, filter);
  };

  const handleApiLogPage = (page: number) => {
    setApiLogPage(page);
    fetchApiLogs(page, apiLogFilter);
  };

  const handleActivityLogPage = (page: number) => {
    setActivityLogPage(page);
    fetchActivityLogs(page);
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

  const formatLogTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusCodeColor = (code?: number) => {
    if (code == null) return 'bg-gray-100 text-gray-700';
    if (code < 300) return 'bg-emerald-100 text-emerald-700';
    if (code < 400) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getTabClasses = (active: boolean) => {
    return active
      ? 'px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white'
      : 'px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200';
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

      {/* Log viewer tabs */}
      <section className="mt-8">
        <div className="flex gap-2">
          <button onClick={() => switchTab('users')} className={getTabClasses(tab === 'users')}>
            Users
          </button>

          <button
            onClick={() => switchTab('api-logs')}
            className={getTabClasses(tab === 'api-logs')}
          >
            API Logs
          </button>

          <button
            onClick={() => switchTab('activity-logs')}
            className={getTabClasses(tab === 'activity-logs')}
          >
            Activity Logs
          </button>
        </div>
      </section>

      {/* User Management */}
      {tab === 'users' && (
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
      )}

      {/* API Audit Logs */}
      {tab === 'api-logs' && (
        <section className="mt-8">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  API Logs
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Audit trail of authenticated API calls
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApiLogFilter('all')}
                  className={`pill ${
                    apiLogFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  } cursor-pointer`}
                >
                  All
                </button>

                <button
                  onClick={() => handleApiLogFilter('success')}
                  className={`pill ${
                    apiLogFilter === 'success'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  } cursor-pointer`}
                >
                  Success
                </button>

                <button
                  onClick={() => handleApiLogFilter('error')}
                  className={`pill ${
                    apiLogFilter === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700'
                  } cursor-pointer`}
                >
                  Errors
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Time
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Service
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Endpoint
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Latency
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Result
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {(apiLogs?.content ?? []).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatLogTime(log.requestTime)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="pill bg-blue-100 text-blue-700">
                          {log.serviceName}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-900 font-mono">
                        {log.endpoint}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`pill ${getStatusCodeColor(
                            log.statusCode
                          )}`}
                        >
                          {log.statusCode ?? '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {log.latencyMs != null ? `${log.latencyMs} ms` : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`pill ${
                            log.success
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!apiLogs || apiLogs.content.length === 0) && (
              <div className="p-12 text-center text-slate-500">
                {logsLoading ? 'Loading…' : 'No API logs found.'}
              </div>
            )}

            {apiLogs && apiLogs.content.length > 0 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {apiLogs.page + 1} of {apiLogs.totalPages} ·{' '}
                  {apiLogs.totalElements} entries
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApiLogPage(apiLogs.page - 1)}
                    disabled={apiLogs.page === 0 || logsLoading}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => handleApiLogPage(apiLogs.page + 1)}
                    disabled={apiLogs.page + 1 >= apiLogs.totalPages || logsLoading}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Activity Logs */}
      {tab === 'activity-logs' && (
        <section className="mt-8">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Activity Logs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                User activity across the system
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Time
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Entity
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {(activityLogs?.content ?? []).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatLogTime(log.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-900">
                        User #{log.userId}
                      </td>

                      <td className="px-6 py-4">
                        <span className="pill bg-blue-100 text-blue-700">
                          {formatAction(log.action)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {log.entityType
                          ? `${log.entityType}${
                              log.entityId != null ? ` #${log.entityId}` : ''
                            }`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!activityLogs || activityLogs.content.length === 0) && (
              <div className="p-12 text-center text-slate-500">
                {logsLoading ? 'Loading…' : 'No activity logs found.'}
              </div>
            )}

            {activityLogs && activityLogs.content.length > 0 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {activityLogs.page + 1} of {activityLogs.totalPages} ·{' '}
                  {activityLogs.totalElements} entries
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleActivityLogPage(activityLogs.page - 1)}
                    disabled={activityLogs.page === 0 || logsLoading}
                    className="btn-ghost disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => handleActivityLogPage(activityLogs.page + 1)}
                    disabled={
                      activityLogs.page + 1 >= activityLogs.totalPages ||
                      logsLoading
                    }
                    className="btn-ghost disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}