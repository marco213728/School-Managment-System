import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { LogoutIcon, MenuIcon, BellIcon } from '../icons/Icons';
import { Notification } from '../../types';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
    toggleSidebar: () => void;
    notifications: Notification[];
    onUpdateNotifications: (allNotifications: Notification[]) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, notifications, onUpdateNotifications }) => {
  const { user, logout } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const userNotifications = useMemo(() => {
      if (!user) return [];
      return notifications
        .filter(n => n.userId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user, notifications]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = useMemo(() => userNotifications.filter(n => !n.read).length, [userNotifications]);

  const handleMarkAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    onUpdateNotifications(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    const updatedNotifications = notifications.map(n => 
      n.userId === user.id ? { ...n, read: true } : n
    );
    onUpdateNotifications(updatedNotifications);
    setTimeout(() => setNotificationsOpen(false), 300); // Close panel after a small delay for better UX
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-slate-500 focus:outline-none lg:hidden">
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 ml-4 lg:ml-0">{institution?.name || 'Plataforma de Gestión Escolar'}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors duration-200"
            aria-label={`Ver notificaciones (${unreadCount} sin leer)`}
            aria-haspopup="true"
            aria-expanded={isNotificationsOpen}
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-rose-500 ring-2 ring-white">
                <span className="sr-only">Hay notificaciones nuevas</span>
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <NotificationsPanel
              notifications={userNotifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>

        <div className="h-8 border-l border-slate-200 mx-2 hidden sm:block"></div>
        
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-slate-800">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.role}</p>
        </div>
        <button onClick={logout} className="p-2 rounded-full hover:bg-rose-100 text-rose-500 transition-colors duration-200" aria-label="Cerrar sesión">
          <LogoutIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;