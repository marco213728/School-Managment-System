
import React, { useState } from 'react';
import { CloseIcon, ArchiveBoxIcon, DownloadIcon, SearchIcon, PlusIcon, UploadIcon } from '../icons/Icons';

interface ProtocolRepositoryProps {
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL_DOCUMENTS = [
    { id: 1, category: 'Normativa Legal', title: 'Ley Orgánica de Educación Intercultural (LOEI)', date: '2021', type: 'PDF' },
    { id: 2, category: 'Normativa Legal', title: 'Código de la Niñez y Adolescencia', date: '2014', type: 'PDF' },
    { id: 3, category: 'Protocolos MinEduc', title: 'Protocolos y Rutas de Actuación frente a situaciones de violencia', date: '2023', type: 'PDF' },
    { id: 4, category: 'Protocolos MinEduc', title: 'Guía de Derivación a Instituciones de la Red de Protección', date: '2022', type: 'PDF' },
    { id: 5, category: 'Rutas', title: 'Ruta de Actuación: Violencia Sexual', date: '2024', type: 'Imagen' },
    { id: 6, category: 'Rutas', title: 'Ruta de Actuación: Acoso Escolar', date: '2024', type: 'Imagen' },
    { id: 7, category: 'Formatos', title: 'Formato de Denuncia Fiscalía (Plantilla)', date: '2024', type: 'DOCX' },
];

const ProtocolRepository: React.FC<ProtocolRepositoryProps> = ({ isOpen, onClose }) => {
    const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    
    // Upload State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', category: 'Normativa Legal', type: 'PDF', file: null as File | null });

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todas' || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDoc.title) return;

        const newDocument = {
            id: Date.now(),
            title: newDoc.title,
            category: newDoc.category,
            type: newDoc.type,
            date: new Date().getFullYear().toString(),
        };

        setDocuments([newDocument, ...documents]);
        setIsUploadOpen(false);
        setNewDoc({ title: '', category: 'Normativa Legal', type: 'PDF', file: null });
        alert('Documento añadido correctamente al repositorio.');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileType = file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.docx') ? 'DOCX' : 'Imagen';
            setNewDoc({ ...newDoc, file: file, title: newDoc.title || file.name, type: fileType });
        }
    };

    const handleDownload = (title: string) => {
        alert(`Descargando documento: ${title}... (Simulación)`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <header className="flex justify-between items-center p-4 border-b bg-indigo-50 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                            <ArchiveBoxIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Repositorio de Normativa y Protocolos</h2>
                            <p className="text-sm text-gray-600">Documentos habilitantes y guías oficiales.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setIsUploadOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-md hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                            <PlusIcon className="h-4 w-4" /> Añadir Documento
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-white rounded-full transition-colors">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <div className="p-4 border-b flex flex-col md:flex-row gap-4 bg-gray-50">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="Buscar documento..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <select 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                        className="p-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="Todas">Todas las Categorías</option>
                        <option value="Normativa Legal">Normativa Legal</option>
                        <option value="Protocolos MinEduc">Protocolos MinEduc</option>
                        <option value="Rutas">Rutas Gráficas</option>
                        <option value="Formatos">Formatos Editables</option>
                    </select>
                </div>

                {/* Upload Form (Inline) */}
                {isUploadOpen && (
                    <form onSubmit={handleAddDocument} className="p-4 bg-indigo-50 border-b animate-fade-in">
                        <h4 className="font-bold text-indigo-800 mb-3 text-sm">Subir Nuevo Documento</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                                <select 
                                    className="w-full p-2 border rounded text-sm"
                                    value={newDoc.category}
                                    onChange={e => setNewDoc({...newDoc, category: e.target.value})}
                                >
                                    <option>Normativa Legal</option>
                                    <option>Protocolos MinEduc</option>
                                    <option>Rutas</option>
                                    <option>Formatos</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Título del Documento</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border rounded text-sm" 
                                    placeholder="Ej: Acuerdo Ministerial 2024..." 
                                    value={newDoc.title}
                                    onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm">
                                <UploadIcon className="h-4 w-4" />
                                {newDoc.file ? newDoc.file.name : 'Seleccionar Archivo'}
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                            <div className="flex-grow"></div>
                            <button type="button" onClick={() => setIsUploadOpen(false)} className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700">Guardar</button>
                        </div>
                    </form>
                )}

                {/* Document List */}
                <div className="flex-grow overflow-y-auto p-6 bg-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex justify-between items-center group">
                                <div className="flex items-start gap-3">
                                    <div className={`
                                        w-10 h-10 rounded flex items-center justify-center text-xs font-bold text-white shrink-0
                                        ${doc.type === 'PDF' ? 'bg-red-500' : doc.type === 'DOCX' ? 'bg-blue-600' : 'bg-green-600'}
                                    `}>
                                        {doc.type}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1">{doc.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{doc.category}</span>
                                            <span className="text-xs text-gray-400">{doc.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDownload(doc.title)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" 
                                    title="Descargar / Ver"
                                >
                                    <DownloadIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {filteredDocs.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <ArchiveBoxIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron documentos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProtocolRepository;
