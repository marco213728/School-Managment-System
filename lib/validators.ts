import { Docente, AulaInfo } from '../types';

export interface ValidacionColision {
  valido: boolean;
  tipo: 'hard' | 'warning' | 'ok';
  mensaje?: string;
}

/**
 * Valida la accesibilidad física del aula respecto a las condiciones del docente.
 * Esta función es ideal para ejecutar en el evento 'onDragOver' o 'onDrop'.
 */
export const validarAccesibilidadDocenteEnAula = (
  docente: Docente,
  aula: AulaInfo
): ValidacionColision => {
  
  if (docente.tieneLimitacionMovilidad) {
    if (aula.piso > 1 && !aula.tieneAscensor) {
      return {
        valido: false,
        tipo: 'hard',
        mensaje: `¡Alerta de Infraestructura! El docente ${docente.nombre} tiene movilidad limitada y el aula ${aula.nombre} está en el Piso ${aula.piso} sin ascensor.`
      };
    }
  }

  // Validación de la Ruta de la Felicidad (Periodo de lactancia / Horas de Carga)
  if (docente.esPeriodoLactancia && docente.horasAsignadas >= 20) {
    return {
      valido: true,
      tipo: 'warning',
      mensaje: `Alerta GETH: ${docente.nombre} está en periodo de lactancia. Limite recomendado de 20h pedagógicas alcanzado.`
    };
  }

  return { valido: true, tipo: 'ok' };
};
