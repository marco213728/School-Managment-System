import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { ViccIntervention, Student } from '../../types';

interface ViccAgreementPrintProps {
    intervention: ViccIntervention;
    student: Student;
}

const ViccAgreementPrint: React.FC<ViccAgreementPrintProps> = ({ intervention, student }) => {
    const { institution } = useContext(InstitutionContext);

    const formattedAgreements = intervention.agreements
        ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br />');

    return (
        <div className="bg-white p-8 font-serif text-gray-800">
            <header className="flex items-center justify-between border-b-2 border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20" />}
                    <div>
                        <h1 className="text-xl font-bold uppercase">{institution?.name}</h1>
                        <p className="text-sm">Vicerrectorado</p>
                    </div>
                </div>
                <div className="text-right text-sm">
                    <p>Fecha: {new Date(intervention.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
            </header>

            <main className="mt-8">
                <h2 className="text-center text-2xl font-bold mb-8">ACTA DE ACUERDOS Y COMPROMISOS</h2>
                
                <section className="space-y-4 text-base">
                    <p>En la fecha indicada, se lleva a cabo una reunión de tipo <strong>{intervention.type}</strong>, con el fin de abordar temas relacionados con el rendimiento y apoyo académico/disciplinario del/la estudiante:</p>
                    
                    <div className="p-4 border rounded-md my-6">
                        <p><strong>Estudiante:</strong> {student.name}</p>
                        <p><strong>ID Estudiante:</strong> {student.id}</p>
                    </div>

                    <p>En esta reunión participan las siguientes personas:</p>
                    <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md">
                        {intervention.participants?.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>

                    <p className="pt-4">Tras el diálogo y análisis correspondiente, las partes involucradas llegan a los siguientes acuerdos y compromisos:</p>

                    <div 
                        className="p-4 border-l-4 border-gray-300 bg-gray-50 min-h-[150px]"
                        dangerouslySetInnerHTML={{ __html: formattedAgreements || 'No se establecieron acuerdos formales.' }}
                    >
                    </div>
                </section>
                
                <footer className="mt-20">
                    <p className="text-sm text-center">Para constancia de lo acordado, firman los presentes en señal de conformidad.</p>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-16 mt-16 text-center text-sm">
                        {intervention.participants?.map((participant, i) => (
                            <div key={i} className="pt-4 border-t border-gray-400">
                                <p>Firma</p>
                                <p className="font-semibold">{participant.split('(')[0].trim()}</p>
                                <p className="text-xs text-gray-600">{`(${participant.split('(')[1]?.replace(')','') || 'Participante'})`}</p>
                            </div>
                        ))}
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ViccAgreementPrint;