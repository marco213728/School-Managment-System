
import React, { useState, useEffect } from 'react';
import { User, Role, Class, Student } from '../../types';
import { CloseIcon, ClockIcon } from '../icons/Icons';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'> & { id?: string }) => void;
  userToEdit: User | null;
  allClasses: Class[];
  allStudents: Student[];
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, userToEdit, allClasses, allStudents }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'> & { id?: string; maxMonthlyHours?: number; workSchedule?: any }>({
    id: undefined,
    name: '',
    email: '',
    password: '',
    role: Role.Student,
    classIds: [],
    childIds: [],
    phone: '',
    address: '',
    maxMonthlyHours: undefined,
    workSchedule: {}
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        id: userToEdit.id,
        name: userToEdit.name,
        email: userToEdit.email,
        password: '', 
        role: userToEdit.role,
        classIds: userToEdit.classIds || [],
        childIds: userToEdit.childIds || [],
        phone: userToEdit.phone || '',
        address: userToEdit.address || '',
        maxMonthlyHours: userToEdit.maxMonthlyHours,
        workSchedule: userToEdit.workSchedule || {},
      });
    } else {
      setFormData({
        id: undefined,
        name: '',
        email: '',
        password: '',
        role: Role.Student,
        classIds: [],
        childIds: [],
        phone: '',
        address: '',
        maxMonthlyHours: undefined,
        workSchedule: {}
      });
    }
  }, [userToEdit, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.currentTarget;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? (value ? Number(value) : undefined) : value }));
  };

  const handleClassIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.currentTarget.selectedOptions, (option: HTMLOptionElement) => option.value);
    setFormData(prev => ({ ...prev, classIds: values }));
  }

  const handleChildIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.currentTarget.selectedOptions, (option: HTMLOptionElement) => option.value);
    setFormData(prev => ({ ...prev, childIds: values }));
  }

  const handleScheduleChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
        ...prev,
        workSchedule: {
            ...prev.workSchedule,
            [day]: {
                ...prev.workSchedule?.[day],
                [field]: value
            }
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const isStaff = [Role.Teacher, Role.InstitutionAdmin, Role.InspectorGeneral, Role.Vicerrector, Role.JefeDECE].includes(formData.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            <CloseIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">{userToEdit ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!userToEdit} placeholder={userToEdit ? 'Dejar en blanco para no cambiar' : ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>

          {/* Configuración de Horario Laboral para Personal */}
          {isStaff && (
             <div className="border p-4 rounded-md bg-slate-50 mt-4">
                <div className="flex items-center gap-2 mb-3 border-b pb-2">
                    <ClockIcon className="h-5 w-5 text-primary-600" />
                    <h3 className="font-bold text-gray-800">Horario Laboral (Entrada y Salida)</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Defina la hora esperada de entrada y salida para el control de atrasos.</p>
                <div className="grid grid-cols-1 gap-2">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="grid grid-cols-3 items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">{day}</label>
                            <input 
                                type="time" 
                                value={formData.workSchedule?.[day]?.startTime || ''} 
                                onChange={e => handleScheduleChange(day, 'startTime', e.target.value)}
                                className="p-1 border rounded text-sm"
                                title={`Hora de entrada para ${day}`}
                            />
                            <input 
                                type="time" 
                                value={formData.workSchedule?.[day]?.endTime || ''} 
                                onChange={e => handleScheduleChange(day, 'endTime', e.target.value)}
                                className="p-1 border rounded text-sm"
                                title={`Hora de salida para ${day}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
          )}

          {formData.role === Role.Teacher && (
             <>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Clases Asignadas (mantener Ctrl para selección múltiple)</label>
                    <select multiple name="classIds" value={formData.classIds} onChange={handleClassIdsChange} className="mt-1 block w-full h-24 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    {allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Horas Mensuales Máximas</label>
                    <input type="number" name="maxMonthlyHours" value={formData.maxMonthlyHours || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" placeholder="Ej: 80" />
                </div>
            </>
          )}

          {formData.role === Role.Student && (
             <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Clase</label>
                <select name="classIds" value={formData.classIds?.[0] || ''} onChange={(e) => setFormData(prev => ({...prev, classIds: [e.currentTarget.value]}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                  <option value="">-- Sin clase --</option>
                  {allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
          )}

          {formData.role === Role.Parent && (
             <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Hijos (mantener Ctrl para selección múltiple)</label>
                <select multiple name="childIds" value={formData.childIds} onChange={handleChildIdsChange} className="mt-1 block w-full h-24 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                  {allStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
