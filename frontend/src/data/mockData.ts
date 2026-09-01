export type UserRole = 'Buyer' | 'Real Estate Agent' | 'Legal Advisor' | 'Financial Institution' | 'Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinedDate: string;
  company?: string;
  phone?: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Flagged';
  overallRiskScore: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

export interface RecentActivity {
  id: string;
  propertyId: string;
  address: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'danger';
}

export interface RiskMetric {
  category: string;
  score: number;
  status: 'Clear' | 'Review' | 'Critical';
  description: string;
}

export interface SystemAuditLog {
  id: string;
  user: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

// Initial default users for login testing
export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'buyer@example.com',
    role: 'Buyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    joinedDate: '2026-01-15',
    phone: '+1 (555) 234-5678'
  },
  {
    id: '2',
    name: 'Marcus Vance',
    email: 'agent@example.com',
    role: 'Real Estate Agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    joinedDate: '2025-06-20',
    company: 'Apex Realty Group',
    phone: '+1 (555) 876-5432'
  },
  {
    id: '3',
    name: 'Elena Rostova',
    email: 'legal@example.com',
    role: 'Legal Advisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    joinedDate: '2024-11-02',
    company: 'Rostova & Associates LLC',
    phone: '+1 (555) 456-7890'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'finance@example.com',
    role: 'Financial Institution',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    joinedDate: '2025-03-10',
    company: 'Summit Capital Bank',
    phone: '+1 (555) 789-0123'
  },
  {
    id: '5',
    name: 'Alexander Cross',
    email: 'admin@example.com',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    joinedDate: '2023-01-01',
    phone: '+1 (555) 012-3456'
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-101',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    price: 385000,
    type: 'Single Family Residence',
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    yearBuilt: 1994,
    status: 'Approved',
    overallRiskScore: 12,
    riskLevel: 'Low',
    lastUpdated: '10 mins ago'
  },
  {
    id: 'prop-102',
    address: '112 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    zip: '33139',
    price: 1450000,
    type: 'Luxury Condo',
    beds: 3,
    baths: 3,
    sqft: 1850,
    yearBuilt: 2018,
    status: 'In Progress',
    overallRiskScore: 48,
    riskLevel: 'Medium',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'prop-103',
    address: '404 Industrial Parkway',
    city: 'Detroit',
    state: 'MI',
    zip: '48201',
    price: 620000,
    type: 'Commercial Warehouse',
    beds: 0,
    baths: 2,
    sqft: 8500,
    yearBuilt: 1978,
    status: 'Flagged',
    overallRiskScore: 82,
    riskLevel: 'High',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'prop-104',
    address: '890 Aspen Ridge Way',
    city: 'Breckenridge',
    state: 'CO',
    zip: '80424',
    price: 925000,
    type: 'Mountain Cabin',
    beds: 5,
    baths: 4.5,
    sqft: 3100,
    yearBuilt: 2005,
    status: 'Pending',
    overallRiskScore: 25,
    riskLevel: 'Low',
    lastUpdated: 'Yesterday'
  },
  {
    id: 'prop-105',
    address: '12 Baker Street',
    city: 'Boston',
    state: 'MA',
    zip: '02108',
    price: 1100000,
    type: 'Townhouse',
    beds: 3,
    baths: 2.5,
    sqft: 1950,
    yearBuilt: 1890,
    status: 'Approved',
    overallRiskScore: 18,
    riskLevel: 'Low',
    lastUpdated: '2 days ago'
  },
  {
    id: 'prop-106',
    address: '2350 Wildwood Canyon Rd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90049',
    price: 3200000,
    type: 'Single Family Villa',
    beds: 5,
    baths: 6,
    sqft: 5400,
    yearBuilt: 2012,
    status: 'In Progress',
    overallRiskScore: 54,
    riskLevel: 'Medium',
    lastUpdated: '3 days ago'
  }
];

export const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act-01',
    propertyId: 'prop-103',
    address: '404 Industrial Parkway',
    user: 'Elena Rostova',
    role: 'Legal Advisor',
    action: 'Flagged zoning non-compliance for easement violation',
    timestamp: '15 mins ago',
    status: 'danger'
  },
  {
    id: 'act-02',
    propertyId: 'prop-101',
    address: '742 Evergreen Terrace',
    user: 'David Kim',
    role: 'Financial Institution',
    action: 'Cleared financial assessment & valuation validation',
    timestamp: '1 hour ago',
    status: 'success'
  },
  {
    id: 'act-03',
    propertyId: 'prop-102',
    address: '112 Ocean Drive',
    user: 'System Bot',
    role: 'Backend Service',
    action: 'Retrieved environmental reports: Miami flood zone verification',
    timestamp: '2 hours ago',
    status: 'info'
  },
  {
    id: 'act-04',
    propertyId: 'prop-106',
    address: '2350 Wildwood Canyon Rd',
    user: 'Marcus Vance',
    role: 'Real Estate Agent',
    action: 'Submitted new property listing for due diligence assessment',
    timestamp: '4 hours ago',
    status: 'info'
  },
  {
    id: 'act-05',
    propertyId: 'prop-104',
    address: '890 Aspen Ridge Way',
    user: 'Alexander Cross',
    role: 'Administrator',
    action: 'Assigned legal advisor Elena Rostova to Breckenridge cabin',
    timestamp: 'Yesterday',
    status: 'success'
  }
];

export const MOCK_RISK_METRICS: Record<string, RiskMetric[]> = {
  'prop-101': [
    { category: 'Title & Ownership', score: 95, status: 'Clear', description: 'Clean history of ownership transfer, no liens found.' },
    { category: 'Zoning & Permits', score: 88, status: 'Clear', description: 'Fully compliant with residential zoning rules. Minor permit open but finalized.' },
    { category: 'Environmental & Flood', score: 92, status: 'Clear', description: 'Low flood risk area, not in wetland buffer.' },
    { category: 'Tax & Financials', score: 99, status: 'Clear', description: 'All property taxes paid in full for the past 5 years.' }
  ],
  'prop-102': [
    { category: 'Title & Ownership', score: 90, status: 'Clear', description: 'Ownership verified. Joint tenancy confirmed.' },
    { category: 'Zoning & Permits', score: 75, status: 'Review', description: 'Recent kitchen remodel permit lacks final city signature.' },
    { category: 'Environmental & Flood', score: 45, status: 'Review', description: 'Located in Miami Coastal High Hazard flood zone. Windstorm insurance required.' },
    { category: 'Tax & Financials', score: 85, status: 'Clear', description: 'Current tax year paid. No outstanding municipal assessments.' }
  ],
  'prop-103': [
    { category: 'Title & Ownership', score: 80, status: 'Clear', description: 'Title verified. Corporate holding company deed is correct.' },
    { category: 'Zoning & Permits', score: 15, status: 'Critical', description: 'Property extends 15ft into public easement. Zoning citation issued.' },
    { category: 'Environmental & Flood', score: 32, status: 'Critical', description: 'Soil contamination report suggests underground storage tank leakage.' },
    { category: 'Tax & Financials', score: 60, status: 'Review', description: 'Outstanding utility liens ($12,500) from former tenant.' }
  ]
};

export const MOCK_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-01',
    user: 'admin@example.com',
    action: 'USER_ROLE_CHANGE',
    ipAddress: '192.168.1.45',
    timestamp: '2026-08-30 18:24:12',
    details: 'Changed David Kim role to Financial Institution'
  },
  {
    id: 'log-02',
    user: 'legal@example.com',
    action: 'REPORT_DOWNLOADED',
    ipAddress: '192.168.1.112',
    timestamp: '2026-08-30 17:15:33',
    details: 'Downloaded PDF due diligence report for 404 Industrial Parkway'
  },
  {
    id: 'log-03',
    user: 'agent@example.com',
    action: 'PROPERTY_ADD',
    ipAddress: '10.0.2.14',
    timestamp: '2026-08-30 16:40:05',
    details: 'Created property record: 2350 Wildwood Canyon Rd'
  },
  {
    id: 'log-04',
    user: 'buyer@example.com',
    action: 'USER_LOGIN',
    ipAddress: '192.168.10.89',
    timestamp: '2026-08-30 15:30:00',
    details: 'Successful login with email buyer@example.com'
  }
];

export const getDashboardStatsByRole = (role: UserRole) => {
  switch (role) {
    case 'Buyer':
      return {
        stat1: { label: 'My Saved Properties', value: '3' },
        stat2: { label: 'Active Reports', value: '2' },
        stat3: { label: 'Completed Clearances', value: '2' },
        stat4: { label: 'Average Risk Rating', value: 'Low' }
      };
    case 'Real Estate Agent':
      return {
        stat1: { label: 'Properties Listed', value: '6' },
        stat2: { label: 'Due Diligence Pending', value: '2' },
        stat3: { label: 'Cleared Properties', value: '3' },
        stat4: { label: 'Avg Assessment Time', value: '4.2 Days' }
      };
    case 'Legal Advisor':
      return {
        stat1: { label: 'Assigned Cases', value: '4' },
        stat2: { label: 'Pending Legal Review', value: '2' },
        stat3: { label: 'Contracts Approved', value: '18' },
        stat4: { label: 'Alert Flag Rate', value: '8.4%' }
      };
    case 'Financial Institution':
      return {
        stat1: { label: 'Mortgage Valuations', value: '12' },
        stat2: { label: 'High Risk Escrows', value: '1' },
        stat3: { label: 'Assessments Done', value: '24' },
        stat4: { label: 'Lending Approval Rate', value: '82%' }
      };
    case 'Administrator':
      return {
        stat1: { label: 'Total Users Active', value: '142' },
        stat2: { label: 'System Uptime', value: '99.98%' },
        stat3: { label: 'API Integrations', value: '12/12 Connected' },
        stat4: { label: 'Unchecked Logs', value: '0 Critical' }
      };
  }
};
