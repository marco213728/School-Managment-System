import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { Citacion, Student, User } from '../../types';
import { PrinterIcon, CloseIcon } from '../icons/Icons';

export interface PrintableCitacionProps {
    citacion: Citacion;
    studentName?: string;
    parentName?: string;
    staffName?: string;
    student?: Student;
    staff?: User;
    parent?: User;
    onClose?: () => void;
}

const PrintableCitacion: React.FC<PrintableCitacionProps> = ({ 
    citacion, 
    studentName, 
    parentName, 
    staffName,
    student,
    staff,
    parent,
    onClose 
}) => {
    const { institution } = useContext(InstitutionContext);
    
    if (!institution) return null;

    const resolvedStudentName = student?.name || studentName || 'Estudiante';
    const resolvedParentName = parent?.name || parentName || 'Representante Legal';
    const resolvedStaffName = staff?.name || staffName || 'Docente / Autoridad Institucional';

    const appointmentDate = new Date(citacion.date);
    const creationDate = new Date(citacion.creationDate);

    const content = (
        <div className="bg-white p-8 font-serif text-gray-800 max-w-3xl mx-auto border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0">
            <header className="flex items-start justify-between border-b-2 border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                    <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold uppercase">{institution.name}</h1>
                        <p className="text-sm">{institution.contact?.address || ''}</p>
                        <p className="text-sm">{institution.contact?.email || ''} {institution.contact?.phone ? `/ ${institution.contact.phone}` : ''}</p>
                    </div>
                </div>
                 <div className="text-right text-sm">
                    <p><strong>Fecha de Emisión:</strong> {creationDate.toLocaleDateString('es-ES')}</p>
                </div>
            </header>

            <main className="mt-8">
                <h2 className="text-center text-2xl font-bold mb-8">CITACIÓN OFICIAL A REPRESENTANTE LEGAL</h2>

                <section className="space-y-6 text-base leading-relaxed">
                    <p>Estimado/a Sr./Sra. <strong>{resolvedParentName}</strong>,</p>
                    <p>
                        Por medio de la presente, se le convoca a una reunión de carácter importante para tratar asuntos relacionados
                        con el proceso educativo de su representado/a, el/la estudiante <strong>{resolvedStudentName}</strong>.
                    </p>
                    
                    <div className="p-4 border-2 border-dashed rounded-md my-6 bg-gray-50">
                        <p><strong>Fecha de la Cita:</strong> {appointmentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Hora de la Cita:</strong> {appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Lugar:</strong> Oficinas de la institución.</p>
                    </div>

                    <p><strong>Motivo de la citación:</strong></p>
                    <p className="p-4 border bg-gray-50 rounded-md min-h-[80px]">{citacion.reason}</p>

                    <p className="pt-4">
                        Su presencia es de suma importancia para el seguimiento y apoyo conjunto en la formación del estudiante.
                        Agradecemos de antemano su puntual asistencia.
                    </p>
                </section>
                
                <footer className="mt-24">
                    <p>Atentamente,</p>
                    <div className="mt-20 text-left text-sm">
                        <div className="inline-block pt-4 border-t-2 border-gray-400 w-72">
                            <p>Firma</p>
                            <p className="font-semibold">{resolvedStaffName}</p>
                            <p className="text-xs text-gray-600">(Personal de la Institución)</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );

    if (onClose) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
                        <h3 className="text-sm font-bold text-slate-800">Vista de Impresión de Citación</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
                            >
                                <PrinterIcon className="h-4 w-4" />
                                Imprimir / Guardar PDF
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {content}
                    </div>
                </div>
            </div>
        );
    }

    return content;
};

export default PrintableCitacion;