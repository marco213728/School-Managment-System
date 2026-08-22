import React, { useState } from 'react';

// Locally defining types to match the form
export type TipoContrato = 'contrato' | 'definitivo' | 'provisional';
export type NivelAcademico = 'tercer_nivel' | 'cuarto_nivel' | 'phd';

interface FormularioCaracterizacionProps {
  initialData?: any;
  onGuardarDocente: (data: any) => void;
  onCancelar: () => void;
}

export const FormularioCaracterizacionDocente: React.FC<FormularioCaracterizacionProps> = ({ 
  initialData,
  onGuardarDocente, 
  onCancelar 
}) => {
  const [formData, setFormData] = useState({
    // --- 1. DATOS PERSONALES Y ADMINISTRATIVOS (Nómina de Planta Docente y Directivos) ---
    nombre: initialData?.nombre || initialData?.name || '',
    cedula: initialData?.cedula || '',
    fechaNacimiento: initialData?.fechaNacimiento || '',
    fechaIngresoMagisterio: initialData?.fechaIngresoMagisterio || '',
    fechaIngresoInstitucion: initialData?.fechaIngresoInstitucion || '',
    tipoContrato: (initialData?.tipoContrato || initialData?.relacionLaboral || 'contrato') as TipoContrato,
    funcion: initialData?.funcion || 'docente',
    categoriaEscalafon: initialData?.categoriaEscalafon || 'I',
    grupoEtnico: initialData?.grupoEtnico || '',

    // --- 2. FORMACIÓN ACADÉMICA Y ESPECIALIDAD (Ruta del Análisis de Datos) ---
    nivelEducacionMaximo: (initialData?.nivelEducacionMaximo || initialData?.nivelEducacion || 'tercer_nivel') as NivelAcademico,
    tituloProfesional: initialData?.tituloProfesional || '',
    especialidadAccionPersonal: initialData?.especialidadAccionPersonal || initialData?.especialidadRegistrada || '',
    especialidadRequeridaAula: initialData?.especialidadRequeridaAula || initialData?.especialidadRequerida || '',

    // --- 3. SALUD OCUPACIONAL, ACCESIBILIDAD Y BIENESTAR (Ruta de la Felicidad) ---
    enPeriodoLactancia: initialData?.enPeriodoLactancia || initialData?.esPeriodoLactancia || false,
    tieneLimitacionMovilidad: initialData?.tieneLimitacionMovilidad || false,
    detallesLimitacion: initialData?.detallesLimitacion || '',
    tienePermisoCuidadoFamiliar: initialData?.tienePermisoCuidadoFamiliar || initialData?.licenciasCuidadoFamiliar || false,

    // --- 4. PREFERENCIAS, CARGA Y DISPONIBILIDAD ---
    jornadaPreferencia: initialData?.jornadaPreferencia || 'matutina',
    maxLeccionesConsecutivas: initialData?.maxLeccionesConsecutivas || initialData?.maxClasesConsecutivas || 3,
    horasPreparacionClases: initialData?.horasPreparacionClases || initialData?.horasPlanificacion || 5,
    horasAtencionPadres: initialData?.horasAtencionPadres || 2,

    // --- 5. VALORES, LIDERAZGO Y ÉTICA DOCENTE (Ruta de la Calidad y Humanismo) ---
    compromisoTrabajoEquipo: initialData?.compromisoTrabajoEquipo ?? initialData?.disposicionCoPlanificacion ?? true,
    disposicionLiderazgoDistribuido: initialData?.disposicionLiderazgoDistribuido ?? initialData?.comisionesAdicionales ?? false,
    withitnessAceptacion: initialData?.withitnessAceptacion ?? initialData?.withitnessScore ?? 5,
  });

  const [errores, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    
    // Validación de Cédula (Ecuatoriana de 10 dígitos)
    if (!/^\d{10}$/.test(formData.cedula)) {
      nuevosErrores.cedula = 'La cédula debe contener exactamente 10 dígitos numéricos.';
    }

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre completo es requerido para el distributivo de trabajo.';
    }

    if (!formData.tituloProfesional.trim()) {
      nuevosErrores.tituloProfesional = 'Debe ingresar el título profesional registrado en la Senescyt.';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      setIsSubmitting(true);
      setErrors({});
      setSuccess(null);
      try {
        const res = await fetch('/api/v1/staff/validate-characterization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Error al validar la caracterización.');
        }

        setSuccess(data.message);
        setTimeout(() => {
          onGuardarDocente(data.auditedData);
        }, 1500);
      } catch (err: any) {
        setErrors({ general: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={manejarEnvio} className="max-w-4xl mx-auto p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-lg">
      <div className="border-b border-slate-300 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Caracterización de Talento Humano - Amauta</h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
          Ficha Única de Registro del Servidor Público (GETH / LOEI)
        </p>
      </div>

      {errores.general && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
          <strong>Error de Validación GETH:</strong> {errores.general}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-500 text-teal-800 rounded text-sm">
          <strong>¡Completado!</strong> {success}
        </div>
      )}

      {/* --- SECCIÓN 1: DATOS ADMINISTRATIVOS --- */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span>📋</span> 1. Información Administrativa y Relación Laboral
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
              placeholder="Ej. Argüello Morales Ana"
            />
            {errores.nombre && <span className="text-[10px] text-red-500 font-medium">{errores.nombre}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula de Identidad</label>
            <input 
              type="text" 
              name="cedula" 
              value={formData.cedula} 
              onChange={manejarCambio}
              maxLength={10}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
              placeholder="Ej. 1709485721"
            />
            {errores.cedula && <span className="text-[10px] text-red-500 font-medium">{errores.cedula}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Relación Laboral</label>
            <select 
              name="tipoContrato" 
              value={formData.tipoContrato} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500"
            >
              <option value="definitivo">Nombramiento Definitivo</option>
              <option value="provisional">Nombramiento Provisional</option>
              <option value="contrato">Contrato Ocasional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Función</label>
            <select 
              name="funcion" 
              value={formData.funcion} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500"
            >
              <option value="docente">Docente de Aula</option>
              <option value="directivo">Directivo / Gestión Académica</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría Escalafón</label>
            <select 
              name="categoriaEscalafon" 
              value={formData.categoriaEscalafon} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500"
            >
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(cat => (
                <option key={cat} value={cat}>Categoría {cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Nacimiento</label>
            <input 
              type="date" 
              name="fechaNacimiento" 
              value={formData.fechaNacimiento} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
            />
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: PERFIL ACADÉMICO --- */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span>🎓</span> 2. Perfil Académico y Especialización (Malla Curricular)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Máximo Nivel de Educación</label>
            <select 
              name="nivelEducacionMaximo" 
              value={formData.nivelEducacionMaximo} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500"
            >
              <option value="tercer_nivel">Tercer Nivel (Licenciatura o Ingeniería)</option>
              <option value="cuarto_nivel">Cuarto Nivel (Maestría / Especialización)</option>
              <option value="phd">Doctorado (PhD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Título Registrado</label>
            <input 
              type="text" 
              name="tituloProfesional" 
              value={formData.tituloProfesional} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
              placeholder="Ej. Licenciado en Ciencias de la Educación"
            />
            {errores.tituloProfesional && <span className="text-[10px] text-red-500 font-medium">{errores.tituloProfesional}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidad (Acción de Personal)</label>
            <input 
              type="text" 
              name="especialidadAccionPersonal" 
              value={formData.especialidadAccionPersonal} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
              placeholder="Especialidad formal en contrato de talento humano"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Asignación Requerida en Aula</label>
            <input 
              type="text" 
              name="especialidadRequeridaAula" 
              value={formData.especialidadRequeridaAula} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
              placeholder="Ej. Matemática Básica Superior o Ciencias Naturales"
            />
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 3: BIENESTAR Y SALUD --- */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span>❤️</span> 3. Salud Ocupacional, Maternidad y Accesibilidad (Ruta de la Felicidad)
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col md:flex-row gap-6 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                name="enPeriodoLactancia" 
                checked={formData.enPeriodoLactancia} 
                onChange={manejarCambio}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              ¿Periodo de Lactancia Activo?
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                name="tieneLimitacionMovilidad" 
                checked={formData.tieneLimitacionMovilidad} 
                onChange={manejarCambio}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              ¿Presenta Limitación de Movilidad Física?
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                name="tienePermisoCuidadoFamiliar" 
                checked={formData.tienePermisoCuidadoFamiliar} 
                onChange={manejarCambio}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              ¿Licencia de Cuidado Familiar/Discapacidad?
            </label>
          </div>

          {formData.tieneLimitacionMovilidad && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs">
              <span className="font-bold">Aviso del Sistema:</span> Al activar la limitación de movilidad, el motor de optimización asíncrono descartará de forma automática cualquier asignación a aulas en pisos superiores que no cuenten con ascensor.
              <textarea
                name="detallesLimitacion"
                value={formData.detallesLimitacion}
                onChange={manejarCambio}
                className="w-full mt-2 p-2 border border-amber-300 rounded bg-white text-slate-800"
                placeholder="Especifique detalles médicos o requerimientos físicos del docente..."
                rows={2}
              />
            </div>
          )}

          {formData.enPeriodoLactancia && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded text-xs font-medium">
              ✨ <span className="font-bold">Política GETH Integrada:</span> La carga máxima permitida para este docente se ha ajustado de forma automática a un límite de 20 horas de clase directa a la semana, reservando el tiempo restante para descanso de ley.
            </div>
          )}
        </div>
      </div>

      {/* --- SECCIÓN 4: PREFERENCIAS Y CARGA --- */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span>⚙️</span> 4. Carga Laboral Complementaria y Fatiga Docente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Bloques Consecutivos (Aulas)</label>
            <input 
              type="number" 
              name="maxLeccionesConsecutivas" 
              value={formData.maxLeccionesConsecutivas} 
              onChange={manejarCambio}
              min={1}
              max={5}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Horas Prep. Clases Semanal</label>
            <input 
              type="number" 
              name="horasPreparacionClases" 
              value={formData.horasPreparacionClases} 
              onChange={manejarCambio}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Horas Atención Padres Semanal</label>
            <input 
              type="number" 
              name="horasAtencionPadres" 
              value={formData.horasAtencionPadres} 
              onChange={manejarCambio}
              min={2}
              className="w-full text-sm p-2 border rounded bg-slate-50 border-slate-300 focus:outline-indigo-500" 
            />
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 5: VALORES Y LIDERAZGO --- */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-base font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span>🤝</span> 5. Convivencia, Ética Docente y Trabajo en Equipo (Ruta del Crecimiento)
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-700">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                name="compromisoTrabajoEquipo" 
                checked={formData.compromisoTrabajoEquipo} 
                onChange={manejarCambio}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              Compromiso de co-planificación y reuniones de área/trimestre
            </label>

            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                name="disposicionLiderazgoDistribuido" 
                checked={formData.disposicionLiderazgoDistribuido} 
                onChange={manejarCambio}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              Interés para asumir comisiones adicionales (Liderazgo Distribuido)
            </label>
          </div>

          <div className="mt-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Autoevaluación de Empatía, Organización y Manejo de Clases (Withitness)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => manejarCambio({ target: { name: 'withitnessAceptacion', value: star } } as any)}
                  className={`p-2 px-4 rounded text-xs font-bold transition-all ${
                    formData.withitnessAceptacion >= star 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {star} {star === 1 ? 'Bajo' : star === 5 ? 'Excelente' : ''}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Mide la capacidad de anticipar comportamientos, sintonizar con las emociones socioemocionales de los alumnos y forjar relaciones con respeto mutuo en el aula.
            </p>
          </div>
        </div>
      </div>

      {/* --- BOTONES --- */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button 
          type="button" 
          onClick={onCancelar}
          className="p-2 px-5 text-sm font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded transition"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="p-2 px-6 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-md transition"
        >
          Guardar Perfil Docente
        </button>
      </div>
    </form>
  );
};
