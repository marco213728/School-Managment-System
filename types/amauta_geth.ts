export type TipoActividadGETH = 'clase' | 'tutoria' | 'atencion_padres';

export interface DistributivoDocenteGETH {
  idDocente: string;
  nombre: string;
  enPeriodoLactancia: boolean;
  horasClaseDirecta: number;        // Ley: Max 22h para secundaria
  horasTutoriaAcompanamiento: number; // Horas complementarias presenciales
  horasAtencionPadres: number;        // Horas complementarias presenciales (Min 2h)
}

export interface ValidacionGETH {
  cumplePermanencia: boolean;
  totalHorasPresenciales: number;
  alertaLactancia: boolean;
  alertaAtencionPadres: boolean;
  mensajeSugerencia?: string;
}

/**
 * Evalúa las métricas de balance GETH de permanencia presencial (30h de ley)
 */
export const evaluarBalanceGETH = (docente: DistributivoDocenteGETH): ValidacionGETH => {
  const totalPresenciales = 
    docente.horasClaseDirecta + 
    docente.horasTutoriaAcompanamiento + 
    docente.horasAtencionPadres;

  const cumplePermanencia = totalPresenciales === 30; // 6h diarias continuas * 5 dias
  const alertaLactancia = docente.enPeriodoLactancia && docente.horasClaseDirecta > 20;
  const alertaAtencionPadres = docente.horasAtencionPadres < 2;

  let sugerencia = '';
  if (alertaLactancia) {
    sugerencia = `¡Ajuste de Ley GETH! Las docentes en periodo de lactancia deben tener un límite máximo de 20 horas de clase directa.`;
  } else if (alertaAtencionPadres) {
    sugerencia = `Alerta de acompañamiento: Se requiere reservar un mínimo de 2 horas semanales para atención a padres de familia.`;
  } else if (!cumplePermanencia) {
    sugerencia = `Inconsistencia de permanencia: El docente registra ${totalPresenciales}h presenciales de las 30h requeridas por ley.`;
  }

  return {
    cumplePermanencia,
    totalHorasPresenciales: totalPresenciales,
    alertaLactancia,
    alertaAtencionPadres,
    mensajeSugerencia: sugerencia || undefined
  };
};
