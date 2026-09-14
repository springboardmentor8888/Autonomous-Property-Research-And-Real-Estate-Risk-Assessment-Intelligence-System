import React, { useState } from 'react';
import type { Property, User, UserRole } from '../../data/mockData';
import { MOCK_PROPERTIES, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_RISK_METRICS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, MapPin, DollarSign, Home, AlertTriangle, ShieldCheck, Check, 
  PlusCircle, Edit2, CheckCircle2, UserCheck, ShieldAlert, FileText, ArrowRight
} from 'lucide-react';

// ==========================================
// 1. BUYER: SEARCH VIEW
// ==========================================
export const PropertySearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Property | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const found = MOCK_PROPERTIES.find(
      (p) => p.address.toLowerCase().includes(query.toLowerCase()) || 
             p.city.toLowerCase().includes(query.toLowerCase())
    );
    setResult(found || null);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl glass-panel">
        <h3 className="text-base font-bold text-white mb-2">Instant Due Diligence Lookup</h3>
        <p className="text-xs text-slate-400 mb-4">Enter any address to fetch structural, zoning, flood risk, and valuation clearances from the Veritas API.</p>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="e.g., 742 Evergreen Terrace or Miami..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <button 
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-xl cursor-pointer transition duration-150 shrink-0"
          >
            Audit Property
          </button>
        </form>
      </div>

      {searched && (
        <div className="p-6 rounded-2xl glass-panel border-emerald-500/20 glow-emerald">
          {result ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40">
                  Valuation Records Found
                </span>
                <h4 className="text-lg font-heading font-extrabold text-white mt-3">{result.address}</h4>
                <p className="text-xs text-slate-400 mb-4">{result.city}, {result.state} {result.zip}</p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Market Valuation</span>
                    <span className="text-base font-bold text-white">${result.price.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Structure Type</span>
                    <span className="text-slate-200 font-semibold">{result.type}</span>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Specs Summary</span>
                    <span className="text-slate-200 font-semibold">{result.beds} Beds • {result.baths} Baths</span>
                  </div>
                  <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">Risk Score Status</span>
                    <span className={`font-bold ${
                      result.riskLevel === 'Low' ? 'text-emerald-400' :
                      result.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
                    }`}>{result.overallRiskScore}% ({result.riskLevel})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-bold text-white border-b border-slate-800/60 pb-2">Due Diligence Clearances</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-slate-400">Title &amp; Ownership Deed</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Clear</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-slate-400">Zoning Setback Check</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Clear</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-slate-400">Coastal Flood Zone Index</span>
                    <span className={result.riskLevel === 'High' ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold flex items-center gap-1'}>
                      {result.riskLevel === 'High' ? 'Critical' : <><Check className="w-3 h-3" /> Clear</>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <span>No property records found matching "{query}". Try searching for "Miami" or "Evergreen".</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. AGENT: ADD PROPERTY VIEW
// ==========================================
export const AddPropertyView: React.FC = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Single Family Residence');
  const [beds, setBeds] = useState('3');
  const [baths, setBaths] = useState('2');
  const [sqft, setSqft] = useState('1500');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !price) return;

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      address,
      city,
      state,
      zip,
      price: Number(price),
      type,
      beds: Number(beds),
      baths: Number(baths),
      sqft: Number(sqft),
      yearBuilt: 2026,
      status: 'Pending',
      overallRiskScore: Math.floor(Math.random() * 40) + 10,
      riskLevel: 'Low',
      lastUpdated: 'Just now'
    };

    MOCK_PROPERTIES.unshift(newProperty);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    // Reset fields
    setAddress('');
    setCity('');
    setZip('');
    setPrice('');
  };

  return (
    <div className="p-6 rounded-2xl glass-panel max-w-2xl mx-auto">
      <h3 className="text-base font-bold text-white mb-2">Register Property for Auditing</h3>
      <p className="text-xs text-slate-400 mb-6">Create a property entry. Once submitted, Veritas APIs run structural tax checklists and zoning flood evaluations.</p>

      {success && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-300 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Property successfully listing queue registered! Veritas background assessors triggered.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Street Address</label>
          <input 
            type="text" required placeholder="e.g., 456 Pine Ln" value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">City</label>
            <input 
              type="text" required placeholder="Miami" value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">State</label>
            <input 
              type="text" required placeholder="FL" value={state} onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Zip</label>
            <input 
              type="text" required placeholder="33139" value={zip} onChange={(e) => setZip(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Listing Price ($)</label>
            <input 
              type="number" required placeholder="420000" value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Property Type</label>
            <select 
              value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="Single Family Residence">Single Family Residence</option>
              <option value="Luxury Condo">Luxury Condo</option>
              <option value="Commercial Warehouse">Commercial Warehouse</option>
              <option value="Townhouse">Townhouse</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-2.5 mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Verification Pipeline</span>
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 3. LEGAL ADVISOR: CONTRACT AUDITING
// ==========================================
export const LegalAuditingView: React.FC = () => {
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-103');
  const [checkList, setCheckList] = useState({
    titleSearch: true,
    easementAudit: false,
    deedVerification: true,
    zoningHeightLimits: false
  });

  const activeProp = MOCK_PROPERTIES.find(p => p.id === selectedPropId);

  const toggleCheck = (key: keyof typeof checkList) => {
    setCheckList(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = () => {
    if (activeProp) {
      activeProp.status = 'Approved';
      activeProp.overallRiskScore = 15;
      activeProp.riskLevel = 'Low';
      alert(`Title and easements cleared. Property ${activeProp.address} approved!`);
    }
  };

  return (
    <div className="grid md:grid-cols-12 gap-6">
      
      {/* Property Select Sidebar */}
      <div className="md:col-span-4 rounded-2xl glass-panel p-5 space-y-3">
        <h4 className="text-xs font-bold text-white border-b border-slate-800/80 pb-2">Active Audit Queue</h4>
        {MOCK_PROPERTIES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPropId(p.id)}
            className={`w-full p-3 rounded-xl border text-left text-xs transition ${
              selectedPropId === p.id 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white font-semibold' 
                : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="truncate">{p.address}</div>
            <div className="flex justify-between items-center mt-2 text-[10px]">
              <span className="text-slate-500">{p.city}</span>
              <span className={p.status === 'Flagged' ? 'text-red-400 font-semibold' : 'text-slate-400'}>{p.status}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Audit Checklist workspace */}
      <div className="md:col-span-8 rounded-2xl glass-panel p-6">
        {activeProp ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40">
                  Legal Audit Workspace
                </span>
                <h3 className="text-base font-heading font-extrabold text-white mt-3">{activeProp.address}</h3>
                <p className="text-xs text-slate-400">{activeProp.city}, {activeProp.state}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                activeProp.status === 'Flagged' ? 'bg-red-950/40 border-red-900/40 text-red-400' : 'bg-slate-900 text-slate-400'
              }`}>{activeProp.status}</span>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300">Title Deed &amp; Zoning Checklist</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={checkList.titleSearch} onChange={() => toggleCheck('titleSearch')} className="rounded border-slate-700 text-emerald-500 bg-slate-950" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Deed History Chain Verification</span>
                    <span className="text-[10px] text-slate-500">Search county database for legal heirs or split claims.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={checkList.easementAudit} onChange={() => toggleCheck('easementAudit')} className="rounded border-slate-700 text-emerald-500 bg-slate-950" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Utility Easement Clearances</span>
                    <span className="text-[10px] text-slate-500">Cross-reference physical fences with city water and power easements.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={checkList.deedVerification} onChange={() => toggleCheck('deedVerification')} className="rounded border-slate-700 text-emerald-500 bg-slate-950" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Municipal Tax Lien Validation</span>
                    <span className="text-[10px] text-slate-500">Confirm zero back taxes or school district debt remain.</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800/60">
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold rounded-lg cursor-pointer transition"
                >
                  Clear Title Deed
                </button>
                <button
                  onClick={() => alert('Property flagged for legal review.')}
                  className="px-4 py-2 border border-red-900/30 hover:bg-red-950/20 text-red-400 text-xs font-semibold rounded-lg cursor-pointer transition"
                >
                  Flag Legal Discrepancy
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">Select a property to begin the audit.</div>
        )}
      </div>

    </div>
  );
};

// ==========================================
// 4. FINANCIAL INSTITUTION: RISK ASSESSMENT
// ==========================================
export const FinancialRiskView: React.FC = () => {
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-102');
  const activeProp = MOCK_PROPERTIES.find(p => p.id === selectedPropId);
  const metrics = MOCK_RISK_METRICS[selectedPropId] || [];

  return (
    <div className="grid md:grid-cols-12 gap-6">
      <div className="md:col-span-4 rounded-2xl glass-panel p-5 space-y-3">
        <h4 className="text-xs font-bold text-white border-b border-slate-800/80 pb-2">Active Assessments</h4>
        {MOCK_PROPERTIES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPropId(p.id)}
            className={`w-full p-3 rounded-xl border text-left text-xs transition ${
              selectedPropId === p.id 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white font-semibold' 
                : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div>{p.address}</div>
            <div className="text-[10px] text-slate-500 mt-1">Price: ${p.price.toLocaleString()}</div>
          </button>
        ))}
      </div>

      <div className="md:col-span-8 rounded-2xl glass-panel p-6">
        {activeProp ? (
          <div className="space-y-6">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40">
                Lender Mortgage Valuation Risk
              </span>
              <h3 className="text-base font-heading font-extrabold text-white mt-3">{activeProp.address}</h3>
              <p className="text-xs text-slate-400">Current Assessment Status: <span className="font-bold text-white">{activeProp.status}</span></p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block">LTV Risk Ratio</span>
                <span className="text-sm font-bold text-white">72.4% (Clear)</span>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Property Price Index</span>
                <span className="text-sm font-bold text-white">+4.2% Above Avg</span>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Risk Grade</span>
                <span className={`text-sm font-bold ${
                  activeProp.riskLevel === 'Low' ? 'text-emerald-400' :
                  activeProp.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{activeProp.riskLevel}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Category Specific Hazards</h4>
              <div className="space-y-2.5">
                {metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">{m.category}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'Clear' ? 'bg-emerald-950 text-emerald-400' :
                        m.status === 'Review' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                      }`}>{m.status} ({m.score}%)</span>
                    </div>
                  </div>
                ))}
                {metrics.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-4">No granular hazard indices loaded for this property structure.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">Select a property to pull the hazard valuation files.</div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. ADMINISTRATOR: USER DIRECTORY & ROLE UPDATER
// ==========================================
export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setUsers(updated);
    // Reflect changes globally in MOCK_USERS so they can log in immediately
    const target = MOCK_USERS.find((u) => u.id === userId);
    if (target) target.role = newRole;
  };

  return (
    <div className="p-5 rounded-2xl glass-panel">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Active User Directory</h3>
          <p className="text-[10px] text-slate-400 font-medium">Configure roles and permissions for developers, buyers, and legal staff.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email Address</th>
              <th className="pb-3">Date Registered</th>
              <th className="pb-3">System Role Permission</th>
              <th className="pb-3 text-right">Quick Test Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/10 transition">
                <td className="py-3 font-semibold text-slate-200 flex items-center gap-2">
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                  <span>{u.name}</span>
                </td>
                <td className="py-3 text-slate-400">{u.email}</td>
                <td className="py-3">{u.joinedDate}</td>
                <td className="py-3 font-medium text-emerald-400">{u.role}</td>
                <td className="py-3 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="bg-slate-950 border border-slate-850 rounded py-0.5 px-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Real Estate Agent">Real Estate Agent</option>
                    <option value="Legal Advisor">Legal Advisor</option>
                    <option value="Financial Institution">Financial Institution</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 6. ADMINISTRATOR: IMMUTABLE AUDIT LOGS
// ==========================================
export const AuditLogsView: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl glass-panel">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Security Audit Trail</h3>
        <p className="text-[10px] text-slate-400 font-medium">Replicating operations with local storage hashes for security audits</p>
      </div>

      <div className="space-y-3">
        {MOCK_AUDIT_LOGS.map((log) => (
          <div key={log.id} className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl flex items-start gap-4 text-xs">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-400 font-semibold text-[10px] uppercase">
              {log.action.replace('_', ' ')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="font-semibold text-slate-300">{log.user}</span>
                <span className="text-slate-500">{log.timestamp} • IP: {log.ipAddress}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
