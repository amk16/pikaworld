import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationDock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/',
      icon: '/pikachu.png',
      label: 'Home',
      alt: 'Pikachu Home'
    },
    {
      path: '/gyming',
      icon: '/kratosPika.png',
      label: 'Gyming',
      alt: 'Kratos Pikachu'
    },
    {
      path: '/working',
      icon: '/deskPika.png',
      label: 'Working',
      alt: 'Desk Pikachu'
    },
    {
      path: '/socializing',
      icon: '/gokuPika.png',
      label: 'Socializing',
      alt: 'Goku Pikachu'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-[#ffeabb]rounded-3xl px-4 py-3">
        <div className="flex items-end space-x-6">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center transition-all duration-200 hover:scale-110 ${
                isActive(item.path) 
                  ? 'opacity-100 scale-110' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              title={item.label}
            >
              <div className={`w-12 rounded-xl overflow-hidden transition-all duration-200 ${
                item.path === '/gyming' ? 'h-20' : 'h-12'
              }`}>
                <img
                  src={item.icon}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                isActive(item.path) 
                  ? 'text-yellow-600' 
                  : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationDock;
