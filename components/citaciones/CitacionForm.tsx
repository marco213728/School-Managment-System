
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student } from '../../types';
import { CloseIcon, SearchIcon } from '../icons/Icons';

interface CitacionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: { studentId: string; date: string; reason: string; }) => void;
    students: Student[];
}

const CitacionForm: React.FC<CitacionFormProps> = ({ isOpen, onClose, onSave, students }) => {
    const [studentId, setStudentId] = useState('');
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    // State for the searchable dropdown
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        if(isDropdownOpen) {
            // Focus the search input when dropdown opens
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }
    }, [isDropdownOpen]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [students, searchTerm]);

    const handleSelectStudent = (student: Student) => {
        setStudentId(student.id);
        setSelectedStudentName(student.name);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ studentId, date, reason });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">Crear Nueva Citación</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estudiante</label>
                         <div ref={dropdownRef} className="relative mt-1">
                            <input
                                type="text"
                                value={selectedStudentName}
                                onFocus={() => setIsDropdownOpen(true)}
                                readOnly
                                required
                                placeholder="-- Seleccione un estudiante --"
                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm cursor-pointer"
                            />
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                    <div className="relative p-2">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Buscar estudiante..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <SearchIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <ul className="max-h-60 overflow-y-auto">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map(s => (
                                                <li key={s.id} onClick={() => handleSelectStudent(s)} className="px-4 py-2 hover:bg-primary-100 cursor-pointer text-sm">
                                                    {s.name}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-2 text-sm text-gray-500">No se encontraron estudiantes.</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha y Hora de la Cita</label>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Motivo de la Citación</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows={5}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="Describa brevemente el motivo de la reunión..."
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Enviar Citación</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CitacionForm;
