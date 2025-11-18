
import React, { useMemo } from 'react';
import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_USERS, MOCK_INTERVENTIONS, MOCK_OVP_ACTIVITIES, MOCK_HEALTH_RECORDS, MOCK_VICC_INTERVENTIONS } from '../../constants';
import { PrinterIcon, PhoneIcon, EmailIcon, LocationMarkerIcon, VicerrectoradoIcon, ClipboardListIcon } from '../icons/Icons';

interface ReportProps {
    studentId: string;
}

const StudentComprehensiveReport: React.FC<ReportProps> = ({ studentId }) => {
    const reportData = useMemo(() => {
        const student = MOCK_STUDENTS.find(s => s.id === studentId);
        if (!student) return null;

        const classInfo = MOCK_CLASSES.find(c => c.id === student.classId);
        const parent = MOCK_USERS.find(u => u.id === student.parentId);
        
        // DECE Interventions
        const interventions = MOCK_INTERVENTIONS.filter(i => i.studentId === studentId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
        // Vicerrectorado Interventions
        const viccInterventions = MOCK_VICC_INTERVENTIONS.filter(i => i.studentId === studentId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const ovpActivities = MOCK_OVP_ACTIVITIES.filter(a => a.studentId === studentId);
        const healthRecord = MOCK_HEALTH_RECORDS.find(hr => hr.studentId === studentId);
        
        const staffMap = new Map(MOCK_USERS.map(u => [u.id, u.name]));

        return { student, classInfo, parent, interventions, viccInterventions, ovpActivities, healthRecord, staffMap };
    }, [studentId]);

    const handlePrint = () => {
        window.print();
    };

    if (!reportData) {
        return <div className="bg-white p-6 rounded-xl shadow-md mt-6">No se encontraron datos para el estudiante seleccionado.</div>;
    }

    const { student, classInfo, parent, interventions, viccInterventions, ovpActivities, healthRecord, staffMap } = reportData;

    return (
        <div id="report-section" className="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-8 mt-6">
            <header className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b pb-6">
                <div className="flex items-center gap-6">
                    <img src={student.photoUrl || `https://placehold.co/200x200/60a5fa/white?text=${student.name.charAt(0)}`} alt={`Foto de ${student.name}`} className="w-28 h-28 rounded-full object-cover border-4 border-gray-100" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
                        <p className="text-gray-600">{classInfo?.name || 'Clase no asignada'}</p>
                        <p className="text-gray-500 text-sm mt-1">ID: {student.id}</p>
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 no-print self-start sm:self-center">
                    <button onClick={handlePrint} className="flex items-center gap-2 text-sm px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        <PrinterIcon className="h-4 w-4" />
                        Imprimir / Guardar PDF
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4 text-sm">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Información de Contacto</h2>
                    <div className="space-y-3">
                         <div className="flex items-start gap-3">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-600">Teléfono Alumno</p>
                                <p className="text-gray-800">{student.phone || 'No registrado'}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <LocationMarkerIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-600">Dirección</p>
                                <p className="text-gray-800">{student.address || 'No registrada'}</p>
                            </div>
                        </div>
                        {parent && (
                             <>
                                <div className="flex items-start gap-3">
                                    <PhoneIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-600">Teléfono Familiar ({parent.name})</p>
                                        <p className="text-gray-800">{parent.phone || 'No registrado'}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <EmailIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-600">Email Familiar</p>
                                        <p className="text-gray-800 break-all">{parent.email}</p>
                                    </div>
                                </div>
                             </>
                        )}
                    </div>
                </div>
                <div className="md:col-span-2 space-y-8">
                    {/* DECE Section */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Información DECE</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-600 mb-2">Historial de Intervenciones</h3>
                                {interventions.length > 0 ? (
                                    <ul className="space-y-4 border-l-2 border-gray-200 pl-4">
                                        {interventions.map(item => (
                                            <li key={item.id} className="relative">
                                                <div className="absolute -left-[27px] top-1.5 w-4 h-4 bg-primary-500 rounded-full border-4 border-white"></div>
                                                <p className="text-xs text-gray-500">{item.date}</p>
                                                <p className="font-semibold text-primary-700">{item.type}</p>
                                                <p className="text-sm text-gray-600">{item.summary}</p>
                                                {item.agreements && (
                                                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 border border-gray-100">
                                                        <strong className="block mb-1"><ClipboardListIcon className="inline h-3 w-3 mr-1"/>Acuerdos:</strong>
                                                        {item.agreements.substring(0, 150)}{item.agreements.length > 150 ? '...' : ''}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 italic mt-1">Registrado por: {staffMap.get(item.deceProfessionalId) || 'Profesional'}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No hay intervenciones registradas.</p>}
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-600 mb-2">Actividades de Orientación Vocacional (OVP)</h3>
                                {ovpActivities.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                        {ovpActivities.map(item => (
                                            <li key={item.id}>
                                                {item.title} ({item.axis}) - <span className={`font-semibold ${item.status === 'Completada' ? 'text-green-600' : 'text-yellow-600'}`}>{item.status}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No hay actividades OVP registradas.</p>}
                            </div>
                        </div>
                    </section>

                    {/* Vicerrectorado Section */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                            <VicerrectoradoIcon className="h-5 w-5 text-gray-600" />
                            Información Vicerrectorado
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-600 mb-2">Intervenciones y Acuerdos Académicos/Disciplinarios</h3>
                                {viccInterventions.length > 0 ? (
                                    <ul className="space-y-4 border-l-2 border-indigo-200 pl-4">
                                        {viccInterventions.map(item => (
                                            <li key={item.id} className="relative">
                                                <div className="absolute -left-[27px] top-1.5 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white"></div>
                                                <p className="text-xs text-gray-500">{item.date}</p>
                                                <p className="font-semibold text-indigo-700">{item.type}</p>
                                                <p className="text-sm text-gray-600">{item.summary}</p>
                                                {item.agreements && (
                                                    <div className="mt-1 p-2 bg-indigo-50 rounded text-xs text-gray-700 border border-indigo-100 whitespace-pre-wrap">
                                                        <strong className="block mb-1"><ClipboardListIcon className="inline h-3 w-3 mr-1"/>Acuerdos y Compromisos:</strong>
                                                        {item.agreements}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 italic mt-1">Registrado por: {staffMap.get(item.vicerrectorId) || 'Vicerrectorado'}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No hay registros de Vicerrectorado.</p>}
                            </div>
                        </div>
                    </section>

                    {/* Health Section */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Información de Salud</h2>
                        {healthRecord ? (
                            <div className="space-y-3 text-sm">
                                <p><strong className="font-semibold text-gray-600">Alergias: </strong>{healthRecord.allergies.join(', ') || 'Ninguna'}</p>
                                <p><strong className="font-semibold text-gray-600">Condiciones: </strong>{healthRecord.conditions.join(', ') || 'Ninguna'}</p>
                                <div>
                                    <strong className="font-semibold text-gray-600">Contacto de Emergencia: </strong>
                                    <span>{healthRecord.emergencyContact.name} ({healthRecord.emergencyContact.relation}) - {healthRecord.emergencyContact.phone}</span>
                                </div>
                                <div>
                                    <strong className="font-semibold text-gray-600 block mb-1">Medicación: </strong>
                                    <ul className="list-disc pl-5">
                                        {healthRecord.medications.length > 0 ? healthRecord.medications.map(med => (
                                            <li key={med.name}>{med.name} ({med.dosage}). Notas: {med.notes}</li>
                                        )) : <li>Ninguna</li>}
                                    </ul>
                                </div>
                                <p><strong className="font-semibold text-gray-600">Último Chequeo: </strong>{healthRecord.lastCheckup}</p>
                            </div>
                        ) : <p className="text-sm text-gray-500">No hay ficha de salud registrada.</p>}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentComprehensiveReport;
