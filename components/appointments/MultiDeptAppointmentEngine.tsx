import React, { useState, useMemo, useContext } from 'react';
import { 
    Appointment, 
    DepartmentCode, 
    AppointmentStatus, 
    AppointmentCommitment, 
    User, 
    Student, 
    Class, 
    ScheduleEntry, 
    TimeSlot, 
    Notification, 
    Role 
} from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { 
    CalendarIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    AlertTriangleIcon, 
    DeceIcon, 
    HealthIcon, 
    InspectionIcon, 
    GraduationCapIcon, 
    UsersIcon, 
    PlusIcon, 
    SearchIcon, 
    PrinterIcon, 
    LockClosedIcon, 
    ShieldCheckIcon,
    CloseIcon
} from '../icons/Icons';
import MeetingExecutionModal from './MeetingExecutionModal';

export interface MultiDeptAppointmentEngineProps {
    appointments: Appointment[];
    onUpdateAppointments: (appointments: Appointment[]) => void;
    users: User[];
    students: Student[];
    classes: Class[];
    schedule?: ScheduleEntry[];
    timeSlots?: TimeSlot[];
    notifications?: Notification[];
    onUpdateNotifications?: (notifications: Notification[]) => void;
}

interface DepartmentConfig {
    code: DepartmentCode;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badgeBg: string;
    border: string;
    defaultDurationMinutes: number;
    requiresApproval: boolean;
    confidentialityNotice: string;
    reasons: string[];
}

export const DEPARTMENTS: DepartmentConfig[] = [
    {
        code: 'DOCENTE',
        title: 'Docentes y Tutores',
        subtitle: 'Rendimiento Académico y Justificaciones',
        description: 'Reunión individual con el docente de asignatura o tutor de curso para seguimiento pedagógico, calificaciones y justificación de tareas.',
        icon: <GraduationCapIcon className="h-6 w-6 text-sky-600" />,
        color: 'text-sky-700',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
        border: 'border-sky-300 hover:border-sky-500',
        defaultDurationMinutes: 40,
        requiresApproval: false,
        confidentialityNotice: 'Visible para el docente titular, tutor de grado y coordinación académica.',
        reasons: [
            'Rendimiento Académico y Calificaciones',
            'Plan de Refuerzo Pedagógico Individual',
            'Conducta y Comportamiento en Aula',
            'Justificación de Tareas o Evaluaciones Atrasadas',
            'Orientación y Seguimiento Tutorial'
        ]
    },
    {
        code: 'DECE',
        title: 'Consejería Estudiantil (DECE)',
        subtitle: 'Apoyo Psicopedagógico y Socioemocional',
        description: 'Acompañamiento familiar, tamizaje de habilidades socioemocionales, orientación vocacional y bienestar integral del estudiante.',
        icon: <DeceIcon className="h-6 w-6 text-purple-600" />,
        color: 'text-purple-700',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        border: 'border-purple-300 hover:border-purple-500',
        defaultDurationMinutes: 45,
        requiresApproval: true,
        confidentialityNotice: 'Principio de Reserva: Las notas clínicas y antecedentes familiares son estrictamente confidenciales del equipo DECE.',
        reasons: [
            'Acompañamiento Psicológico y Socioemocional',
            'Adaptaciones Curriculares y Necesidades Educativas',
            'Proyecto de Vida y Orientación Vocacional (OVP)',
            'Seguimiento a Casos Familiares o Convivencia',
            'Entrevista de Ingreso / Ficha Socioeconómica'
        ]
    },
    {
        code: 'MEDICO',
        title: 'Departamento Médico y Enfermería',
        subtitle: 'Ficha de Salud y Control Preventivo',
        description: 'Revisión de autorización médica institucional, control de enfermedades crónicas, alergias y seguimiento a valoraciones externas.',
        icon: <HealthIcon className="h-6 w-6 text-emerald-600" />,
        color: 'text-emerald-700',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        border: 'border-emerald-300 hover:border-emerald-500',
        defaultDurationMinutes: 30,
        requiresApproval: false,
        confidentialityNotice: 'Secreto Médico: Diagnósticos, CIE-10 y formularios 001/002 visibles únicamente por personal de salud acreditado.',
        reasons: [
            'Actualización de Ficha Médica y Autorizaciones',
            'Control de Enfermedades Crónicas o Alergias',
            'Seguimiento a Reposos o Prescripciones Médicas',
            'Control Preventivo Anual de Salud y Vacunación',
            'Valoración por Accidente Escolar o Remisión'
        ]
    },
    {
        code: 'INSPECCION',
        title: 'Inspección General',
        subtitle: 'Asistencia, Disciplina y Compromisos',
        description: 'Seguimiento a atrasos reiterados, faltas injustificadas, acuerdos normativos del Código de Convivencia y justificaciones oficiales.',
        icon: <InspectionIcon className="h-6 w-6 text-amber-600" />,
        color: 'text-amber-700',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        border: 'border-amber-300 hover:border-amber-500',
        defaultDurationMinutes: 30,
        requiresApproval: true,
        confidentialityNotice: 'Registro oficial de seguimiento disciplinario y acuerdos que se anexan al expediente del estudiante.',
        reasons: [
            'Justificación Oficial de Inasistencias o Atrasos',
            'Firma de Acuerdos y Compromisos de Convivencia',
            'Seguimiento a Falta Leve o Grave al Código de Convivencia',
            'Solicitud de Permiso Especial de Retiro Anticipado',
            'Mediación Escolar y Compromiso de Asistencia'
        ]
    }
];

const MultiDeptAppointmentEngine: React.FC<MultiDeptAppointmentEngineProps> = ({
    appointments,
    onUpdateAppointments,
    users,
    students,
    classes,
    schedule = [],
    timeSlots = [],
    notifications = [],
    onUpdateNotifications
}) => {
    const { user: currentUser } = useContext(UserContext);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL');
    const [departmentFilter, setDepartmentFilter] = useState<'ALL' | DepartmentCode>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [executingAppointment, setExecutingAppointment] = useState<Appointment | null>(null);

    // Wizard Booking Form states
    const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedDept, setSelectedDept] = useState<DepartmentCode>('DOCENTE');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        // default to next business day
        const d = new Date();
        d.setDate(d.getDate() + 1);
        if (d.getDay() === 0) d.setDate(d.getDate() + 1);
        if (d.getDay() === 6) d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
    });
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [reasonCategory, setReasonCategory] = useState<string>('');
    const [parentNotes, setParentNotes] = useState<string>('');
    const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string>('');

    // Determine Role Perspective
    const isParent = currentUser?.role === Role.Parent;
    const isStaff = currentUser && currentUser.role !== Role.Parent && currentUser.role !== Role.Student;
    const isDECE = currentUser && [Role.JefeDECE, Role.PsicologoEducativo, Role.TrabajadorSocial].includes(currentUser.role);
    const isMedical = currentUser?.role === Role.HealthProfessional;
    const isInspector = currentUser?.role === Role.InspectorGeneral;
    const isAdmin = currentUser && [Role.InstitutionAdmin, Role.Rector, Role.Vicerrector].includes(currentUser.role);

    // Eligible children for Parent
    const parentChildren = useMemo(() => {
        if (!currentUser) return [];
        if (isParent) {
            return students.filter(s => s.parentId === currentUser.id || currentUser.childIds?.includes(s.id));
        }
        return students;
    }, [currentUser, isParent, students]);

    const activeChild = useMemo(() => {
        if (selectedStudentId) {
            return students.find(s => s.id === selectedStudentId);
        }
        return parentChildren[0] || null;
    }, [selectedStudentId, parentChildren, students]);

    // Candidate staff members based on department
    const candidateStaffMembers = useMemo(() => {
        if (!currentUser) return [];
        switch (selectedDept) {
            case 'DOCENTE': {
                // If student is selected, prioritize student's course teachers or tutor
                if (activeChild) {
                    const studentClass = classes.find(c => c.id === activeChild.classId);
                    const teachers = users.filter(u => u.role === Role.Teacher);
                    if (studentClass?.tutorId) {
                        return teachers;
                    }
                    return teachers;
                }
                return users.filter(u => u.role === Role.Teacher);
            }
            case 'DECE':
                return users.filter(u => [Role.JefeDECE, Role.PsicologoEducativo, Role.TrabajadorSocial].includes(u.role));
            case 'MEDICO':
                return users.filter(u => u.role === Role.HealthProfessional);
            case 'INSPECCION':
                return users.filter(u => u.role === Role.InspectorGeneral || u.role === Role.Vicerrector);
            default:
                return [];
        }
    }, [selectedDept, activeChild, classes, users, currentUser]);

    // Auto-select staff member when candidate list changes
    React.useEffect(() => {
        if (candidateStaffMembers.length > 0 && !candidateStaffMembers.some(s => s.id === selectedStaffId)) {
            setSelectedStaffId(candidateStaffMembers[0].id);
        }
    }, [candidateStaffMembers, selectedStaffId]);

    // Slot Generator with Timetable Conflict Manager (Section 3.1 & 3.2)
    const availableSlots = useMemo(() => {
        if (!selectedStaffId || !selectedDate) return [];

        const staffUser = users.find(u => u.id === selectedStaffId);
        if (!staffUser) return [];

        // Determine day of week in Spanish
        const dateObj = new Date(selectedDate + 'T12:00:00');
        const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayOfWeek = daysMap[dateObj.getDay()];

        // Weekend: no slots
        if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
            return [];
        }

        // Standard operational windows for parent meetings
        const standardSlots = [
            { start: '07:30', end: '08:15' },
            { start: '08:30', end: '09:15' },
            { start: '09:40', end: '10:25' },
            { start: '10:45', end: '11:30' },
            { start: '11:45', end: '12:30' },
            { start: '13:00', end: '13:45' },
            { start: '14:00', end: '14:45' }
        ];

        // 1. Conflict Check: Teacher's timetable scheduled classes
        const teacherScheduleForDay = schedule.filter(entry => {
            if (entry.teacherId !== selectedStaffId) return false;
            // Check if slot day matches
            const slot = timeSlots.find(ts => ts.id === entry.timeSlotId);
            return slot && !slot.isBreak;
        });

        // 2. Conflict Check: Existing appointments on selectedDate
        const existingApptsOnDate = appointments.filter(a => 
            a.staffId === selectedStaffId && 
            a.startTime.startsWith(selectedDate) &&
            a.status !== 'CANCELLED'
        );

        return standardSlots.map(slot => {
            const slotStartIso = `${selectedDate}T${slot.start}:00.000Z`;
            const slotEndIso = `${selectedDate}T${slot.end}:00.000Z`;

            // Check if overlaps with teaching classes
            const hasClassConflict = teacherScheduleForDay.some(entry => {
                const ts = timeSlots.find(t => t.id === entry.timeSlotId);
                if (!ts) return false;
                // Simple time string overlap
                return (slot.start >= ts.startTime && slot.start < ts.endTime) ||
                       (slot.end > ts.startTime && slot.end <= ts.endTime);
            });

            // Check if already booked
            const hasBookingConflict = existingApptsOnDate.some(a => {
                const aTime = a.startTime.split('T')[1]?.substring(0, 5);
                return aTime === slot.start;
            });

            const isAvailable = !hasClassConflict && !hasBookingConflict;

            return {
                ...slot,
                startIso: slotStartIso,
                endIso: slotEndIso,
                isAvailable,
                conflictReason: hasClassConflict 
                    ? 'Clase programada en horario escolar' 
                    : hasBookingConflict 
                        ? 'Cita ya reservada por otro representante' 
                        : undefined
            };
        });
    }, [selectedStaffId, selectedDate, users, schedule, timeSlots, appointments]);

    // Appointments accessible according to RBAC
    const filteredAppointments = useMemo(() => {
        if (!currentUser) return [];

        let list = appointments;

        // Role-based visibility
        if (isParent) {
            list = list.filter(a => a.parentId === currentUser.id);
        } else if (isDECE) {
            // DECE sees all DECE appointments + cases referred to them
            list = list.filter(a => a.departmentCode === 'DECE' || a.staffId === currentUser.id || isAdmin);
        } else if (isMedical) {
            list = list.filter(a => a.departmentCode === 'MEDICO' || a.staffId === currentUser.id || isAdmin);
        } else if (isInspector) {
            list = list.filter(a => a.departmentCode === 'INSPECCION' || a.staffId === currentUser.id || isAdmin);
        } else if (currentUser.role === Role.Teacher) {
            list = list.filter(a => a.staffId === currentUser.id);
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            list = list.filter(a => a.status === statusFilter);
        }

        // Department filter
        if (departmentFilter !== 'ALL') {
            list = list.filter(a => a.departmentCode === departmentFilter);
        }

        // Search term
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(a => 
                a.studentName?.toLowerCase().includes(q) ||
                a.parentName?.toLowerCase().includes(q) ||
                a.staffName?.toLowerCase().includes(q) ||
                a.parentReasonCategory.toLowerCase().includes(q)
            );
        }

        // Sort descending by date
        return list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [appointments, currentUser, isParent, isDECE, isMedical, isInspector, isAdmin, statusFilter, departmentFilter, searchTerm]);

    // Handle Appointment Booking Submission
    const handleConfirmBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !activeChild || !selectedSlot || !selectedStaffId) return;

        const staffMember = users.find(u => u.id === selectedStaffId);
        const deptConfig = DEPARTMENTS.find(d => d.code === selectedDept);
        const studentClass = classes.find(c => c.id === activeChild.classId);

        const newAppointment: Appointment = {
            id: `appt-${Date.now()}`,
            institutionId: currentUser.institutionId || 'uemol',
            studentId: activeChild.id,
            studentName: activeChild.name,
            studentGrade: studentClass?.name || activeChild.grade || '10mo EGB',
            parentId: currentUser.id,
            parentName: currentUser.name,
            parentPhone: currentUser.phone || '0991234567',
            parentEmail: currentUser.email,
            staffId: selectedStaffId,
            staffName: staffMember?.name || 'Personal Asignado',
            staffRole: staffMember?.role || 'Docente',
            departmentCode: selectedDept,
            startTime: selectedSlot.start,
            endTime: selectedSlot.end,
            status: deptConfig?.requiresApproval ? 'PENDING' : 'CONFIRMED',
            parentReasonCategory: reasonCategory || deptConfig?.reasons[0] || 'Atención General',
            parentNotes: parentNotes.trim(),
            isConfidentialDece: selectedDept === 'DECE',
            createdAt: new Date().toISOString()
        };

        const updatedAppointments = [newAppointment, ...appointments];
        onUpdateAppointments(updatedAppointments);

        // Notify Staff Member
        if (onUpdateNotifications && notifications) {
            const staffNotif: Notification = {
                id: `notif-appt-staff-${Date.now()}`,
                institutionId: currentUser.institutionId || 'uemol',
                userId: selectedStaffId,
                title: `📅 Nueva Solicitud de Cita: ${activeChild.name}`,
                message: `El representante ${currentUser.name} ha agendado una reunión de ${deptConfig?.title} para el ${new Date(selectedSlot.start).toLocaleDateString('es-ES')} a las ${new Date(selectedSlot.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
                date: new Date().toISOString(),
                read: false
            };
            const parentNotif: Notification = {
                id: `notif-appt-parent-${Date.now()}`,
                institutionId: currentUser.institutionId || 'uemol',
                userId: currentUser.id,
                title: `Cita Registrada con ${staffMember?.name || 'el departamento'}`,
                message: `Su cita ha sido registrada con éxito (${deptConfig?.requiresApproval ? 'Pendiente de confirmación' : 'Confirmada'}).`,
                date: new Date().toISOString(),
                read: false
            };
            onUpdateNotifications([...notifications, staffNotif, parentNotif]);
        }

        setBookingSuccessMsg(`¡Cita agendada con éxito! Registro enviado a ${staffMember?.name}.`);
        setTimeout(() => {
            setBookingSuccessMsg('');
            setIsBookingModalOpen(false);
            setWizardStep(1);
            setSelectedSlot(null);
            setParentNotes('');
        }, 2200);
    };

    // Quick Action: Update Status (Staff confirming or cancelling)
    const handleUpdateStatus = (apptId: string, newStatus: AppointmentStatus, cancelReason?: string) => {
        const updated = appointments.map(a => {
            if (a.id === apptId) {
                return {
                    ...a,
                    status: newStatus,
                    cancellationReason: cancelReason || a.cancellationReason,
                    updatedAt: new Date().toISOString()
                };
            }
            return a;
        });
        onUpdateAppointments(updated);

        // Notification to parent
        const appt = appointments.find(a => a.id === apptId);
        if (appt && onUpdateNotifications && notifications) {
            const notif: Notification = {
                id: `notif-stat-${Date.now()}`,
                institutionId: appt.institutionId,
                userId: appt.parentId,
                title: `Actualización de Cita con ${appt.staffName}`,
                message: `El estado de su cita para ${appt.studentName} ha cambiado a: ${
                    newStatus === 'CONFIRMED' ? 'Confirmada ✅' : newStatus === 'CANCELLED' ? 'Cancelada ❌' : newStatus
                }.`,
                date: new Date().toISOString(),
                read: false
            };
            onUpdateNotifications([...notifications, notif]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono mb-2">
                            <ShieldCheckIcon className="h-4 w-4 text-indigo-400" />
                            <span>MÓDULO OFICIAL DE ATENCIÓN A PADRES Y CITACIONES (D1.C3.GE8)</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                            Sistema Multidepartamental de Citas y Agendamiento
                        </h1>
                        <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
                            Gestión unificada de citas con Docentes, DECE, Departamento Médico e Inspección General con verificación de horarios libres, actas digitales de compromisos y principio de reserva.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {isParent && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBookingModalOpen(true);
                                    setWizardStep(1);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition transform active:scale-95"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Agendar Nueva Cita
                            </button>
                        )}

                        {isStaff && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsBookingModalOpen(true);
                                    setWizardStep(1);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Convocar Representante (Citación)
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
                        >
                            <PrinterIcon className="h-4 w-4" />
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* 4 Department Quick Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
                    {DEPARTMENTS.map(dept => {
                        const count = appointments.filter(a => a.departmentCode === dept.code).length;
                        const isSelected = departmentFilter === dept.code;
                        return (
                            <div 
                                key={dept.code}
                                onClick={() => setDepartmentFilter(isSelected ? 'ALL' : dept.code)}
                                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                                    isSelected 
                                        ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-400/50' 
                                        : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 bg-slate-900 rounded-lg">{dept.icon}</div>
                                    <span className="text-xs font-black font-mono bg-slate-900/80 px-2 py-0.5 rounded-full text-indigo-300">
                                        {count} citas
                                    </span>
                                </div>
                                <h4 className="font-bold text-xs text-white mt-2.5 truncate">{dept.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{dept.subtitle}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Buscar por estudiante, representante o motivo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                    {/* Status Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                        {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map(st => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-2.5 py-1 rounded-lg transition ${
                                    statusFilter === st 
                                        ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {st === 'ALL' ? 'Todas' : st === 'CONFIRMED' ? 'Confirmadas' : st === 'PENDING' ? 'Pendientes' : st === 'COMPLETED' ? 'Realizadas' : 'Canceladas'}
                            </button>
                        ))}
                    </div>

                    {departmentFilter !== 'ALL' && (
                        <button
                            onClick={() => setDepartmentFilter('ALL')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-200"
                        >
                            Quitar filtro ({departmentFilter}) ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Appointments Grid / List */}
            {filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments.map(appt => {
                        const dept = DEPARTMENTS.find(d => d.code === appt.departmentCode);
                        const startDate = new Date(appt.startTime);
                        const endDate = new Date(appt.endTime);
                        const isUpcoming = startDate.getTime() > Date.now() && appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED';

                        return (
                            <div 
                                key={appt.id} 
                                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                            >
                                <div className="p-5">
                                    {/* Top Department Badge & Status */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${dept?.badgeBg || 'bg-slate-100 text-slate-700'}`}>
                                            {dept?.icon && React.cloneElement(dept.icon as React.ReactElement<any>, { className: 'h-3.5 w-3.5' })}
                                            {dept?.title}
                                        </span>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            appt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            appt.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            appt.status === 'NO_SHOW' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {appt.status === 'CONFIRMED' ? 'Confirmada' :
                                             appt.status === 'PENDING' ? 'Pendiente' :
                                             appt.status === 'COMPLETED' ? 'Realizada' :
                                             appt.status === 'NO_SHOW' ? 'No asistió' : 'Cancelada'}
                                        </span>
                                    </div>

                                    {/* Student & Participant details */}
                                    <div className="border-b border-slate-100 pb-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                {appt.studentName?.charAt(0) || 'E'}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                                    {appt.studentName}
                                                </h3>
                                                <p className="text-[11px] text-slate-500">{appt.studentGrade}</p>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Representante</span>
                                                <span className="font-semibold text-slate-700 truncate block">{appt.parentName}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Atendido por</span>
                                                <span className="font-semibold text-slate-700 truncate block">{appt.staffName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                                        <CalendarIcon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                        <span>
                                            {startDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <ClockIcon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                        <span className="font-mono text-indigo-900">
                                            {startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* Reason */}
                                    <div className="mt-2">
                                        <p className="text-xs font-bold text-slate-800">
                                            {appt.parentReasonCategory}
                                        </p>
                                        {appt.parentNotes && (
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                "{appt.parentNotes}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Agreements & Commitments Indicator */}
                                    {appt.commitmentsAcuerdos && appt.commitmentsAcuerdos.length > 0 && (
                                        <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                                            <span className="font-bold flex items-center gap-1">
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                                                {appt.commitmentsAcuerdos.length} Acuerdos Registrados
                                            </span>
                                            {appt.digitalSignature && (
                                                <span className="text-[10px] text-emerald-600 font-mono">Firma Digital ✓</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Confidentiality Warning if DECE / Medical */}
                                    {appt.isConfidentialDece && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded">
                                            <LockClosedIcon className="h-3 w-3" />
                                            <span>Principio de Reserva DECE Activo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Action Footer */}
                                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                                    {/* Staff actions */}
                                    {isStaff && appt.status === 'PENDING' && (
                                        <div className="flex items-center gap-1.5 w-full">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                                            >
                                                Confirmar Cita
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(appt.id, 'CANCELLED', 'Horario no disponible')}
                                                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}

                                    {/* Complete / Execute meeting button (for Staff) */}
                                    {isStaff && (appt.status === 'CONFIRMED' || appt.status === 'COMPLETED') && (
                                        <button
                                            type="button"
                                            onClick={() => setExecutingAppointment(appt)}
                                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            {appt.status === 'COMPLETED' ? 'Ver / Modificar Acta de Compromisos' : 'Atender Cita y Generar Acta'}
                                        </button>
                                    )}

                                    {/* Parent view minutes button */}
                                    {isParent && appt.status === 'COMPLETED' && (
                                        <button
                                            type="button"
                                            onClick={() => setExecutingAppointment(appt)}
                                            className="w-full py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border border-indigo-200"
                                        >
                                            <PrinterIcon className="h-4 w-4 text-indigo-600" />
                                            Ver Acta Oficial y Acuerdos
                                        </button>
                                    )}

                                    {/* Parent cancel upcoming */}
                                    {isParent && isUpcoming && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('¿Está seguro de cancelar esta cita?')) {
                                                    handleUpdateStatus(appt.id, 'CANCELLED', 'Cancelado por el representante');
                                                }
                                            }}
                                            className="w-full py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-semibold transition"
                                        >
                                            Cancelar Cita
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
                    <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-800">No se encontraron citas</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        No hay citas registradas con los filtros actuales. Puede agendar una nueva cita seleccionando el departamento deseado.
                    </p>
                    {isParent && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsBookingModalOpen(true);
                                setWizardStep(1);
                            }}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                        >
                            Agendar Cita Ahora
                        </button>
                    )}
                </div>
            )}

            {/* WIZARD BOOKING MODAL */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fadeIn">
                        {/* Modal Header with Progress */}
                        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                                    Paso {wizardStep} de 4
                                </span>
                                <h3 className="text-base font-bold text-white">
                                    {wizardStep === 1 && '1. Seleccionar Estudiante'}
                                    {wizardStep === 2 && '2. Seleccionar Departamento Escolar'}
                                    {wizardStep === 3 && '3. Seleccionar Profesional y Horario Libre'}
                                    {wizardStep === 4 && '4. Motivo y Confirmación de la Cita'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Step 1: Select Student */}
                        {wizardStep === 1 && (
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-slate-600">
                                    Seleccione el estudiante para el cual desea agendar la reunión con el personal de la institución:
                                </p>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {parentChildren.map(s => {
                                        const isSel = (selectedStudentId || parentChildren[0]?.id) === s.id;
                                        const c = classes.find(cl => cl.id === s.classId);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => setSelectedStudentId(s.id)}
                                                className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                                                    isSel ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                                                        <p className="text-xs text-slate-500">{c?.name || s.grade} • Cédula: {s.nationalId || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                                                    {isSel && '✓'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setWizardStep(2)}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                                    >
                                        Continuar al Paso 2 ➔
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Department */}
                        {wizardStep === 2 && (
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-slate-600">
                                    Seleccione el departamento con el que necesita mantener la reunión:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {DEPARTMENTS.map(dept => {
                                        const isSel = selectedDept === dept.code;
                                        return (
                                            <div
                                                key={dept.code}
                                                onClick={() => {
                                                    setSelectedDept(dept.code);
                                                    setReasonCategory(dept.reasons[0]);
                                                }}
                                                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                                                    isSel ? `${dept.border} bg-indigo-50/40 ring-1 ring-indigo-500` : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="p-2 bg-white rounded-lg shadow-xs border border-slate-200">
                                                            {dept.icon}
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-slate-500">
                                                            {dept.defaultDurationMinutes} min
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-xs text-slate-900">{dept.title}</h4>
                                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{dept.description}</p>
                                                </div>
                                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                                    <span className="text-slate-400">
                                                        {dept.requiresApproval ? 'Requiere confirmación' : 'Auto-confirmada'}
                                                    </span>
                                                    <span className={`font-bold ${isSel ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                        {isSel ? 'Seleccionado ✓' : 'Elegir'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setWizardStep(1)}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                                    >
                                        ⬅ Volver
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWizardStep(3)}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                                    >
                                        Continuar al Horario ➔
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Staff & Slot Generator */}
                        {wizardStep === 3 && (
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Profesional / Docente Encargado:
                                        </label>
                                        <select
                                            value={selectedStaffId}
                                            onChange={e => setSelectedStaffId(e.target.value)}
                                            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            {candidateStaffMembers.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Fecha de la Cita:
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => {
                                                setSelectedDate(e.target.value);
                                                setSelectedSlot(null);
                                            }}
                                            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Slot Grid */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Horarios Disponibles (Sin cruce con clases):
                                        </label>
                                        <span className="text-[10px] text-slate-400">
                                            {availableSlots.filter(s => s.isAvailable).length} horarios libres
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                        {availableSlots.map((slot, idx) => {
                                            const isSelected = selectedSlot?.start === slot.startIso;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={!slot.isAvailable}
                                                    onClick={() => setSelectedSlot({ start: slot.startIso, end: slot.endIso })}
                                                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                                                        !slot.isAvailable 
                                                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' 
                                                            : isSelected 
                                                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs' 
                                                                : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-400'
                                                    }`}
                                                    title={slot.conflictReason || 'Horario libre para atención'}
                                                >
                                                    <span className="font-mono text-xs font-bold">{slot.start} - {slot.end}</span>
                                                    <span className="text-[9px] mt-0.5">
                                                        {slot.isAvailable ? 'Disponible ✓' : 'Ocupado'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {availableSlots.length === 0 && (
                                        <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 mt-2">
                                            No hay atención disponible para la fecha seleccionada (fin de semana o día no laborable).
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setWizardStep(2)}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                                    >
                                        ⬅ Volver
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!selectedSlot}
                                        onClick={() => setWizardStep(4)}
                                        className="px-5 py-2.5 bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                                    >
                                        Continuar al Motivo ➔
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Reason & Notes */}
                        {wizardStep === 4 && (
                            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                                {bookingSuccessMsg ? (
                                    <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center border border-emerald-200 animate-fadeIn">
                                        <CheckCircleIcon className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                                        <p className="font-bold text-sm">{bookingSuccessMsg}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Summary Box */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Estudiante:</span>
                                                <span className="font-bold text-slate-900">{activeChild?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Departamento:</span>
                                                <span className="font-bold text-indigo-700">{DEPARTMENTS.find(d => d.code === selectedDept)?.title}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Atención con:</span>
                                                <span className="font-bold text-slate-900">{candidateStaffMembers.find(s => s.id === selectedStaffId)?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Fecha y Hora:</span>
                                                <span className="font-bold font-mono text-emerald-700">
                                                    {selectedSlot && new Date(selectedSlot.start).toLocaleString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Categoría del Motivo:
                                            </label>
                                            <select
                                                value={reasonCategory}
                                                onChange={e => setReasonCategory(e.target.value)}
                                                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            >
                                                {DEPARTMENTS.find(d => d.code === selectedDept)?.reasons.map((r, i) => (
                                                    <option key={i} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Detalle o Notas del Representante (Opcional):
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={parentNotes}
                                                onChange={e => setParentNotes(e.target.value)}
                                                placeholder="Describa brevemente el motivo o aspectos puntuales que desea tratar en la reunión..."
                                                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                                            <ShieldCheckIcon className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                            <span>
                                                Al confirmar, se enviará una notificación institucional al personal seleccionado y se reservará el bloque en la agenda. Al culminar la cita se emitirá el Acta Digital de Compromisos.
                                            </span>
                                        </div>

                                        <div className="flex justify-between pt-4 border-t">
                                            <button
                                                type="button"
                                                onClick={() => setWizardStep(3)}
                                                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                                            >
                                                ⬅ Volver
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                                            >
                                                Confirmar y Agendar Cita ✓
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MEETING EXECUTION & DIGITAL ACTA MODAL */}
            {executingAppointment && (
                <MeetingExecutionModal
                    appointment={executingAppointment}
                    isOpen={!!executingAppointment}
                    onClose={() => setExecutingAppointment(null)}
                    onSave={(updatedAppt) => {
                        const updated = appointments.map(a => a.id === updatedAppt.id ? updatedAppt : a);
                        onUpdateAppointments(updated);
                        setExecutingAppointment(null);
                    }}
                />
            )}
        </div>
    );
};

export default MultiDeptAppointmentEngine;
