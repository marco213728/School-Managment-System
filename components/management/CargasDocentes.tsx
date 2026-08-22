import React from 'react';
import { Docente } from '../../types';

interface CargasDocentesProps {
  docentes: Docente[];
  onSeleccionarDocente: (docente: Docente) => void;
}

export const CargasDocentes: React.FC<CargasDocentesProps> = ({ docentes, onSeleccionarDocente }) => {
  
  const obtenerClaseAlerta = (horas: number): { bg: string; texto: string; descripcion: string } => {
    if (horas >= 24 && horas <= 25) {
      return { 
        bg: 'bg-[#8B5A2B]/20 border-[#8B5A2B]', 
        texto: 'text-[#8B5A2B]', 
        descripcion: 'Carga Horaria Completa (Miel)' 
      };
    } else if (horas >= 21 && horas <= 23) {
      return { 
        bg: 'bg-yellow-100 border-yellow-500', 
        texto: 'text-yellow-800', 
        descripcion: 'Alerta: Carga Incompleta (Amarillo)' 
      };
    } else {
      return { 
        bg: 'bg-red-100 border-red-500', 
        texto: 'text-red-700', 
        descripcion: 'Alerta Crítica: Subcarga (Rojo)' 
      };
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Control de Carga Horaria y Distributivo Docente
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Monitoreo de horas asignadas sobre la malla curricular de clase directa (Máx 25 horas).
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docentes.map((docente) => {
          const alerta = obtenerClaseAlerta(docente.horasAsignadas);
          return (
            <div 
              key={docente.id}
              onClick={() => onSeleccionarDocente(docente)}
              className={`p-4 border-l-4 rounded cursor-pointer transition-all hover:scale-[1.01] ${alerta.bg}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{docente.nombre}</h3>
                  <p className="text-xs text-gray-500">C.I: {docente.cedula} | {docente.especialidad}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${alerta.texto}`}>
                    {docente.horasAsignadas} / {docente.horasMaximas}h
                  </span>
                  <p className="text-[10px] font-medium uppercase mt-1">{alerta.descripcion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
