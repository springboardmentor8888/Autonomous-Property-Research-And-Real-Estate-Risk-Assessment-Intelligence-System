import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, CheckCircle2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateProfile(name, email, phone, company);
    if (updated) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 rounded-2xl glass-panel max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-lg"
        />
        <div>
          <h3 className="text-base font-bold text-white leading-none mb-1.5">{user.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40">
            {user.role} Workspace
          </span>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-300 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile configuration updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Full Name</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Email Address</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Phone Contact</label>
            <input 
              type="text" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Firm/Company</label>
            <input 
              type="text" placeholder="Veritas Escrows" value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Update Profiles Record</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
