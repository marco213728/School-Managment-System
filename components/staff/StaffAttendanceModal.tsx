import React, { useContext } from 'react';
import { User, StaffAttendanceRecord } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { CloseIcon } from '../icons/Icons';
import StaffAttendanceKiosk from './StaffAttendanceKiosk';

interface StaffAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onRecordAttendance: (userId: string, method: 'Biometric' | 'Manual', location?: { latitude: number; longitude: number; }) => void;
    records: StaffAttendanceRecord[];
}

const StaffAttendanceModal: React.FC<StaffAttendanceModalProps> = ({ isOpen, onClose, users, onRecordAttendance, records }) => {
    const { user } = useContext(UserContext);
    
    if (!isOpen || !user) return null;

    const userRecords = records.filter(r => r.userId === user.id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                 <header className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-bold text-slate-800">Registrar Asistencia</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                <div className="p-2 sm:p-4 overflow-y-auto">
                    <StaffAttendanceKiosk
                        users={[user]} // Only pass the current user
                        onRecordAttendance={onRecordAttendance}
                        records={userRecords}
                    />
                </div>
            </div>
        </div>
    );
};

export default StaffAttendanceModal;
