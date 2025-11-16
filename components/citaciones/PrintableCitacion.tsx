import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { Citacion } from '../../types';

interface PrintableCitacionProps {
    citacion: Citacion;
    studentName: string;
    parentName: string;
    staffName: string;
}

const PrintableCitacion: React.FC<PrintableCitacionProps> = ({ citacion, studentName, parentName, staffName }) => {
    const { institution } = useContext(InstitutionContext);
    
    if (!institution) return null;

    const appointmentDate = new Date(citacion.date);
    const creationDate = new Date(citacion.creationDate);

    return (
        <div className="bg-white p-8 font-serif text-gray-800">
            <header className="flex items-start justify-between border-b-2 border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                    <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold uppercase">{institution.name}</h1>
                        <p className="text-sm">{institution.contact.address}</p>
                        <p className="text-sm">{institution.contact.email} / {institution.contact.phone}</p>
                    </div>
                </div>
                 <div className="text-right text-sm">
                    <p><strong>Fecha de Emisión:</strong> {creationDate.toLocaleDateString('es-ES')}</p>
                </div>
            </header>

            <main className="mt-8">
                <h2 className="text-center text-2xl font-bold mb-8">CITACIÓN OFICIAL A REPRESENTANTE LEGAL</h2>

                <section className="space-y-6 text-base leading-relaxed">
                    <p>Estimado/a Sr./Sra. <strong>{parentName}</strong>,</p>
                    <p>
                        Por medio de la presente, se le convoca a una reunión de carácter importante para tratar asuntos relacionados
                        con el proceso educativo de su representado/a, el/la estudiante <strong>{studentName}</strong>.
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
                            <p className="font-semibold">{staffName}</p>
                            <p className="text-xs text-gray-600">(Personal de la Institución)</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PrintableCitacion;