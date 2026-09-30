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

  // 204 No Content — nothing to parse (e.g. absent risk assessment).
  if (res.status === 204) {
    return undefined as T;
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

  /** The full due-diligence record set stored for a property. */
  async getDiligence(id: number | string) {
    return fetchWithAuth<DiligenceData>(`/properties/${id}/diligence`);
  },

  /** Generates a due-diligence report from the stored data. */
  async generateReport(id: number | string) {
    return fetchWithAuth<ReportResponse>(`/properties/${id}/report`, {
      method: 'POST',
    });
  },

  /** Latest generated report; undefined when none exists yet. */
  async getReport(id: number | string) {
    return fetchWithAuth<ReportResponse | undefined>(`/properties/${id}/report`);
  },

  /** Downloads the latest report as a PDF blob (SRS: downloadable report). */
  async downloadReportPdf(id: number | string): Promise<Blob> {
    const token = getMemoryToken();
    const res = await fetch(`${API_BASE}/properties/${id}/report/pdf`, {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    });
    if (!res.ok) {
      throw new Error(`Report download failed (${res.status})`);
    }
    return res.blob();
  },

  /** Downloads the latest report as an Excel workbook blob (SRS: exportable report). */
  async downloadReportExcel(id: number | string): Promise<Blob> {
    const token = getMemoryToken();
    const res = await fetch(`${API_BASE}/properties/${id}/report/excel`, {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    });
    if (!res.ok) {
      throw new Error(`Report export failed (${res.status})`);
    }
    return res.blob();
  },

  /** All reports generated by the current user, newest first. */
  async getMyReports() {
    return fetchWithAuth<ReportResponse[]>('/reports/mine');
  },

  /** The current user's searched properties, newest first. */
  async getSearchHistory() {
    return fetchWithAuth<PropertyDetailsResponse[]>('/properties/searched');
  },

  /** Latest risk assessment; undefined when none has been produced yet. */
  async getRiskAssessment(id: number | string) {
    return fetchWithAuth<RiskAssessment | undefined>(`/properties/${id}/risk-assessment`);
  },

  /** Stage 1: runs the aggregation pipeline + risk scoring. */
  async runRiskAssessment(id: number | string) {
    return fetchWithAuth<RiskAssessment>(`/properties/${id}/risk-assessment`, {
      method: 'POST',
    });
  },

  /** Stage 2: analyzes stored comparables + market trends. */
  async runMarketAnalysis(id: number | string) {
    return fetchWithAuth<MarketAnalysis>(`/properties/${id}/market-analysis`, {
      method: 'POST',
    });
  },

  /** Runs the stored-data aggregation pipeline (diligence inventory). */
  async runAggregation(id: number | string) {
    return fetchWithAuth<AggregationResponse>(`/properties/${id}/aggregate`, {
      method: 'POST',
    });
  },

  /** Past aggregation runs for a property, newest first. */
  async getAggregationRuns(id: number | string) {
    return fetchWithAuth<AggregationRunSummary[]>(`/properties/${id}/aggregations`);
  },

  async getMonitoring(id: number | string) {
    return fetchWithAuth<MonitoringStatus>(`/properties/${id}/monitoring`);
  },

  async enableMonitoring(id: number | string) {
    return fetchWithAuth<MonitoringStatus>(`/properties/${id}/monitoring`, {
      method: 'POST',
    });
  },

  async disableMonitoring(id: number | string) {
    return fetchWithAuth<MonitoringStatus>(`/properties/${id}/monitoring`, {
      method: 'DELETE',
    });
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
  district?: string;
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
  /** When this property was searched (row creation time). */
  searchedAt?: string;
};

/** GET /properties/{id}/monitoring — per-user monitoring state. */
export type MonitoringStatus = {
  propertyId: number;
  userId: number;
  enabled: boolean;
  lastCheckedAt?: string;
  nextCheckAt?: string;
  monitoredSince?: string;
};

/** GET/POST /properties/{id}/risk-assessment — risk scores (0-100, higher = riskier). */
export type RiskAssessment = {
  riskAssessmentId: number;
  propertyId: number;
  taxRisk?: number;
  legalRisk?: number;
  floodRisk?: number;
  permitCompliance?: number;
  zoningCompliance?: number;
  ownershipVerification?: number;
  overallScore?: number;
  assessedAt?: string;
  riskTier?: string;
  aggregationRunId?: number;
  aggregationStatus?: string;
};

/** POST /properties/{id}/aggregate — stored-data aggregation pipeline run. */
export type AggregationResponse = {
  aggregationRunId: number;
  propertyId: number;
  status: string;
  startedAt?: string;
  completedAt?: string;
  observations?: {
    provider: string;
    operation: string;
    status: string;
    httpStatus?: number;
    errorMessage?: string;
    retrievedAt?: string;
  }[];
};

/** GET /properties/{id}/aggregations — past pipeline runs, newest first. */
export type AggregationRunSummary = {
  aggregationRunId: number;
  propertyId: number;
  requestedAddress?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
};

/** POST /properties/{id}/market-analysis — stage-2 comparables + trends analysis. */
export type MarketAnalysis = {
  propertyId: number;
  analyzedAt?: string;
  comparables?: {
    count: number;
    averagePrice?: number;
    medianPrice?: number;
    lowestPrice?: number;
    highestPrice?: number;
    averagePricePerSqft?: number;
  };
  positioning?: {
    verdict: 'BELOW_MARKET' | 'ABOVE_MARKET' | 'ALIGNED' | 'UNKNOWN' | 'NO_COMPARABLES';
    propertyPrice?: number;
    marketAveragePrice?: number;
    deltaPercent?: number;
    basis?: string;
    note?: string;
  };
  trend?: {
    locality?: string;
    period?: string;
    avgPricePerSqft?: number;
    supplyCount?: number;
    demandPulse?: number;
  };
  summary?: string;
};

/** GET /properties/{id}/diligence — the stored due-diligence record set. */
export type DiligenceData = {
  propertyId: number;
  ownership?: OwnershipRecord;
  tax?: TaxRecord;
  permits?: PermitRecord[];
  zoning?: ZoningRecord;
  flood?: FloodRecord;
  environmental?: EnvironmentalRecord;
  utilities?: UtilityRecord[];
  comparables?: ComparableRecord[];
  marketTrends?: MarketTrendRecord[];
};

export type OwnershipRecord = {
  ownerName?: string;
  ownershipType?: string;
  recordDate?: string;
  source?: string;
};

export type TaxRecord = {
  taxPayDate?: string;
  taxAmount?: number;
  taxDue?: number;
  paymentStatus?: string;
  source?: string;
};

export type PermitRecord = {
  permitNumber?: string;
  permitType?: string;
  permitStatus?: string;
  issueDate?: string;
  completionDate?: string;
  description?: string;
};

export type ZoningRecord = {
  zoningCode?: string;
  zoningStatus?: string;
  allowedUse?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
};

export type FloodRecord = {
  zone?: string;
  riskLevel?: string;
  effectiveDate?: string;
};

export type EnvironmentalRecord = {
  recordType?: string;
  status?: string;
  riskLevel?: string;
  description?: string;
};

export type UtilityRecord = {
  utilityType?: string;
  provider?: string;
  availabilityStatus?: string;
};

export type ComparableRecord = {
  listingId?: string;
  locality?: string;
  propertyType?: string;
  bhk?: string;
  areaSqft?: number;
  price?: number;
  pricePerSqft?: number;
  reraId?: string;
  verified?: boolean;
};

export type MarketTrendRecord = {
  locality?: string;
  period?: string;
  avgPricePerSqft?: number;
  supplyCount?: number;
  demandPulse?: number;
};

/** POST/GET /properties/{id}/report — a generated due-diligence report. */
export type ReportResponse = {
  reportId: number;
  propertyId: number;
  propertyAddress?: string;
  riskTier?: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'UNKNOWN' | 'INSUFFICIENT_DATA';
  /** The stored-data aggregation run that fed this report. */
  aggregationRunId?: number;
  aggregationStatus?: string;
  /** Stage-2 output: the property's market positioning (null when no comparables). */
  marketPosition?: {
    verdict: string;
    deltaPercent?: number;
    basis?: string;
  };
  executiveSummary?: string;
  status?: string;
  generatedAt?: string;
  risk?: RiskAssessment;
  records?: ReportRecordStatuses;
  coverage?: ReportDataCoverage;
};

export type ReportRecordStatuses = {
  taxStatus?: string;
  permitStatus?: string;
  zoningStatus?: string;
  floodRiskLevel?: string;
  environmentalStatus?: string;
  ownershipType?: string;
  utilitiesAvailable?: number;
};

export type ReportDataCoverage = {
  ownershipRecord?: boolean;
  taxRecord?: boolean;
  permitRecord?: boolean;
  zoningRecord?: boolean;
  floodRecord?: boolean;
  environmentalRecord?: boolean;
  utilityRecords?: boolean;
  comparablesCount?: number;
  marketTrendsCount?: number;
  missingSections?: string[];
};

export type NotificationResponse = {
  notificationId: number;
  notificationType: string;
  message: string;
  propertyId?: number;
  reportId?: number;
  status?: string;
  sentAt?: string;
  createdAt: string;
};

export const notificationApi = {
  async list() {
    return fetchWithAuth<NotificationResponse[]>('/notifications');
  },

  async unreadCount() {
    return fetchWithAuth<{ unread: number }>('/notifications/unread-count');
  },

  async markRead(id: number) {
    return fetchWithAuth<NotificationResponse>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllRead() {
    return fetchWithAuth<{ markedRead: number }>('/notifications/read-all', {
      method: 'POST',
    });
  },
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
