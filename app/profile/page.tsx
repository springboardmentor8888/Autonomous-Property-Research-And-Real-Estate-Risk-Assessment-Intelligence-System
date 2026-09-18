'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { profileApi, type ProfileResponse, type UpdateProfileRequest } from '@/lib/api';
import { ensureAuthInitialized, getAuthEmail } from '@/lib/session';
import { toastError, toastSuccess } from '@/lib/useToast';

type FieldName = 'firstName' | 'lastName' | 'phone';
type Errors = Partial<Record<FieldName, string>>;

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

const PHONE_RE = /^[+]?[0-9]{10,15}$/;

function validate(v: FormValues): Errors {
  const errors: Errors = {};

  if (!v.firstName.trim()) {
    errors.firstName = 'First name is required.';
  } else if (v.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  } else if (v.firstName.trim().length > 50) {
    errors.firstName = 'First name must be 50 characters or fewer.';
  }

  if (!v.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  } else if (v.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  } else if (v.lastName.trim().length > 50) {
    errors.lastName = 'Last name must be 50 characters or fewer.';
  }

  if (v.phone && !PHONE_RE.test(v.phone)) {
    errors.phone = 'Phone must be 10-15 digits, optionally starting with +';
  }

  return errors;
}

function getInitials(profile: ProfileResponse): string {
  if (profile.initials) return profile.initials;
  if (profile.firstName && profile.lastName) {
    return (profile.firstName[0] + profile.lastName[0]).toUpperCase();
  }
  return 'U';
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

  const formValues: FormValues = { firstName, lastName, phone };
  const errors = validate(formValues);
  const showError = (field: FieldName) =>
    (touched[field] || attempted) && errors[field] ? errors[field] : undefined;

  const markTouched = (field: FieldName) =>
    setTouched((t) => ({ ...t, [field]: true }));

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await ensureAuthInitialized();
        const data = await profileApi.getProfile();
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
      } catch (err: any) {
        toastError(err.message || 'Failed to load profile');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttempted(true);

    if (Object.keys(errors).length > 0) {
      toastError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const request: UpdateProfileRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      };

      const updated = await profileApi.updateProfile(request);
      setProfile(updated);
      toastSuccess('Profile updated successfully');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <p className="text-slate-600">Please log in to view your profile.</p>
        </div>
      </main>
    );
  }

  const initials = getInitials(profile);

  return (
    <main className="min-h-[calc(100vh-4rem)] py-12 px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-900 text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Your Profile'}
              </h1>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <span className="inline-block mt-1.5 pill bg-slate-100 text-slate-700 text-xs font-medium">
                {profile.role}
              </span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Profile Form */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Personal Information</h2>

          <form onSubmit={handleSave} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label-base">First name</label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => markTouched('firstName')}
                  placeholder="Jane"
                  aria-invalid={!!showError('firstName')}
                  className={`input-base ${showError('firstName') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showError('firstName') && (
                  <p className="mt-1 text-xs text-red-600">{showError('firstName')}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="label-base">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => markTouched('lastName')}
                  placeholder="Doe"
                  aria-invalid={!!showError('lastName')}
                  className={`input-base ${showError('lastName') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showError('lastName') && (
                  <p className="mt-1 text-xs text-red-600">{showError('lastName')}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="label-base">Phone number (optional)</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => markTouched('phone')}
                placeholder="+91 98765 43210"
                aria-invalid={!!showError('phone')}
                className={`input-base ${showError('phone') ? 'border-red-400' : ''}`}
                disabled={saving}
              />
              {showError('phone') && (
                <p className="mt-1 text-xs text-red-600">{showError('phone')}</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full sm:w-auto"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Account Information</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">User ID</dt>
              <dd className="mt-0.5 font-mono text-sm text-slate-900">{profile.userId}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Email</dt>
              <dd className="mt-0.5 text-sm text-slate-900">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Role</dt>
              <dd className="mt-0.5 text-sm text-slate-900">{profile.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Last updated</dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {new Date(profile.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
