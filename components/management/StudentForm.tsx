
import React, { useState, useEffect, useContext } from 'react';
import { Student, User, Class, Role } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { CloseIcon } from '../icons/Icons';

interface StudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (student: Student, parent: User) => void;
    studentToEdit: Student | null;
    allUsers: User[];
    allClasses: Class[];
}

const StudentForm: React.FC<StudentFormProps> = ({ isOpen, onClose, onSave, studentToEdit, allUsers, allClasses }) => {
    const { user: currentUser } = useContext(UserContext);
    const [studentData, setStudentData] = useState({ name: '', classId: '', phone: '', address: '', photoUrl: '' });
    const [parentData, setParentData] = useState({ name: '', email: '', phone: '', address: '' });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (studentToEdit) {
            const parent = allUsers.find(u => u.id === studentToEdit.parentId);
            setStudentData({
                name: studentToEdit.name,
                classId: studentToEdit.classId,
                phone: studentToEdit.phone || '',
                address: studentToEdit.address || '',
                photoUrl: studentToEdit.photoUrl || '',
            });
            if (parent) {
                setParentData({
                    name: parent.name,
                    email: parent.email,
                    phone: parent.phone || '',
                    address: parent.address || '',
                });
            }
            setPhotoPreview(studentToEdit.photoUrl || null);
        } else {
            // Reset form
            setStudentData({ name: '', classId: '', phone: '', address: '', photoUrl: '' });
            setParentData({ name: '', email: '', phone: '', address: '' });
            setPhotoPreview(null);
        }
    }, [studentToEdit, isOpen, allUsers]);

    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStudentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotoPreview(result);
                setStudentData(prev => ({ ...prev, photoUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const institutionId = currentUser!.institutionId!;

        if (studentToEdit) {
            // Editing existing student and parent
            const updatedStudent: Student = { ...studentToEdit, ...studentData };
            const parentUser = allUsers.find(u => u.id === studentToEdit.parentId)!;
            const updatedParent: User = { ...parentUser, ...parentData };
            onSave(updatedStudent, updatedParent);
        } else {
            // Creating new student and parent
            const newParentId = `user-${Date.now()}`;
            const newStudentId = `student-${Date.now()}`;

            const newParent: User = {
                id: newParentId,
                ...parentData,
                role: Role.Parent,
                childIds: [newStudentId], // Initialize as array
                institutionId,
                password: 'password', // Default password for prototype
            };
            const newStudent: Student = {
                id: newStudentId,
                ...studentData,
                parentId: newParentId,
                institutionId,
            };
            onSave(newStudent, newParent);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{studentToEdit ? 'Editar' : 'Añadir'} Alumno</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2">
                    {/* Student Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2">Datos del Alumno</legend>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <img src={photoPreview || 'https://placehold.co/200x200/cccccc/333333?text=Foto'} alt="Vista previa de la foto del alumno" className="w-20 h-20 rounded-full object-cover bg-gray-100 border" />
                                <div>
                                    <label htmlFor="student-photo-upload" className="cursor-pointer px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                                        Subir / Cambiar Foto
                                    </label>
                                    <input id="student-photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Nombre Completo</label>
                                <input type="text" name="name" value={studentData.name} onChange={handleStudentChange} required className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Clase</label>
                                <select name="classId" value={studentData.classId} onChange={handleStudentChange} required className="mt-1 w-full p-2 border rounded-md bg-white">
                                    <option value="">-- Seleccionar Clase --</option>
                                    {allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Teléfono</label>
                                    <input type="tel" name="phone" value={studentData.phone} onChange={handleStudentChange} className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Dirección</label>
                                    <input type="text" name="address" value={studentData.address} onChange={handleStudentChange} className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    {/* Parent Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2">Datos del Familiar Principal</legend>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nombre Completo</label>
                                <input type="text" name="name" value={parentData.name} onChange={handleParentChange} required className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input type="email" name="email" value={parentData.email} onChange={handleParentChange} required className="mt-1 w-full p-2 border rounded-md" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Teléfono</label>
                                    <input type="tel" name="phone" value={parentData.phone} onChange={handleParentChange} className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Dirección</label>
                                    <input type="text" name="address" value={parentData.address} onChange={handleParentChange} className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
