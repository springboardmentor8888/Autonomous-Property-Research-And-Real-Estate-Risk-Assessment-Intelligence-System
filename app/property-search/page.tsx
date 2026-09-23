'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { propertyApi, type PropertySearchRequest } from '@/lib/api';
import { toastError } from '@/lib/useToast';

export default function PropertySearch() {
  const router = useRouter();

  const [formData, setFormData] = useState<PropertySearchRequest>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    houseFlatPlot: '',
    buildingSociety: '',
    streetRoad: '',
    locality: '',
    district: '',
    propertyName: '',
    propertyType: '',
  });
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const authReady = useAuthGuard({ loginPath: '/' });

  const handleChange = (field: keyof PropertySearchRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (invalid) setInvalid(false);
  };

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    // Validate required fields
    if (!formData.address.trim()) {
      toastError('Please enter the property address.');
      return;
    }
    if (!formData.city.trim()) {
      toastError('Please enter the city.');
      return;
    }
    if (!formData.state.trim()) {
      toastError('Please enter the state.');
      return;
    }

    setLoading(true);
    setInvalid(false);

    try {
      const res = await propertyApi.searchByAddress(formData);

      if (res.data?.status === 'VALID') {
        const firstResult = res.data?.results?.[0];
        const propertyId = firstResult?.propertyId;
        router.push(propertyId ? `/property-details?propertyId=${propertyId}` : '/property-details');
      } else if (res.data?.status === 'INVALID') {
        // Genuinely invalid address (e.g. ZERO_RESULTS from Google)
        setInvalid(true);
      } else {
        // ERROR state (e.g. Google API key invalid, service unavailable)
        toastError(res.message || 'Address validation service is currently unavailable. Please try again later.');
      }
    } catch (err: any) {
      toastError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="page-header">
        <div>
          <nav className="text-xs font-medium text-slate-500">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-slate-900"
            >
              Dashboard
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">Search Property</span>
          </nav>
          <h1 className="page-title mt-2">Search Property</h1>
          <p className="page-subtitle">
            Validate an Indian address with Google Geocoding and load property details.
          </p>
        </div>
      </header>

      <section className="card p-8">
        <form onSubmit={handleSearch} className="space-y-5">
          {/* Required Fields */}
          <div className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="text-sm font-semibold text-slate-700">Required Information</h3>
            
            <div>
              <label htmlFor="address" className="label-base">Address <span className="text-rose-500">*</span></label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. 23, MG Road"
                className="input-base"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="label-base">City <span className="text-rose-500">*</span></label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="input-base"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="state" className="label-base">State <span className="text-rose-500">*</span></label>
                <input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="input-base"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Optional Address Fields */}
          <div className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="text-sm font-semibold text-slate-700">Address Details (Optional)</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pincode" className="label-base">PIN Code</label>
                <input
                  id="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="e.g. 560001"
                  className="input-base"
                  disabled={loading}
                  maxLength={10}
                />
              </div>
              <div>
                <label htmlFor="district" className="label-base">District</label>
                <input
                  id="district"
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="e.g. Bengaluru Urban"
                  className="input-base"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="houseFlatPlot" className="label-base">House/Flat/Plot No.</label>
                <input
                  id="houseFlatPlot"
                  type="text"
                  value={formData.houseFlatPlot}
                  onChange={(e) => handleChange('houseFlatPlot', e.target.value)}
                  placeholder="e.g. Flat 302, Plot 45"
                  className="input-base"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="buildingSociety" className="label-base">Building/Society</label>
                <input
                  id="buildingSociety"
                  type="text"
                  value={formData.buildingSociety}
                  onChange={(e) => handleChange('buildingSociety', e.target.value)}
                  placeholder="e.g. Prestige Shantiniketan"
                  className="input-base"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="streetRoad" className="label-base">Street/Road</label>
                <input
                  id="streetRoad"
                  type="text"
                  value={formData.streetRoad}
                  onChange={(e) => handleChange('streetRoad', e.target.value)}
                  placeholder="e.g. Whitefield Main Road"
                  className="input-base"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="locality" className="label-base">Locality/Area</label>
                <input
                  id="locality"
                  type="text"
                  value={formData.locality}
                  onChange={(e) => handleChange('locality', e.target.value)}
                  placeholder="e.g. Whitefield"
                  className="input-base"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Optional Property Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Property Metadata (Optional)</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="propertyName" className="label-base">Property Name</label>
                <input
                  id="propertyName"
                  type="text"
                  value={formData.propertyName}
                  onChange={(e) => handleChange('propertyName', e.target.value)}
                  placeholder="e.g. My Dream Home"
                  className="input-base"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="propertyType" className="label-base">Property Type</label>
                <input
                  id="propertyType"
                  type="text"
                  value={formData.propertyType}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  placeholder="e.g. Apartment, Villa, Commercial"
                  className="input-base"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Searching…' : 'Search Property'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>

          {invalid && (
            <p className="text-sm font-medium text-rose-600">Invalid address - could not be validated</p>
          )}
        </form>
      </section>
    </main>
  );
}
