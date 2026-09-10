import type { Metadata } from 'next';
import AdminLoginForm from './AdminLoginForm';

// Server-rendered page shell: no auth state, no client JS except the form.
// Deliberately NOT linked from the user login/register pages — reachable
// only via its URL or a redirect from /admin/dashboard when not signed in.
export const metadata: Metadata = {
  title: 'Administrator Login | Real Estate Due Diligence Agent',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Administrator Login
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Secure access to system administration
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </main>
  );
}
