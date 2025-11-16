

import React, { useState, useEffect } from 'react';
import { User, Role, Class, Student } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'> & { id?: string }) => void;
  userToEdit: User | null;
  allClasses: Class[];
  allStudents: Student[];
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, userToEdit, allClasses, allStudents }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'> & { id?: string; maxMonthlyHours?: number }>({
    id: undefined,
    name: '',
    email: '',
    password: '',
    role: Role.Student,
    classIds: [],
    childId: '',
    phone: '',
    address: '',
    maxMonthlyHours: undefined,
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        id: userToEdit.id,
        name: userToEdit.name,
        email: userToEdit.email,
        password: '', // Keep password field blank for security on edits
        role: userToEdit.role,
        classIds: userToEdit.classIds || [],
        childId: userToEdit.childId || '',
        phone: userToEdit.phone || '',
        address: userToEdit.address || '',
        maxMonthlyHours: userToEdit.maxMonthlyHours,
      });
    } else {
      setFormData({
        id: undefined,
        name: '',
        email: '',
        password: '',
        role: Role.Student,
        classIds: [],
        childId: '',
        phone: '',
        address: '',
        maxMonthlyHours: undefined,
      });
    }
  }, [userToEdit, isOpen]);
  
  // FIX: Use `e.currentTarget` to correctly access form element properties and avoid type errors.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? (value ? Number(value) : undefined) : value }));
  };

  // FIX: Use `e.currentTarget` to correctly access selected options from a multi-select element.
  const handleClassIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIX: Explicitly type `option` as HTMLOptionElement to resolve `value` property access error.
    const values = Array.from(e.currentTarget.selectedOptions, (option: HTMLOptionElement) => option.value);
    setFormData(prev => ({ ...prev, classIds: values }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">{userToEdit ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!userToEdit} placeholder={userToEdit ? 'Dejar en blanco para no cambiar' : ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
              {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>

          {formData.role === Role.Teacher && (
             <>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Clases Asignadas (mantener Ctrl para selección múltiple)</label>
                    <select multiple name="classIds" value={formData.classIds} onChange={handleClassIdsChange} className="mt-1 block w-full h-32 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    {allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Horas Mensuales Máximas</label>
                    <input type="number" name="maxMonthlyHours" value={formData.maxMonthlyHours || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Ej: 80" />
                </div>
            </>
          )}

          {formData.role === Role.Student && (
             <div>
                <label className="block text-sm font-medium text-gray-700">Clase</label>
                <select name="classIds" value={formData.classIds?.[0] || ''} onChange={(e) => setFormData(prev => ({...prev, classIds: [e.currentTarget.value]}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                  <option value="">-- Sin clase --</option>
                  {allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
          )}

          {formData.role === Role.Parent && (
             <div>
                <label className="block text-sm font-medium text-gray-700">Hijo/a</label>
                <select name="childId" value={formData.childId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                  <option value="">-- Seleccionar Alumno --</option>
                  {allStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;