import { useNavigate } from 'react-router';
import { ArrowLeft, Brain, Droplet, UserX, HeartPulse, Bone, Accessibility, Flame, Heart, Bandage, Eye, Activity, Wind } from 'lucide-react';
import { injuries, getSeverityColor, getSeverityLabel, getInjuriesBySeverity } from '../data/first-aid';
import { BottomNav } from '../components/bottom-nav';

const iconMap: Record<string, any> = {
  'brain': Brain,
  'droplet': Droplet,
  'user-x': UserX,
  'heart-pulse': HeartPulse,
  'bone': Bone,
  'accessibility': Accessibility,
  'flame': Flame,
  'heart': Heart,
  'bandage': Bandage,
  'eye': Eye,
  'activity': Activity,
  'wind': Wind
};

export function FirstAidScreen() {
  const navigate = useNavigate();
  
  const criticalInjuries = getInjuriesBySeverity('critical');
  const seriousInjuries = getInjuriesBySeverity('serious');
  const moderateInjuries = getInjuriesBySeverity('moderate');
  
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAFBFC] border-b border-[#E5E7EB]">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center hover:bg-[#F3F4F6] transition-colors border border-[#E5E7EB]"
            >
              <ArrowLeft className="w-5 h-5 text-[#111827]" />
            </button>
            <h1 className="text-xl font-bold text-[#111827]">First Aid Guide</h1>
          </div>
          <div className="bg-[#10B981]/20 text-[#10B981] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
            Works Offline
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-[#F59E0B]/20 border-y border-[#F59E0B]/30 px-5 py-4">
        <div className="flex gap-3">
          <div className="text-[#F59E0B] text-lg flex-shrink-0">⚠️</div>
          <p className="text-sm text-[#F59E0B] leading-relaxed">
            This guide does not replace professional help — Call <span className="font-bold">108</span> immediately in emergencies
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 space-y-8">
        {/* CRITICAL Section — keeps red per semantic rule */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#DC2626] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-[#DC2626] tracking-widest">CRITICAL</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {criticalInjuries.map((injury) => {
              const Icon = iconMap[injury.icon];
              return (
                <button
                  key={injury.id}
                  onClick={() => navigate(`/first-aid/${injury.id}`)}
                  className="bg-[#FFFFFF] rounded-2xl p-4 text-left hover:bg-[#F3F4F6] transition-all active:scale-95 border-l-4 border-[#DC2626] shadow-sm shadow-[#DC2626]/10 border border-[#E5E7EB]"
                >
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#111827]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#111827] text-sm mb-2 leading-tight">
                    {injury.name}
                  </h3>
                  <div className="flex items-center justify-end">
                    <div className="bg-[#DC2626]/10 text-[#DC2626] px-2 py-1 rounded-lg text-xs font-semibold">
                      CRITICAL
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SERIOUS Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-[#F59E0B] tracking-widest">SERIOUS</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {seriousInjuries.map((injury) => {
              const Icon = iconMap[injury.icon];
              return (
                <button
                  key={injury.id}
                  onClick={() => navigate(`/first-aid/${injury.id}`)}
                  className="bg-[#FFFFFF] rounded-2xl p-4 text-left hover:bg-[#F3F4F6] transition-all active:scale-95 border-l-4 border-[#F59E0B] border border-[#E5E7EB]"
                >
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#111827]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#111827] text-sm mb-2 leading-tight">
                    {injury.name}
                  </h3>
                  <div className="flex items-center justify-end">
                    <div className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded-lg text-xs font-semibold">
                      SERIOUS
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODERATE Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-[#10B981] tracking-widest">MODERATE</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {moderateInjuries.map((injury) => {
              const Icon = iconMap[injury.icon];
              return (
                <button
                  key={injury.id}
                  onClick={() => navigate(`/first-aid/${injury.id}`)}
                  className="bg-[#FFFFFF] rounded-2xl p-4 text-left hover:bg-[#F3F4F6] transition-all active:scale-95 border-l-4 border-[#10B981] border border-[#E5E7EB]"
                >
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#111827]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#111827] text-sm mb-2 leading-tight">
                    {injury.name}
                  </h3>
                  <div className="flex items-center justify-end">
                    <div className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded-lg text-xs font-semibold">
                      MODERATE
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
