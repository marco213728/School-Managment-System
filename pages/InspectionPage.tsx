import React, { useState } from 'react';
import { AttendanceRecord, Student, Class, ExitPass, Notification, User, ScheduleEntry, Subject, TimeSlot, Room, Timetable } from '../types';
import JustificationManagement from '../components/inspection/JustificationManagement';
import ExitPassManagement from '../components/inspection/ExitPassManagement';

interface InspectionPageProps {
    attendanceRecords: AttendanceRecord[];
    onUpdateAttendance: (records: AttendanceRecord[]) => void;
    students: Student[];
    classes: Class[];
    exitPasses: ExitPass[];
    onUpdateExitPasses: (passes: ExitPass[]) => void;
    notifications: Notification[];
    onUpdateNotifications: (notifications: Notification[]) => void;
    users: User[];
}

const Card: React.FC<{ title: string; description: string; buttonText: string; onClick?: () => void; disabled?: boolean }> = ({ title, description, buttonText, onClick, disabled }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
        <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <button onClick={onClick} disabled={disabled} className={`mt-4 w-full text-left px-4 py-2 font-semibold rounded-md ${disabled ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            {buttonText}
        </button>
    </div>
);

const InspectionPage: React.FC<InspectionPageProps> = (props) => {
    const { attendanceRecords, onUpdateAttendance, students, classes, exitPasses, onUpdateExitPasses, notifications, onUpdateNotifications, users } = props;
    const [view, setView] = useState<'dashboard' | 'justifications' | 'exitPasses'>('dashboard');

    if (view === 'justifications') {
        return <JustificationManagement 
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={onUpdateAttendance}
            students={students}
            classes={classes}
            onBack={() => setView('dashboard')}
        />;
    }

    if (view === 'exitPasses') {
        return <ExitPassManagement
            exitPasses={exitPasses}
            onUpdateExitPasses={onUpdateExitPasses}
            students={students}
            users={users}
            notifications={notifications}
            onUpdateNotifications={onUpdateNotifications}
            onBack={() => setView('dashboard')}
        />
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulo Inspección General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                    title="Gestionar Justificaciones de Ausencia"
                    description="Revisar y aprobar o rechazar las justificaciones de ausencia enviadas por los padres."
                    buttonText="Gestionar Justificaciones"
                    onClick={() => setView('justifications')}
                />
                 <Card 
                    title="Gestionar Pases de Salida"
                    description="Registrar y autorizar la salida de estudiantes durante el horario escolar."
                    buttonText="Registrar Salida"
                    onClick={() => setView('exitPasses')}
                />
                <Card 
                    title="Evaluación de Calidad y Analíticas"
                    description="Evaluar el sistema educativo, identificar áreas de mejora y asegurar la rendición de cuentas."
                    buttonText="Analizar Datos"
                    disabled
                />
                <Card 
                    title="Asesoría y Resolución de Conflictos"
                    description="Centralizar la orientación a la comunidad y el fomento de un clima institucional positivo."
                    buttonText="Gestionar Casos"
                    disabled
                />
            </div>
        </div>
    );
};

export default InspectionPage;