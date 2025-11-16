import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { ExitPass } from '../../types';

interface PrintableExitPassProps {
    pass: ExitPass;
    studentName: string;
    inspectorName: string;
}

const PrintableExitPass: React.FC<PrintableExitPassProps> = ({ pass, studentName, inspectorName }) => {
    const { institution } = useContext(InstitutionContext);

    if (!institution) return null;
    
    const dateTime = new Date(pass.date);

    return (
        <div className="bg-white p-8 font-serif text-gray-800">
            <header className="flex items-center justify-between border-b-2 border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                    <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold uppercase">{institution.name}</h1>
                        <p className="text-sm">Inspección General</p>
                    </div>
                </div>
            </header>

            <main className="mt-8">
                <h2 className="text-center text-2xl font-bold mb-8">PASE DE SALIDA</h2>
                
                <div className="text-right mb-8">
                    <p><strong>Fecha:</strong> {dateTime.toLocaleDateString('es-ES')}</p>
                    <p><strong>Hora:</strong> {dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <section className="space-y-6 text-base leading-relaxed">
                    <p>Por medio de la presente, se autoriza la salida del/la estudiante:</p>
                    <p className="text-center font-bold text-lg my-4">{studentName}</p>
                    
                    <p><strong>Motivo de la Salida:</strong></p>
                    <p className="p-4 border bg-gray-50 rounded-md min-h-[60px]">{pass.reason}</p>
                    
                    <p>El/la estudiante es retirado/a por la siguiente persona:</p>
                    <div className="p-4 border bg-gray-50 rounded-md">
                        <p><strong>Nombre:</strong> {pass.responsibleName}</p>
                        <p><strong>Cédula/ID:</strong> {pass.responsibleId}</p>
                    </div>

                    <p className="text-sm italic mt-6">
                        Este documento certifica que la salida del estudiante ha sido registrada y autorizada por la Inspección General de la institución. El padre/madre/tutor ha sido notificado automáticamente.
                    </p>
                </section>
                
                <footer className="mt-24 grid grid-cols-2 gap-8">
                    <div className="text-center text-sm">
                        <div className="inline-block pt-4 border-t-2 border-gray-400 w-64">
                            <p>Firma de la Persona que Retira</p>
                            <p className="font-semibold">{pass.responsibleName}</p>
                        </div>
                    </div>
                     <div className="text-center text-sm">
                        <div className="inline-block pt-4 border-t-2 border-gray-400 w-64">
                            <p>Firma de Autorización</p>
                            <p className="font-semibold">{inspectorName}</p>
                            <p className="text-xs text-gray-600">(Inspección General)</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PrintableExitPass;