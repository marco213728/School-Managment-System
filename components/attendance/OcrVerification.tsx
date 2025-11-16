import React, { useState } from 'react';
import { OcrSubmission, AttendanceStatus } from '../../types';
import { ArrowLeftIcon } from '../icons/Icons';

interface OcrVerificationProps {
    submission: OcrSubmission;
    onBack: () => void;
    onApprove: (submissionId: string, updatedData: any) => void;
}

const statusOptions = Object.values(AttendanceStatus);

const OcrVerification: React.FC<OcrVerificationProps> = ({ submission, onBack, onApprove }) => {
    const [editedData, setEditedData] = useState(submission.extractedData);

    const handleStatusChange = (index: number, newStatus: AttendanceStatus) => {
        const newData = [...editedData];
        newData[index] = { ...newData[index], correctedStatus: newStatus };
        setEditedData(newData);
    };

    const handleApprove = () => {
        onApprove(submission.id, editedData);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence < 0.8) return 'bg-red-100';
        if (confidence < 0.95) return 'bg-yellow-100';
        return 'bg-green-100';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la Lista
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Verificación de Asistencia OCR</h2>
            <p className="text-sm text-gray-500 mb-6">Archivo: <span className="font-medium">{submission.fileName}</span></p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Documento Original</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <img src={submission.imageUrl} alt="Hoja de asistencia" className="w-full h-auto" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Datos Extraídos</h3>
                    <p className="text-xs text-gray-500 mb-4">Revise y corrija los datos extraídos por el sistema. Las filas resaltadas indican una baja confianza del OCR.</p>
                    <div className="overflow-x-auto border rounded-lg max-h-[70vh]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado Correcto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {editedData.map((item, index) => (
                                    <tr key={index} className={item.confidence < 0.95 ? getConfidenceColor(item.confidence) : ''}>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{item.studentName}</p>
                                            <p className="text-xs text-gray-500">Detectado: "{item.detectedStatus}" (Confianza: {(item.confidence * 100).toFixed(0)}%)</p>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <select
                                                value={item.correctedStatus || ''}
                                                onChange={(e) => handleStatusChange(index, e.target.value as AttendanceStatus)}
                                                className="w-full p-1 border rounded-md text-sm"
                                            >
                                                <option value="" disabled>-- Seleccionar --</option>
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleApprove} className="mt-6 w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        Aprobar y Guardar Asistencia
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OcrVerification;