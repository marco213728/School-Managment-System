cat << 'INNER_EOF' >> types.ts

export interface AbsenceRequest {
    id: string;
    institutionId: string;
    docenteTitularId: string;
    fecha: string;
    periodo: number;
    diaSemana: number;
    classId: string;
    subjectId: string;
    instrucciones: string;
    planificacionUrl?: string;
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
    docenteReemplazanteId?: string;
    creadoPorRol: string;
}
INNER_EOF
