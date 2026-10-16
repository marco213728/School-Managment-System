import React from 'react';
import { User, StaffAttendanceRecord, AttendanceJustification } from '../../types';
import { CloseIcon } from '../icons/Icons';
import StaffAttendanceKiosk from './StaffAttendanceKiosk';

interface StaffAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onRecordAttendance: (
        userId: string, 
        method: 'Biometric' | 'Manual' | 'Facial', 
        location?: { latitude: number; longitude: number; },
        justification?: AttendanceJustification,
        photoProof?: string,
        facialConfidence?: number,
        facialMatch?: boolean,
        flagReason?: string
    ) => void;
    records: StaffAttendanceRecord[];
    currentUser: User | null; // Allow null for safety
}

const StaffAttendanceModal: React.FC<StaffAttendanceModalProps> = ({ isOpen, onClose, users, onRecordAttendance, records, currentUser }) => {
    
    if (!isOpen || !currentUser) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                 <header className="px-5 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Control de Asistencia del Personal</h2>
                        <p className="text-xs text-slate-500">Registro de entrada, descansos y salida de jornada</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </header>
                <div className="p-3 sm:p-5 overflow-y-auto">
                    {/* Pass the current user and their attendance records */}
                    <StaffAttendanceKiosk
                        users={[currentUser]} 
                        records={records}
                        onRecordAttendance={onRecordAttendance}
                        onCompleted={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default StaffAttendanceModal;