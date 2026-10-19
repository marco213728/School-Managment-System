import React, { useState, useContext } from 'react';
import { Appointment, AppointmentCommitment, AppointmentStatus, Role } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { 
    CheckCircleIcon, 
    PrinterIcon, 
    CloseIcon, 
    PlusIcon, 
    TrashIcon, 
    LockClosedIcon, 
    ShieldCheckIcon,
    AlertTriangleIcon,
    ClockIcon,
    CalendarIcon
} from '../icons/Icons';

interface MeetingExecutionModalProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updated: Appointment) => void;
}

const MeetingExecutionModal: React.FC<MeetingExecutionModalProps> = ({
    appointment,
    isOpen,
    onClose,
    onSave
}) => {
    const { user: currentUser } = useContext(UserContext);

    const [status, setStatus] = useState<AppointmentStatus>(appointment.status === 'PENDING' ? 'COMPLETED' : appointment.status);
    const [internalResolutionNotes, setInternalResolutionNotes] = useState(appointment.internalResolutionNotes || '');
    const [clinicalNotes, setClinicalNotes] = useState(appointment.clinicalNotes || '');
    const [commitments, setCommitments] = useState<AppointmentCommitment[]>(
        appointment.commitmentsAcuerdos || [
            {
                id: 'com-1',
                description: 'Seguimiento continuo en el hogar y revisión de cuadernos.',
                responsible: 'PADRE',
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                status: 'PENDIENTE'
            }
        ]
    );

    // New commitment state
    const [newDesc, setNewDesc] = useState('');
    const [newResp, setNewResp] = useState<AppointmentCommitment['responsible']>('PADRE');
    const [newDueDate, setNewDueDate] = useState('');

    const [isSigned, setIsSigned] = useState(!!appointment.digitalSignature);
    const [isPrinting, setIsPrinting] = useState(false);

    if (!isOpen) return null;

    const isStaff = currentUser && currentUser.role !== Role.Parent && currentUser.role !== Role.Student;
    const isParent = currentUser?.role === Role.Parent;

    // RBAC: Check if user is allowed to view DECE clinical notes
    const canViewClinicalNotes = currentUser && (
        currentUser.role === Role.JefeDECE ||
        currentUser.role === Role.PsicologoEducativo ||
        currentUser.role === Role.TrabajadorSocial ||
        currentUser.role === Role.HealthProfessional
    );

    const handleAddCommitment = () => {
        if (!newDesc.trim()) return;
        const newCom: AppointmentCommitment = {
            id: `com-${Date.now()}`,
            description: newDesc.trim(),
            responsible: newResp,
            dueDate: newDueDate || undefined,
            status: 'PENDIENTE'
        };
        setCommitments([...commitments, newCom]);
        setNewDesc('');
        setNewDueDate('');
    };

    const handleRemoveCommitment = (id: string) => {
        setCommitments(commitments.filter(c => c.id !== id));
    };

    const handleToggleCommitment = (id: string) => {
        setCommitments(commitments.map(c => c.id === id ? {
            ...c,
            status: c.status === 'PENDIENTE' ? 'CUMPLIDO' : 'PENDIENTE'
        } : c));
    };

    const handleSave = () => {
        const updated: Appointment = {
            ...appointment,
            status,
            internalResolutionNotes: internalResolutionNotes.trim(),
            clinicalNotes: canViewClinicalNotes ? clinicalNotes.trim() : appointment.clinicalNotes,
            commitmentsAcuerdos: commitments,
            attendedAt: status === 'COMPLETED' ? (appointment.attendedAt || new Date().toISOString()) : undefined,
            digitalSignature: isSigned ? (appointment.digitalSignature || {
                signedByStaffId: currentUser?.id || 'staff',
                signedByStaffName: currentUser?.name || 'Personal Institucional',
                staffRole: currentUser?.role || 'Docente',
                timestamp: new Date().toISOString()
            }) : undefined,
            updatedAt: new Date().toISOString()
        };
        onSave(updated);
    };

    const handlePrintActa = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col animate-fadeIn">
                {/* Modal Header */}
                <header className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-600/30 border border-indigo-400/40 rounded-xl">
                            <ShieldCheckIcon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest font-bold block">
                                Acta Oficial de Atención a Padres y Compromisos (D1.C3.GE8)
                            </span>
                            <h3 className="text-base font-bold text-white">
                                Registro de Reunión: {appointment.studentName}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrintActa}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition"
                            title="Imprimir Acta Oficial para Firma Física o Expediente"
                        >
                            <PrinterIcon className="h-4 w-4" />
                            Imprimir Acta
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        >
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Printable Content & Form */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
                    {/* Header Factsheet */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Estudiante</span>
                            <span className="font-bold text-slate-900 text-sm">{appointment.studentName}</span>
                            <span className="text-slate-500 block text-[11px]">{appointment.studentGrade}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Representante Legal</span>
                            <span className="font-bold text-slate-900">{appointment.parentName}</span>
                            <span className="text-slate-500 block text-[11px]">{appointment.parentPhone || 'Sin teléfono'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Departamento & Docente</span>
                            <span className="font-bold text-indigo-700">{appointment.departmentCode}</span>
                            <span className="text-slate-700 block text-[11px] font-medium">{appointment.staffName}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha de Cita</span>
                            <span className="font-bold text-slate-900">
                                {startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="text-slate-500 block text-[11px] font-mono">
                                {startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Meeting Outcome Status (For Staff) */}
                    {isStaff ? (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                                Resultado de la Convocatoria:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition ${
                                    status === 'COMPLETED' ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-800' : 'border-slate-200'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="COMPLETED" 
                                        checked={status === 'COMPLETED'} 
                                        onChange={() => setStatus('COMPLETED')}
                                        className="text-emerald-600 focus:ring-emerald-500" 
                                    />
                                    <div>
                                        <p className="text-xs">Realizada / Atendida</p>
                                        <p className="text-[10px] text-slate-500 font-normal">Reunión llevada a cabo</p>
                                    </div>
                                </label>

                                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition ${
                                    status === 'NO_SHOW' ? 'border-rose-600 bg-rose-50/60 font-bold text-rose-800' : 'border-slate-200'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="NO_SHOW" 
                                        checked={status === 'NO_SHOW'} 
                                        onChange={() => setStatus('NO_SHOW')}
                                        className="text-rose-600 focus:ring-rose-500" 
                                    />
                                    <div>
                                        <p className="text-xs">No asistió (Falta)</p>
                                        <p className="text-[10px] text-slate-500 font-normal">Padre no se presentó</p>
                                    </div>
                                </label>

                                <label className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition ${
                                    status === 'CANCELLED' ? 'border-slate-400 bg-slate-100 font-bold text-slate-800' : 'border-slate-200'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="CANCELLED" 
                                        checked={status === 'CANCELLED'} 
                                        onChange={() => setStatus('CANCELLED')}
                                        className="text-slate-600 focus:ring-slate-500" 
                                    />
                                    <div>
                                        <p className="text-xs">Cancelada / Postergada</p>
                                        <p className="text-[10px] text-slate-500 font-normal">Justificación previa</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Estado de la Cita:</span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {status === 'COMPLETED' ? 'Atendida / Realizada' : status === 'NO_SHOW' ? 'No asistió' : status}
                            </span>
                        </div>
                    )}

                    {/* Preloaded Disciplinary / Attendance Summary for Inspección */}
                    {appointment.departmentCode === 'INSPECCION' && (
                        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs">
                            <h4 className="font-bold flex items-center gap-1.5 mb-1.5">
                                <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                                Historial de Asistencia y Atrasos Pre-cargado por Inspección
                            </h4>
                            <p className="text-slate-700 leading-relaxed">
                                El estudiante registra 3 atrasos no justificados en el presente mes lectivo. Esta cita tiene como propósito formalizar el acuerdo de puntualidad y entrega de tareas atrasadas según el Código de Convivencia Institucional.
                            </p>
                        </div>
                    )}

                    {/* Resolution Summary / Details */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Síntesis de la Entrevista y Aspectos Tratados:
                        </label>
                        {isStaff ? (
                            <textarea
                                rows={3}
                                value={internalResolutionNotes}
                                onChange={e => setInternalResolutionNotes(e.target.value)}
                                placeholder="Detalle los puntos dialogados durante la sesión con el representante..."
                                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        ) : (
                            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {internalResolutionNotes || 'Sin observaciones registradas por el personal.'}
                            </p>
                        )}
                    </div>

                    {/* DECE / Medical Clinical Notes (Principle of Reserve) */}
                    {(appointment.departmentCode === 'DECE' || appointment.departmentCode === 'MEDICO') && (
                        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 shadow-xs">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                    <LockClosedIcon className="h-4 w-4 text-purple-700" />
                                    Notas Clínicas y Confidenciales (Principio de Reserva)
                                </h4>
                                <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
                                    Acceso Restringido
                                </span>
                            </div>

                            {canViewClinicalNotes ? (
                                <div>
                                    <p className="text-[11px] text-purple-800 mb-2">
                                        Información amparada bajo secreto profesional. No es visible para docentes regulares ni representantes legales.
                                    </p>
                                    <textarea
                                        rows={3}
                                        value={clinicalNotes}
                                        onChange={e => setClinicalNotes(e.target.value)}
                                        placeholder="Diagnóstico psicopedagógico preliminar, antecedentes sociofamiliares, hipótesis de caso (Formularios 001/002)..."
                                        className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <div className="p-3 bg-purple-100/50 rounded-lg text-xs text-purple-800 italic">
                                    🔒 Las notas clínicas y antecedentes familiares están protegidos por el Principio de Reserva y son de uso exclusivo del personal de Consejería Estudiantil (DECE) / Médico.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Commitments & Agreements Table (Acuerdos y Compromisos) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between mb-3 border-b pb-2">
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                    Acuerdos y Compromisos Formales
                                </h4>
                                <p className="text-[10px] text-slate-400">
                                    Compromisos adquiridos por el representante, estudiante o institución.
                                </p>
                            </div>
                            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {commitments.length} acuerdos
                            </span>
                        </div>

                        {/* List */}
                        <div className="space-y-2 mb-4">
                            {commitments.map((com, index) => (
                                <div 
                                    key={com.id || index} 
                                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                                >
                                    <div className="flex items-start gap-2.5 flex-1">
                                        <button
                                            type="button"
                                            disabled={!isStaff}
                                            onClick={() => handleToggleCommitment(com.id)}
                                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                                                com.status === 'CUMPLIDO' 
                                                    ? 'bg-emerald-600 text-white border-emerald-600' 
                                                    : 'border-slate-300 bg-white text-transparent'
                                            }`}
                                        >
                                            ✓
                                        </button>
                                        <div className="flex-1">
                                            <p className={`font-medium ${com.status === 'CUMPLIDO' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                {com.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                                <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                    Responsable: {com.responsible}
                                                </span>
                                                {com.dueDate && (
                                                    <span>Fecha Límite: {com.dueDate}</span>
                                                )}
                                                <span className={com.status === 'CUMPLIDO' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                                                    • {com.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isStaff && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCommitment(com.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1"
                                            title="Eliminar acuerdo"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Commitment Form (Staff only) */}
                        {isStaff && (
                            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-[11px] font-bold text-slate-700 block">Añadir Nuevo Compromiso:</span>
                                <input
                                    type="text"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Descripción del compromiso (Ej: Presentar actividades de refuerzo, acudir a valoración médica)..."
                                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Responsable:</label>
                                        <select
                                            value={newResp}
                                            onChange={e => setNewResp(e.target.value as any)}
                                            className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                        >
                                            <option value="PADRE">PADRE / REPRESENTANTE</option>
                                            <option value="ESTUDIANTE">ESTUDIANTE</option>
                                            <option value="DOCENTE">DOCENTE / TUTOR</option>
                                            <option value="DECE">DECE</option>
                                            <option value="INSPECCION">INSPECCIÓN</option>
                                            <option value="MEDICO">MÉDICO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Fecha de Cumplimiento:</label>
                                        <input
                                            type="date"
                                            value={newDueDate}
                                            onChange={e => setNewDueDate(e.target.value)}
                                            className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleAddCommitment}
                                            disabled={!newDesc.trim()}
                                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                        >
                                            <PlusIcon className="h-3.5 w-3.5" /> Añadir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Digital Signature & Certification Box */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                                Firma y Certificación Electrónica Institucional
                            </span>
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Estándar D1.C3.GE8
                            </span>
                        </div>

                        {isStaff && (
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    checked={isSigned}
                                    onChange={e => setIsSigned(e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                />
                                <span className="text-xs text-slate-200 font-semibold">
                                    Firmar digitalmente esta Acta con mis credenciales de {currentUser?.role || 'Docente'}: {currentUser?.name}
                                </span>
                            </label>
                        )}

                        {appointment.digitalSignature && (
                            <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-bold">{appointment.digitalSignature.signedByStaffName}</p>
                                    <p className="text-[10px] text-slate-400">{appointment.digitalSignature.staffRole}</p>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                    {new Date(appointment.digitalSignature.timestamp).toLocaleString('es-ES')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <footer className="p-4 bg-white border-t border-slate-200 flex justify-between items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                    >
                        Cerrar
                    </button>

                    {isStaff && (
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                        >
                            Guardar y Archivar en Expediente ✓
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default MeetingExecutionModal;
