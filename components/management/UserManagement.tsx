import React, { useState, useMemo, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { User, Role, Class, Student, ScheduleEntry, Subject, TimeSlot, Room, Timetable } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, UsersIcon, CalendarIcon, FingerPrintIcon, CameraIcon, ClockIcon } from '../icons/Icons';
import UserForm from './UserForm';
import { FormularioCaracterizacionDocente } from './FormularioCaracterizacion';
import TeacherProfileModal from '../teacher/TeacherProfileModal';
import BiometricEnrollmentModal from '../staff/BiometricEnrollmentModal';

interface UserManagementProps {
  users: User[];
  allClasses: Class[];
  allStudents: Student[];
  onUpdateUsers: (users: User[]) => void;
  schedule?: ScheduleEntry[];
  subjects?: Subject[];
  timeSlots?: TimeSlot[];
  rooms?: Room[];
  timetables?: Timetable[];
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  allClasses, 
  allStudents, 
  onUpdateUsers,
  schedule = [],
  subjects = [],
  timeSlots = [],
  rooms = [],
  timetables = []
}) => {
    const { user: currentUser } = useContext(UserContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGethModalOpen, setIsGethModalOpen] = useState(false);
    const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [enrollingUser, setEnrollingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lowercasedTerm = searchTerm.toLowerCase();
        return users.filter(user => 
            user && (
                (user.name || '').toLowerCase().includes(lowercasedTerm) ||
                (user.email || '').toLowerCase().includes(lowercasedTerm) ||
                (user.role || '').toLowerCase().includes(lowercasedTerm)
            )
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
    
    const handleGeth = (user: User) => {
        setEditingUser(user);
        setIsGethModalOpen(true);
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
    
    const handleSaveGeth = (gethData: any) => {
        if (editingUser) {
            const updatedUsers = users.map(u => {
                if (u.id === editingUser.id) {
                    return { ...u, ...gethData };
                }
                return u;
            });
            onUpdateUsers(updatedUsers);
        }
        setIsGethModalOpen(false);
    };

    const handleSaveBiometrics = (updatedData: Partial<User>) => {
        if (!enrollingUser) return;
        const updatedUsers = users.map(u => {
            if (u.id === enrollingUser.id) {
                return { ...u, ...updatedData };
            }
            return u;
        });
        onUpdateUsers(updatedUsers);
        setEnrollingUser(prev => prev ? { ...prev, ...updatedData } : null);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
                {filteredUsers.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Usuario / Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contacto</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rol</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Régimen & Almuerzo</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Biometría & Facial</th>
                                <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => {
                                const isStaff = user.role !== Role.Parent && user.role !== Role.Student;
                                const isFD = user.tipoFuncionario === 'FD' || user.role === Role.Rector || user.role === Role.Vicerrector || user.role === Role.InspectorGeneral;
                                const lunchMins = user.allowedLunchMinutes ?? 30;
                                const hasFacial = !!(user.facialRegistered || user.facialPhotoUrl);
                                const hasFingerprint = !!user.biometricRegistered;

                                return (
                                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            {user.facialPhotoUrl || user.photoUrl ? (
                                                <img 
                                                    src={user.facialPhotoUrl || user.photoUrl} 
                                                    alt={user.name} 
                                                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200 shadow-xs" 
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                                                {user.cedula && (
                                                    <p className="text-[11px] text-slate-400 font-mono">CI: {user.cedula}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                                        <a href={`mailto:${user.email}`} className="text-primary-600 hover:underline block font-medium">{user.email}</a>
                                        {user.phone && <a href={`tel:${user.phone}`} className="text-slate-400 hover:underline block font-mono text-[11px]">{user.phone}</a>}
                                    </td>
                                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-700">
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* Régimen & Almuerzo (DMTH) */}
                                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-xs">
                                        {isStaff ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                        isFD 
                                                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                                                    }`} title={isFD ? 'Funcionario Directivo (Jornada 8.5h flexible)' : 'Otros (Docente/Administrativo horario estricto)'}>
                                                        {isFD ? 'FD (Directivo)' : 'OTROS'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold" title="Tiempo de almuerzo autorizado">
                                                        <ClockIcon className="h-2.5 w-2.5 inline mr-0.5" />
                                                        {lunchMins} min
                                                    </span>
                                                </div>
                                                {user.grupoOcupacional && (
                                                    <span className="text-[9px] text-slate-400 uppercase font-semibold truncate max-w-[140px]">
                                                        {user.grupoOcupacional}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-[11px]">-</span>
                                        )}
                                    </td>

                                    {/* Biometría & Facial Status */}
                                    <td className="px-3 py-3.5 whitespace-nowrap text-center text-xs">
                                        {isStaff ? (
                                            <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setEnrollingUser(user)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition ${
                                                        hasFacial 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                                    }`}
                                                    title={hasFacial ? 'Rostro oficial registrado. Click para ver o actualizar' : '¡Sin rostro oficial! Click para enrolar foto'}
                                                >
                                                    <CameraIcon className="h-3 w-3" />
                                                    {hasFacial ? 'Rostro OK' : 'Sin Rostro'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setEnrollingUser(user)}
                                                    className={`p-1 rounded-md text-[10px] border transition ${
                                                        hasFingerprint
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                    title={hasFingerprint ? 'Huella vinculada' : 'Sin huella registrada'}
                                                >
                                                    <FingerPrintIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-[11px]">-</span>
                                        )}
                                    </td>

                                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                        {user.role === Role.Teacher && (
                                            <>
                                                <button 
                                                    onClick={() => setSelectedTeacherForProfile(user)} 
                                                    className="p-1.5 text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition" 
                                                    title="Ver Ficha y Horario Asignado del Docente"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleGeth(user)} className="p-1.5 text-indigo-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-100 transition" title="Caracterización GETH">
                                                    <UsersIcon className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                        {isStaff && (
                                            <button 
                                                onClick={() => setEnrollingUser(user)} 
                                                className="p-1.5 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-100 transition" 
                                                title="Configurar Biometría (Rostro Oficial, Huella, PIN y Almuerzo)"
                                            >
                                                <FingerPrintIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-500 hover:text-primary-600 rounded-lg hover:bg-primary-100 transition" title="Editar Usuario"><EditIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-100 transition" title="Eliminar Usuario"><TrashIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                        <UsersIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-lg font-semibold text-slate-800">
                            {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm ? 'Intente con otro término de búsqueda.' : 'Comience añadiendo un nuevo usuario a la plataforma.'}
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Añadir Usuario
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Ficha y Horario del Docente */}
            {selectedTeacherForProfile && (
                <TeacherProfileModal
                    isOpen={!!selectedTeacherForProfile}
                    onClose={() => setSelectedTeacherForProfile(null)}
                    teacher={selectedTeacherForProfile}
                    classes={allClasses}
                    subjects={subjects}
                    schedule={schedule}
                    timeSlots={timeSlots}
                    timetables={timetables}
                    rooms={rooms}
                    users={users}
                    onEdit={handleEdit}
                />
            )}

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

            {isGethModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
                        <FormularioCaracterizacionDocente
                            initialData={editingUser}
                            onGuardarDocente={handleSaveGeth}
                            onCancelar={() => setIsGethModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {enrollingUser && (
                <BiometricEnrollmentModal
                    isOpen={!!enrollingUser}
                    onClose={() => setEnrollingUser(null)}
                    user={enrollingUser}
                    onSaveUser={handleSaveBiometrics}
                />
            )}
        </div>
    );
};

export default UserManagement;