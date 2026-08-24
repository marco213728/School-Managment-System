import React, { useState, useContext } from 'react';
import { User, Role, JobVacancy, Candidate, PerformanceEvaluation, StaffAttendanceRecord } from '../../types';
import { MOCK_JOB_VACANCIES, MOCK_CANDIDATES, MOCK_PERFORMANCE_EVALUATIONS } from '../../constants';
import { UsersIcon, ClipboardDocumentCheckIcon, SparklesIcon, CalendarIcon } from '../icons/Icons';
import AmautaGETHForm from "./AmautaGETHForm";
import { InstitutionContext } from "../../contexts/UserContext";

interface HRISDashboardProps {
    users: User[];
    staffAttendanceRecords: StaffAttendanceRecord[];
}

const HRISDashboard: React.FC<HRISDashboardProps> = ({ users, staffAttendanceRecords }) => {
    const [activeTab, setActiveTab] = useState<'nomina' | 'reclutamiento' | 'asistencia' | 'desempeno' | 'caracterizacion'>('nomina');
    
    // States for Recruitment
    const [vacancies] = useState<JobVacancy[]>(MOCK_JOB_VACANCIES);
    const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);

    // States for Performance
    const [evaluations] = useState<PerformanceEvaluation[]>(MOCK_PERFORMANCE_EVALUATIONS);
    const { institution } = useContext(InstitutionContext);
    const filteredUsers = users.filter(u => u.institutionId === institution?.id);
    const filteredVacancies = vacancies.filter(v => v.institutionId === institution?.id);
    const filteredCandidates = candidates.filter(c => filteredVacancies.some(v => v.id === c.vacancyId));
    const filteredEvaluations = evaluations.filter(e => e.institutionId === institution?.id);
    const filteredAttendance = staffAttendanceRecords.filter(r => filteredUsers.some(u => u.id === r.userId));

    const renderNomina = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Estructura de Personal (Multirrol)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Docentes', 'Directivos', 'Administrativo (PAS)', 'Salud/DECE'].map(group => (
                    <div key={group} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-700">{group}</h4>
                        <div className="text-3xl font-bold text-primary-600 mt-2">
                            {filteredUsers.filter(u => {
                                if (group === 'Docentes') return u.role === Role.Teacher;
                                if (group === 'Directivos') return [Role.Rector, Role.Vicerrector, Role.InspectorGeneral].includes(u.role);
                                if (group === 'Salud/DECE') return [Role.JefeDECE, Role.PsicologoEducativo, Role.HealthProfessional].includes(u.role);
                                return u.role === Role.InstitutionAdmin;
                            }).length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Colaboradores activos</p>
                    </div>
                ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Organizacional</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Régimen</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.filter(u => u.role !== Role.Student && u.role !== Role.Parent).map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.role === Role.Teacher || user.role === Role.Vicerrector ? 'LOEI' : 'LOSEP'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReclutamiento = () => {
        const stages = ['Aplicado', 'Preseleccionado', 'Prueba Técnica', 'Entrevista', 'Referencias', 'Seleccionado'];
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Pipeline de Reclutamiento (Kanban)</h3>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                        + Nueva Vacante
                    </button>
                </div>
                
                <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
                    {filteredVacancies.map(v => (
                        <div key={v.id} className="min-w-[250px] bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{v.status}</span>
                            <h4 className="font-bold text-gray-800 mt-2">{v.title}</h4>
                            <p className="text-sm text-gray-600">{v.department} • {v.contractType}</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Salario referencial: {v.salaryRange}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 h-[500px]">
                    {stages.map(stage => (
                        <div key={stage} className="bg-gray-50 w-72 flex-shrink-0 rounded-xl p-3 border border-gray-200 flex flex-col">
                            <h4 className="font-bold text-gray-700 mb-3 px-2 flex justify-between">
                                {stage}
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                    {filteredCandidates.filter(c => c.stage === stage).length}
                                </span>
                            </h4>
                            <div className="space-y-3 overflow-y-auto flex-1">
                                {filteredCandidates.filter(c => c.stage === stage).map(candidate => (
                                    <div key={candidate.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-grab">
                                        <div className="font-medium text-sm text-gray-900">{candidate.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{filteredVacancies.find(v => v.id === candidate.vacancyId)?.title}</div>
                                        {candidate.score && (
                                            <div className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                                                Puntaje: {candidate.score}/100
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderAsistencia = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Control de Asistencia y Permanencia</h3>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-sm text-amber-800">
                <span className="font-bold">Monitoreo Antifraude:</span> Todos los registros de asistencia en sitio están auditados mediante georreferenciación. Las desviaciones al perímetro permitido se reportan automáticamente.
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marcaciones</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validación Geo</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAttendance.map(record => {
                            const user = filteredUsers.find(u => u.id === record.userId);
                            return (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-2">
                                            {record.punches.map((p, i) => (
                                                <span key={i} className={`px-2 py-1 text-xs rounded-full ${p.type.includes('in') ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                                                    {p.time} ({p.type})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {record.punches[0]?.verificationStatus === 'Failed' ? (
                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Fuera de Rango ({record.punches[0].distanceFromInstitution}m)</span>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Verificado en Campus</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredAttendance.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                    No hay registros de asistencia en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDesempeno = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Evaluación Anual (Guía 31) y Carpeta de Evidencias</h3>
            
            <div className="grid grid-cols-1 gap-4">
                {filteredEvaluations.map(ev => {
                    const user = filteredUsers.find(u => u.id === ev.userId);
                    return (
                        <div key={ev.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3 border-r pr-6">
                                <h4 className="font-bold text-lg text-gray-900">{user?.name}</h4>
                                <p className="text-sm text-gray-500 mb-4">Periodo: {ev.year}</p>
                                
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-black text-indigo-600">{ev.totalScore}</span>
                                    <span className="text-sm text-gray-500 font-medium mb-1">/ 100 pts</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${ev.totalScore}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500 text-right">{ev.status}</p>
                            </div>
                            
                            <div className="md:w-2/3 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="text-xs text-gray-500 font-semibold mb-1">Competencias Funcionales (70%)</div>
                                        <div className="font-bold text-gray-800">{ev.functionalScore} / 70</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="text-xs text-gray-500 font-semibold mb-1">Competencias Comportamentales (30%)</div>
                                        <div className="font-bold text-gray-800">{ev.behavioralScore} / 30</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Compromisos Individuales Concertados</h5>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                        {ev.commitments.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                                
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Carpeta de Evidencias Digital</h5>
                                    <div className="flex gap-2">
                                        {ev.evidenceLinks.map((link, i) => (
                                            <span key={i} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">
                                                📄 {link}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Talento Humano (HRIS)</h2>
                <p className="text-gray-500 mt-1">Gestión integral del ciclo de vida del colaborador escolar.</p>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 w-full md:w-max">
                <button
                    onClick={() => setActiveTab('nomina')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'nomina' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Nómina & Roles
                </button>
                <button
                    onClick={() => setActiveTab('reclutamiento')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reclutamiento' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Selección (Onboarding)
                </button>
                <button
                    onClick={() => setActiveTab('asistencia')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'asistencia' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Asistencia & Fichaje
                </button>
                <button
                    onClick={() => setActiveTab('desempeno')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'desempeno' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
                    Evaluación Guía 31
                </button>
                <button
                    onClick={() => setActiveTab('caracterizacion')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'caracterizacion' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Caracterización GETH
                </button>
            </div>

            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-1">
                {activeTab === 'nomina' && renderNomina()}
                {activeTab === 'reclutamiento' && renderReclutamiento()}
                {activeTab === 'asistencia' && renderAsistencia()}
                {activeTab === 'desempeno' && renderDesempeno()}
                {activeTab === 'caracterizacion' && <AmautaGETHForm />}
            </div>
        </div>
    );
};

export default HRISDashboard;
