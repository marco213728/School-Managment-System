import React, { useState } from 'react';

// =====================================================================
// DEFINICIONES DE TIPOS DE DATOS (TypeScript)
// =====================================================================

export type RolInstitucional = 'docente' | 'directivo' | 'administrativo' | 'medico' | 'psicologo' | 'apoyo';
export type EducacionNivel = 'tercer_nivel' | 'cuarto_nivel' | 'phd';

export interface ColaboradorGETH {
  nombre: string;
  cedula: string;
  rol: RolInstitucional;
  nivelEducacion: EducacionNivel;
  titulo: string;
  especialidadAccionPersonal: string;
  especialidadRequeridaAula: string;
  enPeriodoLactancia: boolean;
  tieneLimitacionMovilidad: boolean;
  horasClaseDirecta: number;         // Clase directa en aula
  horasTutoria: number;              // Tutoría y acompañamiento
  horasAtencionPadres: number;       // Reunión de seguimiento con representantes
}

export interface ValidacionResultado {
  esValido: boolean;
  horasTotales: number;
  alertaLactancia: boolean;
  alertaAtencionPadres: boolean;
  mensaje?: string;
}

// =====================================================================
// COMPONENTE FORMULARIO DE CARACTERIZACIÓN DOCENTE Y ADMINISTRATIVO
// =====================================================================

export const AmautaGETHForm: React.FC = () => {
  const [formData, setFormData] = useState<ColaboradorGETH>({
    nombre: '',
    cedula: '',
    rol: 'docente',
    nivelEducacion: 'tercer_nivel',
    titulo: '',
    especialidadAccionPersonal: '',
    especialidadRequeridaAula: '',
    enPeriodoLactancia: false,
    tieneLimitacionMovilidad: false,
    horasClaseDirecta: 0,
    horasTutoria: 0,
    horasAtencionPadres: 0,
  });

  const [notificacion, setNotificacion] = useState<{ tipo: string; msj: string } | null>(null);

  // Validador de Permanencia Escolar (30 Horas de Ley)
  const evaluarPermanenciaGETH = (data: ColaboradorGETH): ValidacionResultado => {
    const totalPresencial = data.horasClaseDirecta + data.horasTutoria + data.horasAtencionPadres;
    const esValido = totalPresencial === 30; // 30h de permanencia escolar por ley
    const alertaLactancia = data.enPeriodoLactancia && data.horasClaseDirecta > 20;
    const alertaAtencionPadres = data.horasAtencionPadres < 2;

    let mensaje = '';
    if (alertaLactancia) {
      mensaje = '¡Violación Normativa! Un docente en periodo de lactancia no puede superar las 20 horas semanales de clase directa.';
    } else if (alertaAtencionPadres && data.rol === 'docente') {
      mensaje = 'Advertencia GETH: Se debe estipular un mínimo de 2 horas semanales para la atención a padres de familia.';
    } else if (totalPresencial !== 30 && (data.rol === 'docente' || data.rol === 'directivo')) {
      mensaje = `Error de Distribución: La carga actual es de ${totalPresencial}h. Debe completar exactamente 30 horas presenciales de permanencia institucional.`;
    }

    return {
      esValido: esValido && !alertaLactancia,
      horasTotales: totalPresencial,
      alertaLactancia,
      alertaAtencionPadres,
      mensaje: mensaje || undefined,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluacion = evaluarPermanenciaGETH(formData);

    if (!evaluacion.esValido) {
      setNotificacion({ tipo: 'error', msj: evaluacion.mensaje || 'Distribución de carga incorrecta.' });
    } else {
      setNotificacion({ 
        tipo: 'success', 
        msj: `Ficha registrada con éxito. Colaborador caracterizado adecuadamente con ${evaluacion.horasTotales}h presenciales estructuradas.` 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Caracterización de Talento Humano — Amauta</h2>
        <p className="text-sm text-gray-500">Módulo GETH Unificado para Personal Docente, Médico, Administrativo y DECE</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fila 1: Datos Personales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Nombre Completo</label>
            <input type="text" name="nombre" required value={formData.nombre} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Cédula de Identidad</label>
            <input type="text" name="cedula" required value={formData.cedula} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Rol / Dependencia</label>
            <select name="rol" value={formData.rol} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
              <option value="docente">Docente de Aula</option>
              <option value="directivo">Directivo Escolar</option>
              <option value="administrativo">Personal Administrativo (PAS)</option>
              <option value="medico">Personal Médico (Salud)</option>
              <option value="psicologo">Psicólogo / Analista DECE</option>
              <option value="apoyo">Personal de Apoyo</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Especialidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Especialidad en Acción de Personal</label>
            <input type="text" name="especialidadAccionPersonal" required value={formData.especialidadAccionPersonal} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Especialidad Requerida en Aula</label>
            <input type="text" name="especialidadRequeridaAula" required value={formData.especialidadRequeridaAula} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        {/* Fila 3: Salud Ocupacional & Maternidad */}
        <div className="flex gap-8">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="enPeriodoLactancia" checked={formData.enPeriodoLactancia} onChange={handleInputChange} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
            Docente en Lactancia Activa
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="tieneLimitacionMovilidad" checked={formData.tieneLimitacionMovilidad} onChange={handleInputChange} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
            Tiene Limitación de Movilidad Física
          </label>
        </div>

        {/* Fila 4: Permanencia Presencial */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Carga Laboral de Permanencia (Suma Obligatoria: 30h Semanales)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Horas Clase Directa</label>
              <input type="number" name="horasClaseDirecta" value={formData.horasClaseDirecta} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Horas Tutoría/Acompañamiento</label>
              <input type="number" name="horasTutoria" value={formData.horasTutoria} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Horas Atención a Padres</label>
              <input type="number" name="horasAtencionPadres" value={formData.horasAtencionPadres} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {notificacion && (
          <div className={`p-4 rounded-xl text-sm ${notificacion.tipo === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-800 border-l-4 border-green-500'}`}>
            {notificacion.msj}
          </div>
        )}

        {/* Botón de Envío */}
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
          Guardar y Registrar Caracterización del Colaborador
        </button>
      </form>
    </div>
  );
};

export default AmautaGETHForm;
