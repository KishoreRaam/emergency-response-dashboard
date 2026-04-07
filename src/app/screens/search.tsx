import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { emergencyServices, type ServiceType } from '../data/emergency-services';
import { ServiceCard } from '../components/service-card';
import { BottomNav } from '../components/bottom-nav';
import { useNavigate } from 'react-router';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const filteredServices = emergencyServices.filter((service) =>
    service.name.toLowerCase().includes(query.toLowerCase()) ||
    service.address.toLowerCase().includes(query.toLowerCase()) ||
    service.type.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="bg-[#1A1A2E] px-4 py-4 border-b border-[#8888AA]/20 sticky top-0 z-10">
        <h1 className="font-bold text-[#F0F0F0] text-lg mb-3">Search Services</h1>
        
        {/* Search Input */}
        <div className="bg-[#0D0D0D] rounded-2xl px-4 py-3 flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[#8888AA]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, police stations..."
            className="flex-1 bg-transparent text-[#F0F0F0] placeholder:text-[#8888AA] outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#8888AA] hover:text-[#F0F0F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Results */}
      <div className="p-4">
        {query === '' ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-[#8888AA]/30 mx-auto mb-4" />
            <h3 className="text-[#F0F0F0] font-semibold mb-2">Search for services</h3>
            <p className="text-[#8888AA] text-sm">
              Find hospitals, police stations, ambulances, and more
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-[#8888AA]/30 mx-auto mb-4" />
            <h3 className="text-[#F0F0F0] font-semibold mb-2">No results found</h3>
            <p className="text-[#8888AA] text-sm">
              Try searching for a different service or location
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#8888AA] mb-4">
              {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'} found
            </p>
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => navigate(`/service/${service.id}`)}
              />
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}