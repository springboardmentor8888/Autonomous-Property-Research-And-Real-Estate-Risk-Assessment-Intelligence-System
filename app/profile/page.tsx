'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { profileApi, type ProfileResponse, type UpdateProfileRequest } from '@/lib/api';
import { ensureAuthInitialized, getAuthEmail } from '@/lib/session';
import { toastError, toastSuccess } from '@/lib/useToast';

type FieldName = 'firstName' | 'lastName' | 'phone' | 'jobTitle' | 'organization' | 'profilePicture' | 'timezone';
type Errors = Partial<Record<FieldName, string>>;

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  organization: string;
  profilePicture: string;
  timezone: string;
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

  if (v.jobTitle && v.jobTitle.length > 100) {
    errors.jobTitle = 'Job title must be 100 characters or fewer.';
  }

  if (v.organization && v.organization.length > 150) {
    errors.organization = 'Organization must be 150 characters or fewer.';
  }

  if (v.profilePicture && v.profilePicture.length > 500) {
    errors.profilePicture = 'Profile picture URL must be 500 characters or fewer.';
  }

  if (v.timezone && v.timezone.length > 50) {
    errors.timezone = 'Timezone must be 50 characters or fewer.';
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

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editOrganization, setEditOrganization] = useState('');
  const [editProfilePicture, setEditProfilePicture] = useState('');
  const [editTimezone, setEditTimezone] = useState('');

  const [editTouched, setEditTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [editAttempted, setEditAttempted] = useState(false);

  const editValues: FormValues = { 
    firstName: editFirstName, 
    lastName: editLastName, 
    phone: editPhone,
    jobTitle: editJobTitle,
    organization: editOrganization,
    profilePicture: editProfilePicture,
    timezone: editTimezone
  };
  const editErrors = validate(editValues);
  const showEditError = (field: FieldName) =>
    (editTouched[field] || editAttempted) && editErrors[field] ? editErrors[field] : undefined;

  const markEditTouched = (field: FieldName) =>
    setEditTouched((t) => ({ ...t, [field]: true }));

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await ensureAuthInitialized();
        const data = await profileApi.getProfile();
        setProfile(data);
      } catch (err: any) {
        toastError(err.message || 'Failed to load profile');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  useEffect(() => {
    if (profile && !isEditing) {
      setEditFirstName(profile.firstName || '');
      setEditLastName(profile.lastName || '');
      setEditPhone(profile.phone || '');
      setEditJobTitle(profile.jobTitle || '');
      setEditOrganization(profile.organization || '');
      setEditProfilePicture(profile.profilePicture || '');
      setEditTimezone(profile.timezone || '');
    }
  }, [profile, isEditing]);

  const handleEditClick = () => {
    if (!profile) return;
    setEditFirstName(profile.firstName || '');
    setEditLastName(profile.lastName || '');
    setEditPhone(profile.phone || '');
    setEditJobTitle(profile.jobTitle || '');
    setEditOrganization(profile.organization || '');
    setEditProfilePicture(profile.profilePicture || '');
    setEditTimezone(profile.timezone || '');
    setEditTouched({});
    setEditAttempted(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!profile) return;
    setEditFirstName(profile.firstName || '');
    setEditLastName(profile.lastName || '');
    setEditPhone(profile.phone || '');
    setEditJobTitle(profile.jobTitle || '');
    setEditOrganization(profile.organization || '');
    setEditProfilePicture(profile.profilePicture || '');
    setEditTimezone(profile.timezone || '');
    setEditTouched({});
    setEditAttempted(false);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditAttempted(true);

    if (Object.keys(editErrors).length > 0) {
      toastError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const request: UpdateProfileRequest = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim() || undefined,
        jobTitle: editJobTitle.trim() || undefined,
        organization: editOrganization.trim() || undefined,
        profilePicture: editProfilePicture.trim() || undefined,
        timezone: editTimezone.trim() || undefined,
      };

      const updated = await profileApi.updateProfile(request);
      setProfile(updated);
      toastSuccess('Profile updated successfully');
      setIsEditing(false);
      setEditAttempted(false);
      setEditTouched({});
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
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-64 bg-slate-200 rounded" />
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
  const displayName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : 'Your Profile';

  return (
    <main className="min-h-[calc(100vh-4rem)] py-12 px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-slate-900 text-xl sm:text-2xl font-bold text-white" aria-hidden="true">
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-semibold text-slate-900">{displayName}</h1>
              <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
              <span className="inline-block mt-1.5 pill bg-slate-100 text-slate-700 text-xs font-medium">
                {profile.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEditClick}
            disabled={saving}
            className="btn-primary w-full sm:w-auto flex-shrink-0"
            aria-label="Edit profile"
          >
            Edit Profile
          </button>
        </div>

        {isEditing ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Edit Personal Information</h2>

            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="editFirstName" className="label-base">First name</label>
                  <input
                    id="editFirstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    onBlur={() => markEditTouched('firstName')}
                    placeholder="Jane"
                    aria-invalid={!!showEditError('firstName')}
                    aria-describedby={showEditError('firstName') ? 'editFirstName-error' : undefined}
                    className={`input-base ${showEditError('firstName') ? 'border-red-400' : ''}`}
                    disabled={saving}
                  />
                  {showEditError('firstName') && (
                    <p id="editFirstName-error" className="mt-1 text-xs text-red-600" role="alert">
                      {showEditError('firstName')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="editLastName" className="label-base">Last name</label>
                  <input
                    id="editLastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    onBlur={() => markEditTouched('lastName')}
                    placeholder="Doe"
                    aria-invalid={!!showEditError('lastName')}
                    aria-describedby={showEditError('lastName') ? 'editLastName-error' : undefined}
                    className={`input-base ${showEditError('lastName') ? 'border-red-400' : ''}`}
                    disabled={saving}
                  />
                  {showEditError('lastName') && (
                    <p id="editLastName-error" className="mt-1 text-xs text-red-600" role="alert">
                      {showEditError('lastName')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="editPhone" className="label-base">Phone number (optional)</label>
                <input
                  id="editPhone"
                  type="tel"
                  autoComplete="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  onBlur={() => markEditTouched('phone')}
                  placeholder="+91 98765 43210"
                  aria-invalid={!!showEditError('phone')}
                  aria-describedby={showEditError('phone') ? 'editPhone-error' : undefined}
                  className={`input-base ${showEditError('phone') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showEditError('phone') && (
                  <p id="editPhone-error" className="mt-1 text-xs text-red-600" role="alert">
                    {showEditError('phone')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="editJobTitle" className="label-base">Job title (optional)</label>
                <input
                  id="editJobTitle"
                  type="text"
                  autoComplete="organization-title"
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                  onBlur={() => markEditTouched('jobTitle')}
                  placeholder="e.g., Senior Real Estate Analyst"
                  aria-invalid={!!showEditError('jobTitle')}
                  aria-describedby={showEditError('jobTitle') ? 'editJobTitle-error' : undefined}
                  className={`input-base ${showEditError('jobTitle') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showEditError('jobTitle') && (
                  <p id="editJobTitle-error" className="mt-1 text-xs text-red-600" role="alert">
                    {showEditError('jobTitle')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="editOrganization" className="label-base">Organization (optional)</label>
                <input
                  id="editOrganization"
                  type="text"
                  autoComplete="organization"
                  value={editOrganization}
                  onChange={(e) => setEditOrganization(e.target.value)}
                  onBlur={() => markEditTouched('organization')}
                  placeholder="e.g., ABC Realty Group"
                  aria-invalid={!!showEditError('organization')}
                  aria-describedby={showEditError('organization') ? 'editOrganization-error' : undefined}
                  className={`input-base ${showEditError('organization') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showEditError('organization') && (
                  <p id="editOrganization-error" className="mt-1 text-xs text-red-600" role="alert">
                    {showEditError('organization')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="editProfilePicture" className="label-base">Profile picture URL (optional)</label>
                <input
                  id="editProfilePicture"
                  type="url"
                  autoComplete="url"
                  value={editProfilePicture}
                  onChange={(e) => setEditProfilePicture(e.target.value)}
                  onBlur={() => markEditTouched('profilePicture')}
                  placeholder="https://example.com/avatar.png"
                  aria-invalid={!!showEditError('profilePicture')}
                  aria-describedby={showEditError('profilePicture') ? 'editProfilePicture-error' : undefined}
                  className={`input-base ${showEditError('profilePicture') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showEditError('profilePicture') && (
                  <p id="editProfilePicture-error" className="mt-1 text-xs text-red-600" role="alert">
                    {showEditError('profilePicture')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="editTimezone" className="label-base">Timezone (optional)</label>
                <input
                  id="editTimezone"
                  type="text"
                  autoComplete="timezone"
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                  onBlur={() => markEditTouched('timezone')}
                  placeholder="e.g., Asia/Kolkata, America/New_York"
                  aria-invalid={!!showEditError('timezone')}
                  aria-describedby={showEditError('timezone') ? 'editTimezone-error' : undefined}
                  className={`input-base ${showEditError('timezone') ? 'border-red-400' : ''}`}
                  disabled={saving}
                />
                {showEditError('timezone') && (
                  <p id="editTimezone-error" className="mt-1 text-xs text-red-600" role="alert">
                    {showEditError('timezone')}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Personal Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Name</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="mt-0.5 text-sm text-slate-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Phone</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {profile.phone ? profile.phone : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Role</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  <span className="pill bg-slate-100 text-slate-700 text-xs font-medium">
                    {profile.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Job Title</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {profile.jobTitle ? profile.jobTitle : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Organization</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {profile.organization ? profile.organization : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Profile Picture</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {profile.profilePicture ? (
                    <a href={profile.profilePicture} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Timezone</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {profile.timezone ? profile.timezone : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}
