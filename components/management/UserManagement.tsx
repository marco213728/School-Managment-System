import React, { useState, useMemo, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { User, Role, Class, Student } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../icons/Icons';
import UserForm from './UserForm';

interface UserManagementProps {
  users: User[];
  allClasses: Class[];
  allStudents: Student[];
  onUpdateUsers: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, allClasses, allStudents, onUpdateUsers }) => {
    const { user: currentUser } = useContext(UserContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lowercasedTerm = searchTerm.toLowerCase();
        return users.filter(user => 
            user.name.toLowerCase().includes(lowercasedTerm) ||
            user.email.toLowerCase().includes(lowercasedTerm) ||
            user.role.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, users]);

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            onUpdateUsers(users.filter(u => u.id !== userId));
        }
    };

    const handleSave = (userToSave: Omit<User, 'id'> & { id?: string }) => {
        if (userToSave.id) {
            const updatedUsers = users.map(u => {
                if (u.id === userToSave.id) {
                    const finalUser = { ...u, ...userToSave };
                    if (!userToSave.password) {
                        finalUser.password = u.password;
                    }
                    return finalUser;
                }
                return u;
            });
            onUpdateUsers(updatedUsers);
        } else {
            const newUser: User = {
                ...userToSave,
                id: `user-${Date.now()}`,
                institutionId: currentUser?.institutionId,
            } as User;
            onUpdateUsers([...users, newUser]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Gestionar Usuarios</h3>
                <div className="relative w-full md:w-auto">
                    <input 
                        type="text"
                        placeholder="Buscar por nombre, email, rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
                >
                    <PlusIcon className="h-5 w-5" />
                    Añadir Usuario
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a href={`mailto:${user.email}`} className="text-primary-600 hover:underline block">{user.email}</a>
                                        {user.phone && <a href={`tel:${user.phone}`} className="text-gray-500 hover:underline block">{user.phone}</a>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No se encontraron usuarios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <UserForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    userToEdit={editingUser}
                    allClasses={allClasses}
                    allStudents={allStudents}
                />
            )}
        </div>
    );
};

export default UserManagement;