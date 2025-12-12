
import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { ProtocolCase, Student, User } from '../../types';

interface PrintableFichaHechosProps {
    caseData: Partial<ProtocolCase>;
    student: Student | undefined;
    reporter: User;
}

const PrintableFichaHechos: React.FC<PrintableFichaHechosProps> = ({ caseData, student, reporter }) => {
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
                    <p><strong>Fecha de Impresión:</strong> {date.toLocaleDateString()}</p>
                    <p><strong>Código de Caso:</strong> {caseData.id}</p>
                </div>
            </header>

            <h2 className="text-center text-xl font-bold mb-6 bg-gray-200 py-1 border border-black uppercase">Ficha de Registro de Hechos</h2>

            {/* 1. Datos Institucionales */}
            <div className="mb-4">
                <h3 className="font-bold border-b border-black mb-2">1. DATOS INSTITUCIONALES</h3>
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Institución Educativa:</strong> {institution?.name}</p>
                    <p><strong>AMIE:</strong> {institution?.codeAMIE || 'N/A'}</p>
                    <p><strong>Distrito:</strong> N/A</p>
                    <p><strong>Zona:</strong> N/A</p>
                </div>
            </div>

            {/* 2. Datos del Estudiante */}
            <div className="mb-4">
                <h3 className="font-bold border-b border-black mb-2">2. DATOS DE IDENTIFICACIÓN DEL ESTUDIANTE</h3>
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Nombres y Apellidos:</strong> {student?.name}</p>
                    <p><strong>Cédula:</strong> {student?.nationalId || 'N/A'}</p>
                    <p><strong>Grado/Curso:</strong> {student?.grade || 'N/A'}</p>
                    <p><strong>Edad:</strong> {student?.birthDate ? new Date().getFullYear() - new Date(student.birthDate).getFullYear() : 'N/A'} años</p>
                </div>
            </div>

            {/* 3. Datos de la Situación */}
            <div className="mb-4">
                <h3 className="font-bold border-b border-black mb-2">3. DATOS DE LA SITUACIÓN DETECTADA</h3>
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Fecha de Detección:</strong> {caseData.dateDetected}</p>
                    <p><strong>Forma de Detección:</strong> {caseData.detectionMethod}</p>
                    <p><strong>Tipo de Violencia Presunta:</strong> {caseData.violenceType}</p>
                    <p><strong>Ámbito:</strong> {caseData.scope}</p>
                </div>
                <div className="mt-2">
                    <p><strong>Indicadores Observados:</strong> {caseData.indicators?.join(', ') || 'Ninguno'}</p>
                </div>
            </div>

            {/* 4. Narración de los Hechos */}
            <div className="mb-6">
                <h3 className="font-bold border-b border-black mb-2">4. NARRACIÓN DE LOS HECHOS</h3>
                <p className="text-xs italic text-gray-600 mb-2">(Describa lo sucedido de manera objetiva, sin juicios de valor. Transcriba textualmente si es un relato verbal).</p>
                <div className="border border-gray-400 p-4 min-h-[200px] whitespace-pre-wrap bg-gray-50 text-justify">
                    {caseData.description}
                </div>
            </div>

             {/* 5. Acciones Realizadas */}
             <div className="mb-6">
                <h3 className="font-bold border-b border-black mb-2">5. ACCIONES INMEDIATAS REALIZADAS</h3>
                <div className="border border-gray-400 p-4 min-h-[100px] whitespace-pre-wrap bg-gray-50 text-justify">
                    {caseData.actionsTaken || 'No registradas en este momento.'}
                </div>
            </div>

            {/* Firmas */}
            <div className="mt-20 grid grid-cols-2 gap-20 text-center">
                <div>
                    <div className="border-t border-black w-full pt-2">
                        <p className="font-bold">{reporter.name}</p>
                        <p className="text-xs uppercase">{reporter.role}</p>
                        <p className="text-xs">Persona que Reporta</p>
                    </div>
                </div>
                <div>
                    <div className="border-t border-black w-full pt-2">
                        <p className="font-bold">DECE / RECTORADO</p>
                        <p className="text-xs">Recepción del Caso</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] text-gray-500 mt-10">Este documento es confidencial y de uso exclusivo institucional conforme al Código de la Niñez y Adolescencia.</p>
        </div>
    );
};

export default PrintableFichaHechos;
