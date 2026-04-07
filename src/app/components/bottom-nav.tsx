import { Map, Search, Bot, Settings, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Map, label: 'Map', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Heart, label: 'First Aid', path: '/first-aid' },
    { icon: Bot, label: 'AI', path: '/ai' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-[#8888AA]/20 z-50">
      <div className="max-w-[430px] mx-auto px-4 py-3 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/first-aid' && location.pathname.startsWith('/first-aid'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-[#D62828]' : 'text-[#8888AA] hover:text-[#F0F0F0]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}