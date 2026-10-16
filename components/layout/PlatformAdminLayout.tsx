
import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { LogoutIcon, DashboardIcon, SparklesIcon, MenuIcon } from '../icons/Icons';
import Sidebar from './Sidebar'; // Import standard sidebar for navigation
import AmautaLogo from '../branding/AmautaLogo';

interface PlatformAdminLayoutProps {
    children: React.ReactNode;
}

const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({ children }) => {
    const { user, logout, openProfileModal } = useContext(UserContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1">
                            <MenuIcon className="h-6 w-6 text-gray-500" />
                        </button>
                        <div className="flex items-center gap-3">
                            <AmautaLogo className="h-9 w-auto" mode="light" />
                            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                                <span className="text-xs bg-slate-900 text-amber-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Consola SuperAdmin
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Control Federado</span>
                            </div>
                        </div>
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
