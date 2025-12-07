import React, { useState } from 'react';
import { FormalRequest } from '../../types';
import { CloseIcon, CheckCircleIcon, CloseIcon as RejectIcon, DownloadIcon } from '../icons/Icons';

interface RequestDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: FormalRequest;
    requesterName: string;
    isReviewer: boolean;
    onResolve: (requestId: string, status: 'Approved' | 'Rejected', comments: string) => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ isOpen, onClose, request, requesterName, isReviewer, onResolve }) => {
    const [comments, setComments] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{request.subject}</h2>
                        <p className="text-sm text-gray-500">De: {requesterName} | Tipo: {request.type}</p>
                    </div>
                    <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                </header>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700">Detalles:</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">{request.details}</p>
                    </div>
                    {request.attachmentUrl && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700">Adjunto:</h4>
                            <a href={request.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline mt-1">
                                <DownloadIcon className="h-4 w-4" /> Ver Documento Adjunto
                            </a>
                        </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-4">
                         <div>
                            <span className="text-sm font-semibold text-gray-700">Estado: </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>{request.status === 'Approved' ? 'Aprobada' : request.status === 'Rejected' ? 'Rechazada' : 'Pendiente'}</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(request.submissionDate).toLocaleString()}</span>
                    </div>
                    
                    {request.resolutionComments && (
                        <div className="bg-gray-100 p-3 rounded-md">
                            <h4 className="text-sm font-bold text-gray-700">Comentarios de Resolución:</h4>
                            <p className="text-sm text-gray-600">{request.resolutionComments}</p>
                        </div>
                    )}
                </div>

                {isReviewer && request.status === 'Pending' && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Resolución</h4>
                        <textarea 
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            placeholder="Añadir comentarios (opcional para aprobar, requerido para rechazar)..."
                            className="w-full p-2 border rounded-md text-sm mb-3"
                            rows={2}
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => onResolve(request.id, 'Rejected', comments)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-semibold"
                            >
                                <RejectIcon className="h-4 w-4" /> Rechazar
                            </button>
                            <button 
                                onClick={() => onResolve(request.id, 'Approved', comments || 'Aprobado.')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                            >
                                <CheckCircleIcon className="h-4 w-4" /> Aprobar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestDetailModal;