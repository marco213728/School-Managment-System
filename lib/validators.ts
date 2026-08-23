import { Docente, AulaInfo, ParaleloInfo } from '../types';

export interface ValidacionColision {
  valido: boolean;
  tipo: 'hard' | 'warning' | 'ok';
  mensaje?: string;
}

/**
 * Valida si un paralelo es físicamente apto para ocupar un aula según su mobiliario.
 */
export const validarMobiliarioExclusivoAula = (
  paralelo: ParaleloInfo,
  aula: AulaInfo
): ValidacionColision => {
  
  if (aula.gradoExclusivo) {
    // Si el aula está reservada para un grado y el paralelo es de otro grado diferente
    if (aula.gradoExclusivo !== paralelo.gradoCurso) {
      return {
        valido: false,
        tipo: 'hard',
        mensaje: `¡BLOQUEO DE INFRAESTRUCTURA! El aula ${aula.nombre} está restringida exclusivamente para "${aula.gradoExclusivo}" debido a que cuenta con mueblería adaptada para estudiantes pequeños. No puede ser compartida con "${paralelo.gradoCurso} '${paralelo.letra}'".`
      };
    }
  }

  return { valido: true, tipo: 'ok' };
};

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
