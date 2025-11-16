import React, { useState } from 'react';
import { CloseIcon, UploadIcon } from '../icons/Icons';

interface JustificationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notes: string, documentUrl?: string) => void;
}

const JustificationForm: React.FC<JustificationFormProps> = ({ isOpen, onClose, onSave }) => {
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        // Simulate file upload
        setTimeout(() => {
            const documentUrl = file ? URL.createObjectURL(file) : undefined;
            onSave(notes, documentUrl);
            setIsUploading(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">Justificar Ausencia</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Motivo de la Justificación</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="Ej: Cita médica, enfermedad, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adjuntar Documento (Opcional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                        <span>Subir un archivo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">o arrastrar y soltar</p>
                                </div>
                                {file ? (
                                    <p className="text-sm text-gray-500 font-semibold">{file.name}</p>
                                ) : (
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 5MB</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400">
                            {isUploading ? 'Enviando...' : 'Enviar Justificación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JustificationForm;