import React, { useState } from 'react';
import { InstitutionalDocument } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, CheckCircleIcon } from '../icons/Icons';

interface InstitutionalDocumentManagerProps {
    documents: InstitutionalDocument[];
    onUpdateDocuments: (docs: InstitutionalDocument[]) => void;
}

const InstitutionalDocumentManager: React.FC<InstitutionalDocumentManagerProps> = ({ documents, onUpdateDocuments }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<InstitutionalDocument | null>(null);
    const [formData, setFormData] = useState<Partial<InstitutionalDocument>>({
        type: 'PEI',
        title: '',
        status: 'Borrador',
        version: '1.0',
        url: ''
    });

    const handleEdit = (doc: InstitutionalDocument) => {
        setEditingDoc(doc);
        setFormData(doc);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Eliminar este documento?')) {
            onUpdateDocuments(documents.filter(d => d.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString();
        if (editingDoc) {
            const updated = documents.map(d => d.id === editingDoc.id ? { ...d, ...formData, lastUpdated: now } as InstitutionalDocument : d);
            onUpdateDocuments(updated);
        } else {
            const newDoc: InstitutionalDocument = {
                id: `doc-${Date.now()}`,
                institutionId: 'uemol', // In real app, get from context
                lastUpdated: now,
                type: formData.type as any,
                title: formData.title!,
                status: formData.status as any,
                version: formData.version!,
                url: formData.url
            };
            onUpdateDocuments([...documents, newDoc]);
        }
        setIsFormOpen(false);
        setEditingDoc(null);
        setFormData({ type: 'PEI', title: '', status: 'Borrador', version: '1.0', url: '' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    Instrumentos de Gestión Escolar
                </h3>
                <button onClick={() => { setEditingDoc(null); setIsFormOpen(true); }} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 flex items-center gap-1">
                    <PlusIcon className="h-3 w-3"/> Nuevo Documento
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSave} className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-bold text-sm mb-3">{editingDoc ? 'Editar Documento' : 'Nuevo Documento'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label className="block text-xs font-bold text-gray-600">Tipo</label><select className="w-full p-2 border rounded text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option>PEI</option><option>PCI</option><option>PCA</option><option>CodigoConvivencia</option><option>PlanGestionRiesgos</option></select></div>
                        <div><label className="block text-xs font-bold text-gray-600">Estado</label><select className="w-full p-2 border rounded text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option>Borrador</option><option>Revisión</option><option>Aprobado</option><option>Vigente</option></select></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600">Título</label><input type="text" className="w-full p-2 border rounded text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                        <div><label className="block text-xs font-bold text-gray-600">Versión</label><input type="text" className="w-full p-2 border rounded text-sm" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-gray-600">Enlace / URL</label><input type="text" className="w-full p-2 border rounded text-sm" value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="http://..." /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancelar</button>
                        <button type="submit" className="px-3 py-1 bg-teal-600 text-white rounded text-sm">Guardar</button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 group">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${doc.status === 'Vigente' ? 'bg-green-500' : doc.status === 'Aprobado' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                                {doc.type}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                                <p className="text-xs text-gray-500">Ver: {doc.version} • Act: {new Date(doc.lastUpdated).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${doc.status === 'Vigente' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{doc.status}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(doc)} className="p-1 text-gray-400 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                <button onClick={() => handleDelete(doc.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        </div>
                    </div>
                ))}
                {documents.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No hay documentos registrados.</p>}
            </div>
        </div>
    );
};

export default InstitutionalDocumentManager;