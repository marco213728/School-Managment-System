import React from 'react';
import { DistributivoDocenteGETH, evaluarBalanceGETH } from '../../types/amauta_geth';

interface GETHBalanceProps {
  docente: DistributivoDocenteGETH;
}

export const GETHBalanceCard: React.FC<GETHBalanceProps> = ({ docente }) => {
  const GETH = evaluarBalanceGETH(docente);

  // Porcentajes de barra apilada sobre la base de 30 horas presenciales
  const pctClase = (docente.horasClaseDirecta / 30) * 100;
  const pctTutoria = (docente.horasTutoriaAcompanamiento / 30) * 100;
  const pctPadres = (docente.horasAtencionPadres / 30) * 100;

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-bold text-gray-900">{docente.nombre}</h4>
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            GETH - Control de Permanencia Presencial
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold p-1 px-2.5 rounded-full ${
            GETH.cumplePermanencia ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {GETH.totalHorasPresenciales}h / 30h
          </span>
        </div>
      </div>

      {/* Barra de progreso GETH Apilada */}
      <div className="w-full bg-gray-100 rounded-full h-4 flex overflow-hidden mb-3">
        <div 
          style={{ width: `${pctClase}%` }} 
          className="bg-indigo-600 h-full" 
          title={`Clases Académicas: ${docente.horasClaseDirecta}h`}
        />
        <div 
          style={{ width: `${pctTutoria}%` }} 
          className="bg-teal-500 h-full" 
          title={`Tutorías/Refuerzo: ${docente.horasTutoriaAcompanamiento}h`}
        />
        <div 
          style={{ width: `${pctPadres}%` }} 
          className="bg-orange-400 h-full" 
          title={`Atención a Padres: ${docente.horasAtencionPadres}h`}
        />
      </div>

      {/* Leyenda y Datos de Desglose */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
          <span className="text-gray-600">Clases ({docente.horasClaseDirecta}h)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
          <span className="text-gray-600">Tutorías ({docente.horasTutoriaAcompanamiento}h)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-orange-400 rounded-full" />
          <span className="text-gray-600">Padres ({docente.horasAtencionPadres}h)</span>
        </div>
      </div>

      {/* Alertas dinámicas basadas en las políticas GETH y de Lactancia */}
      {GETH.mensajeSugerencia && (
        <div className={`p-3 rounded-lg text-xs flex gap-2 items-center ${
          GETH.alertaLactancia || GETH.totalHorasPresenciales > 30
            ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
            : 'bg-amber-50 text-amber-800 border-l-4 border-amber-500'
        }`}>
          <span>ℹ️</span>
          <p className="font-medium">{GETH.mensajeSugerencia}</p>
        </div>
      )}
    </div>
  );
};
