
import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { ProtocolCase, Student, User } from '../../types';

interface PrintableFichaDerivacionProps {
    caseData: Partial<ProtocolCase>;
    student: Student | undefined;
    reporter: User;
}

const PrintableFichaDerivacion: React.FC<PrintableFichaDerivacionProps> = ({ caseData, student, reporter }) => {
    const { institution } = useContext(InstitutionContext);
    const date = new Date();

    return (
        <div className="bg-white p-10 font-serif text-gray-900 text-sm max-w-[21cm] mx-auto leading-relaxed">
            {/* Header */}
            <header className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-4">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}
                    <div>
                        <h1 className="text-lg font-bold uppercase">Ministerio de Educación</h1>
                        <h2 className="text-md font-semibold uppercase">{institution?.name}</h2>
                        <p className="text-xs">Departamento de Consejería Estudiantil (DECE)</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p><strong>Fecha:</strong> {date.toLocaleDateString()}</p>
                    <p><strong>Oficio N°:</strong> {`DER-${caseData.id?.slice(-6)}-${date.getFullYear()}`}</p>
                </div>
            </header>

            <h2 className="text-center text-xl font-bold mb-6 bg-gray-200 py-1 border border-black uppercase">Ficha de Derivación Externa</h2>

            {/* Destinatario */}
            <div className="mb-6 border p-4 bg-gray-50">
                <p className="mb-2"><strong>A:</strong> __________________________________________________________________</p>
                <p className="text-xs text-gray-600 mb-4">(Institución Receptora: Fiscalía, Centro de Salud, UDAI, Junta de Protección, etc.)</p>
                
                <p className="mb-2"><strong>DE:</strong> {institution?.name} (DECE/Rectorado)</p>
            </div>

            {/* Datos del Estudiante */}
            <div className="mb-6">
                <h3 className="font-bold bg-gray-100 p-1 mb-2 border border-gray-300">1. DATOS DEL ESTUDIANTE DERIVADO</h3>
                <table className="w-full border-collapse border border-gray-400 text-sm">
                    <tbody>
                        <tr>
                            <td className="border border-gray-400 p-2 font-bold w-1/3">Nombres y Apellidos:</td>
                            <td className="border border-gray-400 p-2">{student?.name}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 p-2 font-bold">Fecha de Nacimiento:</td>
                            <td className="border border-gray-400 p-2">{student?.birthDate || 'N/A'}</td>
                        </tr>
                         <tr>
                            <td className="border border-gray-400 p-2 font-bold">Grado / Curso:</td>
                            <td className="border border-gray-400 p-2">{student?.grade || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-400 p-2 font-bold">Dirección Domiciliaria:</td>
                            <td className="border border-gray-400 p-2">{student?.address || 'N/A'}</td>
                        </tr>
                         <tr>
                            <td className="border border-gray-400 p-2 font-bold">Teléfono de Contacto:</td>
                            <td className="border border-gray-400 p-2">{student?.phone || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Motivo de Derivación */}
            <div className="mb-6">
                <h3 className="font-bold bg-gray-100 p-1 mb-2 border border-gray-300">2. MOTIVO DE LA DERIVACIÓN</h3>
                <div className="p-2 border border-gray-400 min-h-[100px]">
                    <p><strong>Tipo de Situación:</strong> {caseData.violenceType} - {caseData.severity}</p>
                    <p className="mt-2"><strong>Resumen del Caso:</strong></p>
                    <p className="mt-1 text-justify">{caseData.description}</p>
                </div>
            </div>

             {/* Acciones Previas */}
            <div className="mb-6">
                <h3 className="font-bold bg-gray-100 p-1 mb-2 border border-gray-300">3. ACCIONES REALIZADAS POR LA INSTITUCIÓN</h3>
                <div className="p-2 border border-gray-400 min-h-[80px]">
                    <p>{caseData.actionsTaken || 'Se adjunta informe técnico detallado.'}</p>
                </div>
            </div>
            
            <p className="text-justify mb-8">
                Solicitamos a su institución la atención pertinente al caso expuesto, conforme a sus competencias legales, para garantizar la protección y restitución de derechos del/la estudiante.
            </p>

            {/* Firmas */}
            <div className="mt-16 grid grid-cols-2 gap-20 text-center">
                <div>
                    <div className="border-t border-black w-full pt-2">
                        <p className="font-bold">PROFESIONAL DECE</p>
                        <p className="text-xs">{reporter.name}</p>
                    </div>
                </div>
                <div>
                    <div className="border-t border-black w-full pt-2">
                        <p className="font-bold">RECTOR/A</p>
                        <p className="text-xs">Firma y Sello</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 border-t-2 border-dashed border-gray-400 pt-4">
                <p className="text-center font-bold mb-4">RECIBIDO POR (INSTITUCIÓN RECEPTORA)</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <p>Nombre: ________________________</p>
                    <p>Fecha: ________________________</p>
                    <p>Cargo: _________________________</p>
                    <p>Sello: _________________________</p>
                </div>
            </div>
        </div>
    );
};

export default PrintableFichaDerivacion;
