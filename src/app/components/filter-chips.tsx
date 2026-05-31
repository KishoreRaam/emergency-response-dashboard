import type { ServiceType } from '../data/emergency-services';
import { Building2, Shield, Ambulance, Truck, Wrench } from 'lucide-react';

interface FilterChipsProps {
  active: ServiceType | 'all';
  onFilter: (type: ServiceType | 'all') => void;
}

const filters: Array<{ value: ServiceType | 'all'; label: string; icon?: any }> = [
  { value: 'all', label: 'All' },
  { value: 'hospital', label: 'Hospital', icon: Building2 },
  { value: 'police', label: 'Police', icon: Shield },
  { value: 'ambulance', label: 'Ambulance', icon: Ambulance },
  { value: 'towing', label: 'Towing', icon: Truck },
  { value: 'puncture', label: 'Puncture', icon: Wrench }
];

export function FilterChips({ active, onFilter }: FilterChipsProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const isActive = active === filter.value;
        const Icon = filter.icon;
        
        return (
          <button
            key={filter.value}
            onClick={() => onFilter(filter.value)}
            className={`px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-[#4F46E5] text-white shadow-sm'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}