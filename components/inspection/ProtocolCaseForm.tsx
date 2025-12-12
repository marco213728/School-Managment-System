
import React, { useState, useEffect } from 'react';
import { ProtocolCase, Student, User, ViolenceType, ProtocolScope, ProtocolSeverity } from '../../types';
import { CloseIcon, AlertTriangleIcon, CheckCircleIcon, ClipboardListIcon, PrinterIcon } from '../icons/Icons';
import PrintableFichaHechos from './PrintableFichaHechos';
import PrintableFichaDerivacion from './PrintableFichaDerivacion';

interface ProtocolCaseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProtocolCase) => void;
    caseToEdit: ProtocolCase | null;
    students: Student[];
    currentUser: User;
}

const ProtocolCaseForm: React.FC<ProtocolCaseFormProps> = ({ isOpen, onClose, onSave, caseToEdit, students, currentUser }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<ProtocolCase>>({
        violenceType: 'Física',
        scope: 'Entre Pares',
        severity: 'Conflicto Escolar',
        status: 'Detección',
        isSexualViolence: false,
        denunciaFiled: false,
        indicators: []
    });

    const [printingType, setPrintingType] = useState<'hechos' | 'derivacion' | null>(null);

    useEffect(() => {
        if (caseToEdit) {
            setFormData(caseToEdit);
        } else {
            setFormData({
                id: `prot-${Date.now()}`,
                institutionId: currentUser.institutionId,
                dateDetected: new Date().toISOString().split('T')[0],
                detectedBy: currentUser.id,
                detectionMethod: 'Observación',
                violenceType: 'Física',
                scope: 'Entre Pares',
                severity: 'Conflicto Escolar',
                status: 'Detección',
                isSexualViolence: false,
                denunciaFiled: false,
                indicators: [],
                description: '',
                actionsTaken: ''
            });
        }
    }, [caseToEdit, isOpen, currentUser]);

    // Logic: If sexual violence, force severity and block mediation
    useEffect(() => {
        if (formData.violenceType === 'Sexual') {
            setFormData(prev => ({ 
                ...prev, 
                isSexualViolence: true, 
                severity: 'Vulneración de Derechos/Delito' 
            }));
        } else {
            setFormData(prev => ({ ...prev, isSexualViolence: false }));
        }
    }, [formData.violenceType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleIndicatorToggle = (indicator: string) => {
        const current = formData.indicators || [];
        const updated = current.includes(indicator) ? current.filter(i => i !== indicator) : [...current, indicator];
        setFormData(prev => ({ ...prev, indicators: updated }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Auto-set deadline for crimes if not set
        let finalData = { ...formData };
        if (finalData.severity === 'Vulneración de Derechos/Delito' && !finalData.denunciaDeadline) {
             const deadline = new Date(finalData.dateDetected!);
             deadline.setHours(deadline.getHours() + 24);
             finalData.denunciaDeadline = deadline.toISOString();
        }

        onSave(finalData as ProtocolCase);
    };

    const indicatorsList = [
        "Marcas físicas (moretones, rasguños)",
        "Cambios bruscos de conducta",
        "Regresiones (enuresis, chuparse el dedo)",
        "Aislamiento o depresión",
        "Conducta sexualizada inadecuada",
        "Ausentismo injustificado",
        "Bajo rendimiento repentino",
        "Miedo a ir a casa o al colegio"
    ];

    if (!isOpen) return null;

    // Determine student data for printing
    const selectedStudent = students.find(s => s.id === formData.studentId);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                    {/* Header with Steps */}
                    <div className="bg-gray-50 p-4 border-b rounded-t-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Gestión de Caso: Protocolos de Violencia</h2>
                            <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                        </div>
                        <div className="flex justify-between items-center px-8">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`flex flex-col items-center ${step === s ? 'text-blue-600' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${step === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{s}</div>
                                    <span className="text-xs font-semibold uppercase">{s === 1 ? 'Detección' : s === 2 ? 'Clasificación' : 'Actuación'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow">
                        
                        {/* STEP 1: DETECTION */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-gray-700 border-b pb-2">1. Detección y Recepción</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estudiante Víctima</label>
                                    <select name="studentId" value={formData.studentId} onChange={handleChange} required className="w-full p-2 border rounded mt-1">
                                        <option value="">Seleccionar Estudiante...</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fecha Detección</label>
                                        <input type="date" name="dateDetected" value={formData.dateDetected} onChange={handleChange} required className="w-full p-2 border rounded mt-1"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Forma de Detección</label>
                                        <select name="detectionMethod" value={formData.detectionMethod} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                            <option>Observación Directa</option>
                                            <option>Relato del Estudiante</option>
                                            <option>Referencia de Tercero (Padre/Docente)</option>
                                            <option>Buzón D.E.C.E</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 border rounded-md">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Indicadores Identificados</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {indicatorsList.map(ind => (
                                            <label key={ind} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.indicators?.includes(ind)}
                                                    onChange={() => handleIndicatorToggle(ind)}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{ind}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Narración de los Hechos (Objetiva)</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className="w-full p-2 border rounded mt-1" placeholder="Describa lo sucedido sin juicios de valor..."></textarea>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: CLASSIFICATION */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-gray-700 border-b pb-2">2. Tipificación y Gravedad</h3>
                                
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">
                                    <strong>Nota:</strong> La correcta clasificación determina la ruta legal a seguir. La violencia sexual activa protocolos de máxima prioridad.
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo de Violencia</label>
                                        <select name="violenceType" value={formData.violenceType} onChange={handleChange} className="w-full p-2 border rounded mt-1 font-semibold">
                                            <option value="Física">Física</option>
                                            <option value="Psicológica">Psicológica</option>
                                            <option value="Sexual">Sexual</option>
                                            <option value="Negligencia">Negligencia</option>
                                            <option value="Ciberacoso">Ciberacoso</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ámbito</label>
                                        <select name="scope" value={formData.scope} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                            <option value="Intrafamiliar">Intrafamiliar</option>
                                            <option value="Institucional">Institucional</option>
                                            <option value="Entre Pares">Entre Pares</option>
                                            <option value="Género">Violencia de Género</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nivel de Gravedad</label>
                                    <select 
                                        name="severity" 
                                        value={formData.severity} 
                                        onChange={handleChange} 
                                        className={`w-full p-2 border rounded mt-1 ${formData.isSexualViolence ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        disabled={formData.isSexualViolence} // Locked for sexual violence
                                    >
                                        <option value="Conflicto Escolar">Conflicto Escolar (Leve/Mediación Posible)</option>
                                        <option value="Vulneración de Derechos/Delito">Vulneración de Derechos / Delito (Grave)</option>
                                    </select>
                                </div>

                                {formData.isSexualViolence && (
                                    <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-900 flex items-start gap-3 animate-pulse">
                                        <AlertTriangleIcon className="h-6 w-6 shrink-0" />
                                        <div>
                                            <h4 className="font-bold">ALERTA CRÍTICA: RUTA DE VIOLENCIA SEXUAL</h4>
                                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                                <li><strong>PROHIBIDA LA MEDIACIÓN</strong> o confrontación con el presunto agresor.</li>
                                                <li><strong>DENUNCIA OBLIGATORIA</strong> ante Fiscalía en menos de 24 horas.</li>
                                                <li>Se debe activar la red de salud inmediatamente.</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: ACTION */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <h3 className="font-bold text-lg text-gray-700 border-b pb-2">3. Intervención y Documentación</h3>

                                {formData.isSexualViolence || formData.severity === 'Vulneración de Derechos/Delito' ? (
                                    <div className="p-4 border rounded-md bg-red-50">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                name="denunciaFiled" 
                                                checked={formData.denunciaFiled}
                                                onChange={handleCheckbox}
                                                className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                                            />
                                            <span className="font-bold text-red-800">Se ha realizado la denuncia en Fiscalía / DINAPEN</span>
                                        </label>
                                        {!formData.denunciaFiled && <p className="text-xs text-red-600 mt-1 ml-8">Pendiente. Plazo máximo 24h desde detección.</p>}
                                    </div>
                                ) : (
                                    <div className="p-4 border rounded-md bg-green-50">
                                        <h4 className="font-bold text-green-800 flex items-center gap-2"><CheckCircleIcon className="h-4 w-4"/> Caso Mediable</h4>
                                        <p className="text-sm text-green-700 mt-1">Este caso permite procesos de mediación escolar y resolución pacífica de conflictos.</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Acciones Inmediatas Realizadas</label>
                                    <textarea name="actionsTaken" value={formData.actionsTaken} onChange={handleChange} rows={3} className="w-full p-2 border rounded mt-1" placeholder="Ej: Separación de estudiantes, llamada a padres, derivación a salud..."></textarea>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setPrintingType('hechos')} className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 text-sm">
                                        <ClipboardListIcon className="h-5 w-5 text-blue-500"/> Generar Ficha de Hechos (PDF)
                                    </button>
                                    <button type="button" onClick={() => setPrintingType('derivacion')} className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 text-sm">
                                        <ClipboardListIcon className="h-5 w-5 text-green-500"/> Generar Ficha de Derivación
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estado del Caso</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                        <option value="Detección">Detección</option>
                                        <option value="Intervención">Intervención</option>
                                        <option value="Derivación">Derivación Externa</option>
                                        <option value="Seguimiento">Seguimiento</option>
                                        <option value="Cerrado">Cerrado</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="p-4 border-t bg-gray-50 flex justify-between rounded-b-lg">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Anterior</button>
                        ) : (
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
                        )}

                        {step < 3 ? (
                            <button type="button" onClick={() => setStep(s => s + 1)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md">Siguiente</button>
                        ) : (
                            <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white font-bold rounded-md">Guardar Caso</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Printing Overlay */}
            {printingType && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
                    <div id="protocol-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">
                                Vista Previa: {printingType === 'hechos' ? 'Ficha de Hechos' : 'Ficha de Derivación'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingType(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir / PDF
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto bg-gray-100 p-4">
                            {printingType === 'hechos' ? (
                                <PrintableFichaHechos 
                                    caseData={formData}
                                    student={selectedStudent}
                                    reporter={currentUser}
                                />
                            ) : (
                                <PrintableFichaDerivacion 
                                    caseData={formData}
                                    student={selectedStudent}
                                    reporter={currentUser}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProtocolCaseForm;
