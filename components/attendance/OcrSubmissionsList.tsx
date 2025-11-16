import React from 'react';
import { OcrSubmission, OcrSubmissionStatus } from '../../types';

interface OcrSubmissionsListProps {
    submissions: OcrSubmission[];
    onReviewClick: (submission: OcrSubmission) => void;
}

const statusColors: Record<OcrSubmissionStatus, string> = {
    [OcrSubmissionStatus.Processing]: 'bg-blue-100 text-blue-800',
    [OcrSubmissionStatus.PendingVerification]: 'bg-yellow-100 text-yellow-800',
    [OcrSubmissionStatus.Completed]: 'bg-green-100 text-green-800',
    [OcrSubmissionStatus.Failed]: 'bg-red-100 text-red-800',
};

const OcrSubmissionsList: React.FC<OcrSubmissionsListProps> = ({ submissions, onReviewClick }) => {
    return (
        <div className="overflow-x-auto">
            {submissions.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Carga</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map(sub => (
                            <tr key={sub.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.fileName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.uploadDate).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[sub.status]}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {sub.status === OcrSubmissionStatus.PendingVerification && (
                                        <button onClick={() => onReviewClick(sub)} className="text-primary-600 hover:text-primary-900 font-semibold">
                                            Revisar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                     <p>No hay envíos para la clase seleccionada.</p>
                </div>
            )}
        </div>
    );
};

export default OcrSubmissionsList;