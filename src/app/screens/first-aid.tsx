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
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#8888AA]/10">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-[#1A1A2E] rounded-full flex items-center justify-center hover:bg-[#252538] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#F0F0F0]" />
            </button>
            <h1 className="text-xl font-bold text-[#F0F0F0]">First Aid Guide</h1>
          </div>
          <div className="bg-[#06D6A0]/20 text-[#06D6A0] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#06D6A0] rounded-full" />
            Works Offline
          </div>
        </div>
      </div>
      
      {/* Warning Banner */}
      <div className="bg-[#FFB703]/20 border-y border-[#FFB703]/30 px-5 py-4">
        <div className="flex gap-3">
          <div className="text-[#FFB703] text-lg flex-shrink-0">⚠️</div>
          <p className="text-sm text-[#FFB703] leading-relaxed">
            This guide does not replace professional help — Call <span className="font-bold">108</span> immediately in emergencies
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-5 py-6 space-y-8">
        {/* CRITICAL Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#D62828] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-[#D62828] tracking-widest">CRITICAL</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {criticalInjuries.map((injury) => {
              const Icon = iconMap[injury.icon];
              return (
                <button
                  key={injury.id}
                  onClick={() => navigate(`/first-aid/${injury.id}`)}
                  className="bg-[#1A1A2E] rounded-2xl p-4 text-left hover:bg-[#252538] transition-all active:scale-95 border-l-4 border-[#D62828] shadow-lg shadow-[#D62828]/20"
                >
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#F0F0F0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#F0F0F0] text-sm mb-2 leading-tight">
                    {injury.name}
                  </h3>
                  <div className="flex items-center justify-end">
                    <div className="bg-[#D62828]/20 text-[#D62828] px-2 py-1 rounded-lg text-xs font-semibold">
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
            <div className="w-2 h-2 bg-[#FFB703] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-[#FFB703] tracking-widest">SERIOUS</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {seriousInjuries.map((injury) => {
              const Icon = iconMap[injury.icon];
              return (
                <button
                  key={injury.id}
                  onClick={() => navigate(`/first-aid/${injury.id}`)}
                  className="bg-[#1A1A2E] rounded-2xl p-4 text-left hover:bg-[#252538] transition-all active:scale-95 border-l-4 border-[#FFB703]"
                >
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#F0F0F0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#F0F0F0] text-sm mb-2 leading-tight">
                    {injury.name}
                  </h3>
                  <div className="flex items-center justify-end">
                    <div className="bg-[#FFB703]/20 text-[#FFB703] px-2 py-1 rounded-lg text-xs font-semibold">
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
            <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-[#06D6A0] tracking-widest">MODERATE</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {moderateInjuries.map((injury) => {
              const Icon = iconMap[injury.icon];
              return (
                <button
                  key={injury.id}
                  onClick={() => navigate(`/first-aid/${injury.id}`)}
                  className="bg-[#1A1A2E] rounded-2xl p-4 text-left hover:bg-[#252538] transition-all active:scale-95 border-l-4 border-[#06D6A0]"
                >
                  <div className="mb-3">
                    <Icon className="w-8 h-8 text-[#F0F0F0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#F0F0F0] text-sm mb-2 leading-tight">
                    {injury.name}
                  </h3>
                  <div className="flex items-center justify-end">
                    <div className="bg-[#06D6A0]/20 text-[#06D6A0] px-2 py-1 rounded-lg text-xs font-semibold">
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
