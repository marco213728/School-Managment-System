import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { MedicalVisit, Student, Institution } from '../../types';

interface MedicalVisitCertificateProps {
    visit: MedicalVisit;
    student: Student;
    healthProfessionalName: string;
}

const MedicalVisitCertificate: React.FC<MedicalVisitCertificateProps> = ({ visit, student, healthProfessionalName }) => {
    const { institution } = useContext(InstitutionContext);

    if (!institution) return null;

    return (
        <div className="bg-white p-8 font-serif text-gray-800">
            <header className="flex items-center justify-between border-b-2 border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}
                    <div>
                        <h1 className="text-xl font-bold uppercase">{institution.name}</h1>
                        <p className="text-sm">Departamento de Salud Escolar</p>
                    </div>
                </div>
                <div className="text-right text-sm">
                    <p>Fecha de Emisión: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
            </header>

            <main className="mt-8">
                <h2 className="text-center text-2xl font-bold mb-8">CERTIFICADO DE ATENCIÓN MÉDICA</h2>
                
                <section className="space-y-6 text-base">
                    <p>Por medio del presente, se certifica que el/la estudiante:</p>
                    
                    <div className="p-4 border rounded-md my-4 bg-gray-50">
                        <p><strong>Nombre del Estudiante:</strong> {student.name}</p>
                        <p><strong>Fecha de Atención:</strong> {new Date(visit.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Motivo de la Consulta:</strong> {visit.motive}</p>
                    </div>

                    <p>recibió atención en el departamento de salud de la institución. A continuación, se detalla el plan de tratamiento y las recomendaciones indicadas por el profesional de salud para ser compartidas con los padres o tutores:</p>
                    
                    <div className="mt-4 space-y-4">
                        <div>
                            <h3 className="font-bold text-lg mb-2 border-b">Plan Diagnóstico</h3>
                            <p className="pl-4">{visit.treatmentPlan.diagnostic || 'No especificado.'}</p>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg mb-2 border-b">Plan Terapéutico</h3>
                             <p className="pl-4">{visit.treatmentPlan.therapeutic || 'No especificado.'}</p>
                        </div>
                         <div>
                            <h3 className="font-bold text-lg mb-2 border-b">Plan Educacional y Recomendaciones</h3>
                             <p className="pl-4">{visit.treatmentPlan.educational || 'No especificado.'}</p>
                        </div>
                    </div>

                    {visit.isReferred && visit.referralDetails && (
                        <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                            <h3 className="font-bold text-yellow-800">Referencia a Centro Externo</h3>
                            <p className="text-yellow-700">{visit.referralDetails}</p>
                        </div>
                    )}

                </section>
                
                <footer className="mt-24">
                    <p className="text-sm">Este documento se emite para los fines que el interesado estime convenientes.</p>
                    <div className="mt-20 text-center text-sm">
                        <div className="inline-block pt-4 border-t-2 border-gray-400 w-64">
                            <p>Firma del Profesional</p>
                            <p className="font-semibold">{healthProfessionalName}</p>
                            <p className="text-xs text-gray-600">(Profesional de Salud)</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default MedicalVisitCertificate;