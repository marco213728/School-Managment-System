
import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { StaffAttendanceRecord, User } from '../types';
import StaffAttendanceKiosk from '../components/staff/StaffAttendanceKiosk';
import StaffAttendanceReport from '../components/staff/StaffAttendanceReport';
import { FingerPrintIcon } from '../components/icons/Icons';

// FIX: Update props to match the expected types for handlers.
interface StaffSelfServicePageProps {
    staffAttendanceRecords: StaffAttendanceRecord[];
    onUpdateStaffAttendance: (userId: string, method: 'Biometric' | 'Manual', location?: { latitude: number; longitude: number; }) => void;
    users: User[];
}

const StaffSelfServicePage: React.FC<StaffSelfServicePageProps> = ({ staffAttendanceRecords, onUpdateStaffAttendance, users }) => {
    const { user } = useContext(UserContext);

    const myRecords = useMemo(() => {
        if (!user) return [];
        return staffAttendanceRecords.filter(r => r.userId === user.id);
    }, [staffAttendanceRecords, user]);

    // FIX: Ensure the handler passes the correct arguments.
    const handleRecordAttendance = (userId: string, method: 'Biometric' | 'Manual', location?: { latitude: number; longitude: number; }) => {
        // This function now just calls the prop passed down from App.tsx
        // The complex logic is centralized there.
        onUpdateStaffAttendance(userId, method, location);
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                    <FingerPrintIcon className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Control de Personal</h2>
                    <p className="text-slate-500">Registro de asistencia y consulta de historial.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-700">Registrar Entrada / Salida / Descanso</h3>
                    {/* FIX: Remove the 'records' prop as it's not supported by StaffAttendanceKiosk. */}
                    <StaffAttendanceKiosk 
                        users={[user]} // Only pass the current user to lock the kiosk to them
                        onRecordAttendance={handleRecordAttendance}
                    />
                </div>

                <div className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-700">Mi Historial de Asistencia</h3>
                     <StaffAttendanceReport 
                        records={myRecords}
                        users={[user]}
                     />
                </div>
            </div>
        </div>
    );
};

export default StaffSelfServicePage;
