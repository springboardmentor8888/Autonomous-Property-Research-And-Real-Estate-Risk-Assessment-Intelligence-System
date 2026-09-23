/**
 * API client with HttpOnly cookie-based authentication.
 * - Access token: returned in response body, stored in memory (React state)
 * - Refresh token: HttpOnly cookie managed automatically by browser
 * - Automatic token refresh on 401 for protected endpoints
 */

const API_BASE = '/api';

// Use session.ts for token management
import { getAccessToken as getMemoryToken, setMemoryToken, clearSession } from '@/lib/session';

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const token = getMemoryToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Don't attach auth header for public auth endpoints
  const isPublicAuthPath = path.startsWith('/auth/login') || path.startsWith('/auth/register');
  
  if (token && !isPublicAuthPath) {
    (headers as Record<string, string>)['Authorization'] = 'Bearer ' + token;
  }

  // Include credentials to send HttpOnly cookies
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Critical for HttpOnly cookies
  });

  // Handle 401 - try to refresh token once
  if (res.status === 401 && !isPublicAuthPath && retryCount === 0) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      return fetchWithAuth<T>(path, options, 1);
    }
    
    // Refresh failed - redirect to login
    if (typeof window !== 'undefined') {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPath ? '/admin/login' : '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 403) {
    throw new Error('Access denied. You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Send HttpOnly refresh token cookie
    });

    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        setMemoryToken(data.accessToken);
        return true;
      }
    }
  } catch {
    // Ignore errors
  }
  return false;
}

// Shape returned by /api/auth/login and /api/auth/register.
// The refresh token is NOT part of this body — it only travels as an
// HttpOnly cookie that JavaScript can neither read nor tamper with.
type AuthPayload = {
  accessToken: string;
  email: string;
  role: string;
  message: string;
};

export const authApi = {
  async login(email: string, password: string) {
    const res = await fetchWithAuth<AuthPayload>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    // Keep the access token in memory only; page reloads recover it via
    // the refresh cookie (see initializeAuth in session.ts).
    if (res.accessToken) {
      setMemoryToken(res.accessToken);
    }

    return {
      token: res.accessToken,
      email: res.email,
      role: res.role,
      message: res.message,
    };
  },

  async register(data: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    role: string; 
    phone?: string 
  }) {
    const res = await fetchWithAuth<AuthPayload>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (res.accessToken) {
      setMemoryToken(res.accessToken);
    }

    return {
      token: res.accessToken,
      email: res.email,
      role: res.role,
      message: res.message,
    };
  },

  async logout() {
    await fetchWithAuth<{ message: string }>(
      '/auth/logout',
      { method: 'POST' }
    );
    clearSession();
  },
};

export const propertyApi = {
  async searchByAddress(data: PropertySearchRequest) {
    return fetchWithAuth<PropertySearchApiResponse>('/properties/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getById(id: number | string) {
    return fetchWithAuth<PropertyDetailsResponse>(`/properties/${id}`);
  },
};

export type PropertySearchRequest = {
  address: string;
  city: string;
  state: string;
  pincode?: string;
  houseFlatPlot?: string;
  buildingSociety?: string;
  streetRoad?: string;
  locality?: string;
};

/** Envelope returned by POST /properties/search. */
export type PropertySearchApiResponse = {
  success: boolean;
  message?: string;
  data?: PropertySearchResult;
};

export type PropertySearchResult = {
  status: 'VALID' | 'INVALID' | 'ERROR';
  message?: string;
  requestedAddress?: string;
  results?: ResolvedPlace[];
  listingsStatus?: 'FOUND' | 'NO_RESULTS' | 'UNAVAILABLE';
  listingsMessage?: string;
  listings?: PropertyListing[];
};

export type ResolvedPlace = {
  propertyId?: number;
  placeId?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  pincode?: string;
  locality?: string;
  validationGranularity?: string;
  geocodeGranularity?: string;
  addressComplete?: boolean;
  hasUnconfirmedComponents?: boolean;
  possibleNextAction?: string;
  placeTypes?: string[];
  plusCode?: string;
};

/** One external property listing (99acres via Apify), mapped to our model. */
export type PropertyListing = {
  listingId?: string;
  title?: string;
  propertyType?: string;
  propertySubtype?: string;
  bhk?: string;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  carpetArea?: string;
  superArea?: string;
  areaText?: string;
  sqm?: string;
  price?: string;
  pricePerSqft?: string;
  originalPrice?: string;
  originalCurrency?: string;
  deposit?: string;
  brokerage?: string;
  furnishing?: string;
  facing?: string;
  floor?: string;
  totalFloors?: number;
  age?: string;
  availability?: string;
  transaction?: string;
  source?: string;
  locality?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  mapAccuracy?: string;
  projectId?: string;
  projectName?: string;
  buildingId?: string;
  buildingName?: string;
  reraId?: string;
  listedBy?: string;
  dealer?: string;
  gatedCommunity?: boolean;
  verified?: boolean;
  amenities?: string[];
  images?: string[];
  description?: string;
  url?: string;
  postingDate?: string;
  updateDate?: string;
  expiryDate?: string;
};

/** GET /properties/{id} — validated address + enriched listing data. */
export type PropertyDetailsResponse = {
  propertyId: number;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  locality?: string;
  validationGranularity?: string;
  geocodeGranularity?: string;
  addressComplete?: boolean;
  plusCode?: string;
  externalListingId?: string;
  title?: string;
  propertySubtype?: string;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  carpetAreaSqft?: number;
  superAreaSqft?: number;
  areaText?: string;
  price?: number;
  pricePerSqft?: number;
  deposit?: number;
  brokerage?: number;
  furnishing?: string;
  facing?: string;
  floor?: string;
  totalFloors?: number;
  age?: string;
  availability?: string;
  transaction?: string;
  source?: string;
  reraId?: string;
  listedBy?: string;
  dealer?: string;
  gatedCommunity?: boolean;
  verified?: boolean;
  amenities?: string[];
  images?: string[];
  description?: string;
  listingUrl?: string;
  postingDate?: string;
  updateDate?: string;
  expiryDate?: string;
  mapAccuracy?: string;
};

export const adminApi = {
  async getUsers() {
    return fetchWithAuth<any[]>('/admin/users');
  },

  async deleteUser(id: number) {
    return fetchWithAuth<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export const profileApi = {
  async getProfile() {
    return fetchWithAuth<ProfileResponse>('/profile');
  },

  async updateProfile(data: UpdateProfileRequest) {
    return fetchWithAuth<ProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export type ProfileResponse = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  organization: string | null;
  profilePicture: string | null;
  timezone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  initials?: string;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
  organization?: string;
  profilePicture?: string;
  timezone?: string;
};
