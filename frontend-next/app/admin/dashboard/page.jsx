'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Building2, FileText, Users, ShieldAlert, RefreshCw } from 'lucide-react'

const EMPTY_STATS = {
    totalUsers: 0,
    totalProperties: 0,
    totalReportsGenerated: 0,
    riskLevelDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    totalAuditEvents: 0,
}

function getBearerToken() {
    const stored = localStorage.getItem('token')
    if (!stored) return null
    return stored.trim().replace(/^Bearer\s+/i, '')
}

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0c1322] p-5">
            <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl border ${accent}`}>
                <Icon size={19} />
            </div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{Number(value ?? 0).toLocaleString()}</p>
        </article>
    )
}

function formatDate(value) {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState(EMPTY_STATS)
    const [auditLogs, setAuditLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadAdminDashboard() {
            try {
                const rawUser = localStorage.getItem('user')
                const token = getBearerToken()

                if (!rawUser || !token) {
                    router.replace('/login')
                    return
                }

                let user
                try {
                    user = JSON.parse(rawUser)
                } catch {
                    localStorage.removeItem('user')
                    router.replace('/login')
                    return
                }

                const role = String(user?.role || '').replace(/^ROLE_/, '').toUpperCase()
                if (role !== 'ADMINISTRATOR') {
                    router.replace('/dashboard')
                    return
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }

                const [statsResponse, logsResponse] = await Promise.all([
                    fetch('/api/admin/dashboard', { headers, cache: 'no-store' }),
                    fetch('/api/admin/audit-logs', { headers, cache: 'no-store' }),
                ])

                const [statsBody, logsBody] = await Promise.all([
                    statsResponse.json().catch(() => null),
                    logsResponse.json().catch(() => null),
                ])

                if (statsResponse.status === 401 || logsResponse.status === 401) {
                    throw new Error('Your session is no longer valid. Please sign in again.')
                }
                if (statsResponse.status === 403 || logsResponse.status === 403) {
                    throw new Error('Your account is not authorized to view this dashboard.')
                }
                if (!statsResponse.ok) {
                    throw new Error(statsBody?.message || statsBody?.error?.message || `Could not load dashboard statistics (${statsResponse.status}).`)
                }
                if (!logsResponse.ok) {
                    throw new Error(logsBody?.message || logsBody?.error?.message || `Could not load audit logs (${logsResponse.status}).`)
                }

                if (!cancelled) {
                    setStats({ ...EMPTY_STATS, ...(statsBody?.data ?? statsBody ?? {}) })
                    const logs = logsBody?.data ?? logsBody
                    setAuditLogs(Array.isArray(logs) ? logs : [])
                }
            } catch (err) {
                if (!cancelled) setError(err?.message || 'Unable to load the admin dashboard.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadAdminDashboard()
        return () => { cancelled = true }
    }, [router])

    const riskLevels = [
        { label: 'Low', key: 'LOW', color: 'bg-emerald-400' },
        { label: 'Medium', key: 'MEDIUM', color: 'bg-amber-400' },
        { label: 'High', key: 'HIGH', color: 'bg-rose-400' },
    ]
    const riskValues = stats.riskLevelDistribution || EMPTY_STATS.riskLevelDistribution
    const maxRisk = Math.max(...riskLevels.map(({ key }) => Number(riskValues[key] || 0)), 1)

    return (
        <main className="min-h-screen bg-[#080c16] px-4 pb-16 pt-28 text-white sm:px-6">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/[0.035] blur-3xl" />
                <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/[0.025] blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl">
                <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">PropDue Intelligence Platform</p>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">System Dashboard</h1>
                        <p className="mt-2 text-sm text-slate-400">Platform-wide activity, risk distribution, and audit events.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.08] sm:self-auto"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </header>

                {error && (
                    <div role="alert" className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-sm text-slate-400">Loading dashboard…</div>
                ) : (
                    <>
                        <section aria-label="Platform statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} accent="border-blue-400/20 bg-blue-400/[0.08] text-blue-300" />
                            <StatCard icon={Building2} label="Total Properties" value={stats.totalProperties} accent="border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300" />
                            <StatCard icon={FileText} label="Reports Generated" value={stats.totalReportsGenerated} accent="border-purple-400/20 bg-purple-400/[0.08] text-purple-300" />
                            <StatCard icon={Activity} label="Audit Events" value={stats.totalAuditEvents} accent="border-amber-400/20 bg-amber-400/[0.08] text-amber-300" />
                        </section>

                        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c1322] p-6 sm:p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <ShieldAlert size={19} className="text-blue-300" />
                                <div>
                                    <h2 className="font-semibold text-white">Risk Level Distribution</h2>
                                    <p className="mt-1 text-xs text-slate-500">Counts returned by the admin API</p>
                                </div>
                            </div>
                            <div className="grid gap-5 md:grid-cols-3">
                                {riskLevels.map(({ label, key, color }) => {
                                    const value = Number(riskValues[key] || 0)
                                    return (
                                        <div key={key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm text-slate-300">{label}</span>
                                                <span className="text-lg font-semibold text-white">{value.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min((value / maxRisk) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1322]">
                            <div className="flex flex-col gap-1 border-b border-white/[0.06] px-5 py-5 sm:px-6">
                                <h2 className="font-semibold text-white">Recent Audit Logs</h2>
                                <p className="text-xs text-slate-500">Latest events returned by the admin API</p>
                            </div>
                            {auditLogs.length === 0 ? (
                                <p className="p-6 text-sm text-slate-400">No audit events found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[720px] text-left text-sm">
                                        <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                                            <tr>
                                                <th className="px-5 py-4 font-medium sm:px-6">Time</th>
                                                <th className="px-5 py-4 font-medium sm:px-6">User</th>
                                                <th className="px-5 py-4 font-medium sm:px-6">Action</th>
                                                <th className="px-5 py-4 font-medium sm:px-6">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.map((log) => (
                                                <tr key={log.id} className="border-t border-white/[0.06] text-slate-300">
                                                    <td className="whitespace-nowrap px-5 py-4 text-slate-400 sm:px-6">{formatDate(log.timestamp)}</td>
                                                    <td className="px-5 py-4 sm:px-6">{log.userEmail || '—'}</td>
                                                    <td className="px-5 py-4 sm:px-6"><span className="rounded-full border border-blue-400/15 bg-blue-400/[0.05] px-2.5 py-1 text-xs text-blue-200">{log.action || '—'}</span></td>
                                                    <td className="max-w-sm break-words px-5 py-4 text-slate-400 sm:px-6">{log.details || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    )
}
