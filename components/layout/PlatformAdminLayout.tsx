
import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { LogoutIcon, DashboardIcon, SparklesIcon, MenuIcon } from '../icons/Icons';
import Sidebar from './Sidebar'; // Import standard sidebar for navigation

interface PlatformAdminLayoutProps {
    children: React.ReactNode;
}

const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({ children }) => {
    const { user, logout, openProfileModal } = useContext(UserContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1">
                            <MenuIcon className="h-6 w-6 text-gray-500" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-700">Administración Global Amauta</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button 
                            type="button"
                            onClick={openProfileModal}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition group text-left"
                            title="Editar mi perfil / cambiar contraseña"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors leading-tight">{user?.name}</p>
                                <p className="text-[11px] text-gray-500 leading-tight">{user?.role} <span className="text-blue-600 underline text-[10px]">Editar</span></p>
                            </div>
                        </button>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-200" aria-label="Cerrar sesión" title="Cerrar sesión">
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PlatformAdminLayout;
