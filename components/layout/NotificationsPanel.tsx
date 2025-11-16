
import React from 'react';
import { Notification } from '../../types';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
        {unreadCount > 0 && <p className="text-sm text-gray-500">Tienes {unreadCount} notificaciones sin leer.</p>}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => onMarkAsRead(notif.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors duration-150 ${!notif.read ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-start">
                {!notif.read && <span className="flex-shrink-0 w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5 mr-3"></span>}
                <div className={notif.read ? 'pl-5' : ''}>
                  <p className="font-semibold text-gray-800">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notif.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No tienes notificaciones.
          </div>
        )}
      </div>
      {unreadCount > 0 && (
        <div className="p-2 bg-gray-50 border-t">
          <button
            onClick={onMarkAllAsRead}
            className="w-full text-sm text-primary-600 font-semibold hover:underline focus:outline-none"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
