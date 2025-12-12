
import React, { useState, useMemo, useContext } from 'react';
import { ProtocolCase, Student, User, Role } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { PlusIcon, AlertTriangleIcon, CheckCircleIcon, UsersIcon, SearchIcon, ClockIcon, ArchiveBoxIcon } from '../icons/Icons';
import ProtocolCaseForm from './ProtocolCaseForm';
import ProtocolRepository from './ProtocolRepository';
import { MOCK_PROTOCOL_CASES } from '../../constants'; // Import Mocks

interface ProtocolManagementProps {
    students: Student[];
    users: User[];
}

const ProtocolManagement: React.FC<ProtocolManagementProps> = ({ students, users }) => {
    const { user: currentUser } = useContext(UserContext);
    const [cases, setCases] = useState<ProtocolCase[]>(MOCK_PROTOCOL_CASES); // Initialize with Mocks
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isRepoOpen, setIsRepoOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<ProtocolCase | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const authorizedRoles = [Role.InspectorGeneral, Role.Rector, Role.JefeDECE, Role.PsicologoEducativo, Role.InstitutionAdmin];
    const canView = currentUser && authorizedRoles.includes(currentUser.role);

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    
    // Filter logic
    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const studentName = studentMap.get(c.studentId)?.name.toLowerCase() || '';
            const typeMatch = c.violenceType.toLowerCase().includes(searchTerm.toLowerCase());
            return studentName.includes(searchTerm.toLowerCase()) || typeMatch;
        });
    }, [cases, searchTerm, studentMap]);

    // Check deadlines
    const checkDeadline = (c: ProtocolCase) => {
        if (!c.denunciaDeadline) return 'normal';
        const now = new Date();
        const deadline = new Date(c.denunciaDeadline);
        const diff = deadline.getTime() - now.getTime();
        if (diff < 0) return 'expired';
        if (diff < 1000 * 60 * 60 * 4) return 'urgent'; // Less than 4 hours
        return 'normal';
    };

    const handleSaveCase = (caseData: ProtocolCase) => {
        if (cases.some(c => c.id === caseData.id)) {
            setCases(cases.map(c => c.id === caseData.id ? caseData : c));
        } else {
            setCases([...cases, caseData]);
        }
        setIsFormOpen(false);
        setEditingCase(null);
    };

    if (!canView) return <div className="p-4 text-red-600 bg-red-50 rounded">Acceso restringido. Solo Inspección General y DECE.</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <UsersIcon className="h-6 w-6 text-indigo-600" />
                        Rutas y Protocolos de Violencia
                    </h3>
                    <p className="text-sm text-gray-500">Gestión de casos de violencia detectados en la institución.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsRepoOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-md hover:bg-indigo-200 shadow-sm"
                    >
                        <ArchiveBoxIcon className="h-5 w-5" /> Repositorio Normativa
                    </button>
                    <button 
                        onClick={() => { setEditingCase(null); setIsFormOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 shadow-sm"
                    >
                        <PlusIcon className="h-5 w-5" /> Nueva Alerta
                    </button>
                </div>
            </div>

            <div className="mb-4 relative">
                 <input 
                    type="text" 
                    placeholder="Buscar caso por estudiante o tipo..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredCases.map(c => {
                    const student = studentMap.get(c.studentId);
                    const deadlineStatus = checkDeadline(c);
                    
                    return (
                        <div key={c.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white relative overflow-hidden">
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.status === 'Cerrado' ? 'bg-gray-400' : c.severity.includes('Delito') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${c.violenceType === 'Sexual' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                            {c.violenceType}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">#{c.id.slice(-4)}</span>
                                        {c.isSexualViolence && <span className="text-[10px] bg-red-100 text-red-800 px-2 rounded border border-red-200 flex items-center gap-1"><AlertTriangleIcon className="h-3 w-3"/> Mediación Prohibida</span>}
                                    </div>
                                    <h4 className="font-bold text-gray-800">{student?.name || 'Estudiante Desconocido'}</h4>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{c.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">Detectado: {new Date(c.dateDetected).toLocaleDateString()}</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                     {/* Critical Deadline Alert */}
                                    {c.severity.includes('Delito') && !c.denunciaFiled && c.status !== 'Cerrado' && (
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold ${deadlineStatus === 'expired' ? 'bg-red-600 text-white animate-pulse' : deadlineStatus === 'urgent' ? 'bg-orange-500 text-white' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            <ClockIcon className="h-4 w-4" />
                                            {deadlineStatus === 'expired' ? 'PLAZO DENUNCIA VENCIDO' : 'Denuncia Obligatoria (24h)'}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                         <span className={`text-sm font-semibold px-3 py-1 rounded-full ${c.status === 'Cerrado' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-700'}`}>
                                            {c.status}
                                        </span>
                                        <button 
                                            onClick={() => { setEditingCase(c); setIsFormOpen(true); }}
                                            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 text-gray-700"
                                        >
                                            Gestionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredCases.length === 0 && <p className="text-center text-gray-500 py-8">No hay casos registrados.</p>}
            </div>

            {isFormOpen && (
                <ProtocolCaseForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSaveCase}
                    caseToEdit={editingCase}
                    students={students}
                    currentUser={currentUser!}
                />
            )}

            {isRepoOpen && (
                <ProtocolRepository 
                    isOpen={isRepoOpen}
                    onClose={() => setIsRepoOpen(false)}
                />
            )}
        </div>
    );
};

export default ProtocolManagement;
