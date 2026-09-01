import React, { useState } from 'react';
import type { Property } from '../../data/mockData';
import { MOCK_PROPERTIES } from '../../data/mockData';
import { Search, SlidersHorizontal, Shield, ArrowUpRight, Check, AlertTriangle, HelpCircle } from 'lucide-react';

interface PropertyListProps {
  onSelectProperty?: (property: Property) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({ onSelectProperty }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const filteredProperties = MOCK_PROPERTIES.filter((p) => {
    const matchesSearch = p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40">
            <Check className="w-3 h-3" /> Approved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-950/40 border border-blue-900/40 animate-pulse">
            Processing
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">
            <AlertTriangle className="w-3 h-3" /> Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            <HelpCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'Low':
        return <span className="text-[10px] font-bold text-emerald-400">Low Risk</span>;
      case 'Medium':
        return <span className="text-[10px] font-bold text-amber-400">Medium Risk</span>;
      case 'High':
        return <span className="text-[10px] font-bold text-red-400">High Risk</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-400">Unknown</span>;
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Property Due Diligence Log</h3>
          <p className="text-[10px] text-slate-400 font-medium">Verify structural zoning, title reports, and hazard indices</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-3 py-1 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 py-1 px-2.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">Processing</option>
            <option value="Flagged">Flagged</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 py-1 px-2.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="All">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Property Grid/List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-2">Address</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Market Price</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Risk Assessment</th>
              <th className="pb-3 pr-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs">
            {filteredProperties.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No properties matched the selected filters.
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-800/10 group transition duration-150">
                  <td className="py-3.5 pl-2 font-medium text-slate-200">
                    <div>{property.address}</div>
                    <span className="text-[10px] text-slate-500">{property.city}, {property.state} {property.zip}</span>
                  </td>
                  <td className="py-3.5 text-slate-400">{property.type}</td>
                  <td className="py-3.5 font-bold text-slate-300">
                    ${property.price.toLocaleString()}
                  </td>
                  <td className="py-3.5">{getStatusBadge(property.status)}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
                        <div 
                          className={`h-full rounded-full ${
                            property.riskLevel === 'Low' ? 'bg-emerald-500' :
                            property.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${property.overallRiskScore}%` }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white font-bold leading-none">{property.overallRiskScore}%</span>
                        {getRiskLevelBadge(property.riskLevel)}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => onSelectProperty?.(property)}
                      className="px-2.5 py-1.5 border border-slate-800 hover:border-emerald-500/30 bg-slate-900/60 hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-400 rounded-lg inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <span className="text-[10px] font-semibold">Audit File</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
