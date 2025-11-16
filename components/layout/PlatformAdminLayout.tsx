import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { LogoutIcon } from '../icons/Icons';

// FIX: Changed to React.FC with a typed props interface to avoid potential issues with children prop typing.
interface PlatformAdminLayoutProps {
    children: React.ReactNode;
}

const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({ children }) => {
    const { user, logout } = useContext(UserContext);

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
                    <div className="flex-1 text-left">
                        <h1 className="text-xl font-semibold text-gray-700">Platform Management</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                         <div className="text-right hidden sm:block">
                            <p className="font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.role}</p>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-200" aria-label="Cerrar sesión">
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