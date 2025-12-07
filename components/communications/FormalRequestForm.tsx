import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { FormalRequest, FormalRequestType, Role, FormalRequestRecipient } from '../../types';
import { CloseIcon, UploadIcon } from '../icons/Icons';

interface FormalRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (request: Omit<FormalRequest, 'id' | 'institutionId' | 'requesterId' | 'status' | 'submissionDate'>) => void;
}

const FormalRequestForm: React.FC<FormalRequestFormProps> = ({ isOpen, onClose, onSave }) => {
    const { user } = useContext(UserContext);
    const [subject, setSubject] = useState('');
    const [type, setType] = useState<FormalRequestType>('Time Off');
    const [recipientRole, setRecipientRole] = useState<FormalRequestRecipient>(Role.Vicerrector);
    const [details, setDetails] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate file upload by creating a fake URL
        const attachmentUrl = file ? URL.createObjectURL(file) : undefined;
        
        onSave({
            subject,
            type,
            recipientRole,
            details,
            attachmentUrl
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Nueva Solicitud Formal</h2>
                    <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Destinatario</label>
                        <select 
                            value={recipientRole} 
                            onChange={e => setRecipientRole(e.target.value as FormalRequestRecipient)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value={Role.Rector}>Rectorado</option>
                            <option value={Role.Vicerrector}>Vicerrectorado</option>
                            <option value={Role.InstitutionAdmin}>Administración</option>
                            <option value={Role.InspectorGeneral}>Inspección General</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Solicitud</label>
                        <select 
                            value={type} 
                            onChange={e => setType(e.target.value as FormalRequestType)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="Time Off">Permiso / Ausencia</option>
                            <option value="Supply Request">Solicitud de Suministros</option>
                            <option value="Complaint">Queja / Reporte</option>
                            <option value="Other">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asunto</label>
                        <input 
                            type="text" 
                            value={subject} 
                            onChange={e => setSubject(e.target.value)} 
                            required 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Detalles</label>
                        <textarea 
                            value={details} 
                            onChange={e => setDetails(e.target.value)} 
                            required 
                            rows={4} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adjuntar Archivo (Opcional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                        <span>Subir archivo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                </div>
                                {file ? <p className="text-sm text-gray-500">{file.name}</p> : <p className="text-xs text-gray-500">PDF, JPG, PNG hasta 5MB</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Enviar Solicitud</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormalRequestForm;