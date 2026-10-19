/**
 * ATTENDANCE NOVEDADES ENGINE
 * Implements the exact formulas of the Dirección Metropolitana de Talento Humano
 * for attendance audit, lunch tracking, and shift anomaly detection.
 */

export interface PunchInfo {
    time: string;
    origin?: string; // 'WEB' | 'BIOMETRICO' | 'FACIAL' | 'MOVIL'
    method?: string;
    type?: string;
    photoProof?: string;
    facialConfidence?: number;
    facialMatch?: boolean;
    flagReason?: string;
    distanceFromInstitution?: number;
}

export interface DayAttendanceAudit {
    fecha: string;
    diaSemana: string;
    esLaborable: boolean;
    laborableLabel: 'Laborable' | 'No laborable';
    
    // Employee details
    userId: string;
    userName: string;
    userRole: string;
    cedula: string;
    grupoOcupacional: string;
    tipoFuncionario: 'FD' | 'OTROS'; // Funcionario Directivo vs Otros
    
    // The 4 Punches & Origins
    marcacion1: string; // Entrada
    origen1: string;
    marcacion2: string; // Salida Almuerzo
    origen2: string;
    marcacion3: string; // Entrada Almuerzo
    origen3: string;
    marcacion4: string; // Salida Jornada
    origen4: string;
    
    // Scheduled parameters
    horaEntradaDefinida: string; // e.g. "07:00"
    horaSalidaDefinida: string;  // e.g. "15:30"
    tiempoAlmuerzoAutorizado: string; // e.g. "00:30:00"
    tiempoAlmuerzoAutorizadoMinutos: number;
    
    // Calculated Formulas
    tiempoAlmuerzoTomado: string; // U9
    tiempoAlmuerzoTomadoMinutos?: number;
    
    novedadesEntrada: string; // W9 ("SIN NOVEDAD", "NO REGISTRA ENTRADA", "00:15:00" atraso, etc.)
    novedadesAlmuerzo: string; // X9 ("DENTRO DE TIEMPO DE ALMUERZO", "NO REGISTRA...", exceso, etc.)
    novedadesSalida: string; // Salida ("SIN NOVEDAD", "NO REGISTRA SALIDA", anticipada, etc.)
    tiempoFueraJornada: string; // Horas suplementarias / extra
    marcacionesConsistentes: 'CONSISTENTES' | 'INCONSISTENTES';
    novedadesDia: 'DIA SIN NOVEDAD' | 'DIA CON NOVEDAD' | 'NO APLICA JORNADA LABORAL';
    
    // Biometric & Geofence Flags
    hasBiometricIssue: boolean;
    hasGeofenceIssue: boolean;
    punches: PunchInfo[];
}

/**
 * Parses time strings in 12h (AM/PM) or 24h formats to minutes from midnight
 * Examples: "06:50:00 AM" -> 410, "1:29:00 PM" -> 809, "15:30" -> 930
 */
export const parseTimeToMinutes = (timeStr?: string | null): number | null => {
    if (!timeStr) return null;
    const clean = timeStr.trim();
    if (!clean || clean === '0' || clean === 'N/A' || clean === '-') return null;

    // Check for AM/PM format
    const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const minutes = parseInt(ampmMatch[2], 10);
        const seconds = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
        const modifier = ampmMatch[4]?.toUpperCase();

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes + (seconds / 60);
    }

    return null;
};

/**
 * Converts minutes to HH:MM:SS format
 */
export const formatMinutesToHHMMSS = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) totalMinutes = 0;
    const h = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const m = Math.floor(remainingMinutes);
    const s = Math.round((remainingMinutes - m) * 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/**
 * Determines if a given date string (YYYY-MM-DD) is a working day
 */
export const isWorkingDay = (dateStr: string, holidays: string[] = []): boolean => {
    if (holidays.includes(dateStr)) return false;
    // Note: append T12:00:00 to avoid timezone shift
    const date = new Date(dateStr + 'T12:00:00');
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    return day !== 0 && day !== 6;
};

/**
 * Gets day of week name in Spanish and English
 */
export const getDayOfWeekNames = (dateStr: string): { es: string; en: string } => {
    const date = new Date(dateStr + 'T12:00:00');
    const daysEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
        es: daysEs[date.getDay()],
        en: daysEn[date.getDay()]
    };
};

/**
 * Evaluates the full official audit formula for a staff member on a specific day
 */
export const calculateDayAudit = (params: {
    date: string;
    punches: PunchInfo[];
    user: {
        id: string;
        name: string;
        role: string;
        cedula?: string;
        grupoOcupacional?: string;
        tipoFuncionario?: 'FD' | 'OTROS';
        allowedLunchMinutes?: number;
        workSchedule?: Record<string, { startTime: string; endTime: string }>;
    };
    holidays?: string[];
}): DayAttendanceAudit => {
    const { date, punches, user, holidays = [] } = params;

    const dayInfo = getDayOfWeekNames(date);
    const esLaborable = isWorkingDay(date, holidays);
    const laborableLabel: 'Laborable' | 'No laborable' = esLaborable ? 'Laborable' : 'No laborable';

    // Staff Characterization
    const grupoOcupacional = user.grupoOcupacional || (user.role.includes('Profesor') ? 'DOCENTE CATEGORIA E' : 'ADMINISTRATIVO');
    const isFD = user.tipoFuncionario === 'FD' || user.role === 'Rector' || user.role === 'Vicerrector' || user.role === 'Inspector General';
    const tipoFuncionario: 'FD' | 'OTROS' = isFD ? 'FD' : (user.tipoFuncionario || 'OTROS');

    // Extract punches 1 to 4:
    // P1: Entrada ('in')
    // P2: Salida Almuerzo ('out_break' or 2nd punch)
    // P3: Entrada Almuerzo ('in_break' or 3rd punch)
    // P4: Salida Jornada ('out' or 4th punch)
    const p1 = punches.find(p => p.type === 'in') || punches[0];
    const p2 = punches.find(p => p.type === 'out_break') || (punches.length >= 2 ? punches[1] : undefined);
    const p3 = punches.find(p => p.type === 'in_break') || (punches.length >= 3 ? punches[2] : undefined);
    const p4 = punches.find(p => p.type === 'out') || (punches.length >= 4 ? punches[3] : undefined);

    const m1Str = p1?.time || '';
    const m2Str = p2?.time || '';
    const m3Str = p3?.time || '';
    const m4Str = p4?.time || '';

    const orig1 = p1?.origin || (p1?.method === 'Facial' ? 'FACIAL' : p1?.method ? 'WEB' : '');
    const orig2 = p2?.origin || (p2?.method === 'Facial' ? 'FACIAL' : p2?.method ? 'WEB' : '');
    const orig3 = p3?.origin || (p3?.method === 'Facial' ? 'FACIAL' : p3?.method ? 'WEB' : '');
    const orig4 = p4?.origin || (p4?.method === 'Facial' ? 'FACIAL' : p4?.method ? 'WEB' : '');

    // Convert to minutes for mathematical calculations
    const E = parseTimeToMinutes(m1Str); // Marcación 1
    const G = parseTimeToMinutes(m2Str); // Marcación 2
    const I = parseTimeToMinutes(m3Str); // Marcación 3
    const K = parseTimeToMinutes(m4Str); // Marcación 4

    // Defined Schedule (Q & R)
    const daySchedule = user.workSchedule?.[dayInfo.es] || user.workSchedule?.[dayInfo.en];
    const horaEntradaDefinida = daySchedule?.startTime || '07:00';
    const horaSalidaDefinida = daySchedule?.endTime || '15:30';

    const S = parseTimeToMinutes(horaEntradaDefinida) || (7 * 60); // 420 mins (07:00)
    const T = parseTimeToMinutes(horaSalidaDefinida) || (15 * 60 + 30); // 930 mins (15:30)

    // Allowed lunch (V)
    const allowedLunchMins = user.allowedLunchMinutes ?? 30; // 30 mins default
    const tiempoAlmuerzoAutorizado = formatMinutesToHHMMSS(allowedLunchMins);

    // ==========================================
    // 1. TIEMPO DE ALMUERZO TOMADO (Fórmula U9)
    // =IF(AND(G9=0,I9=0),"NO REGISTRA SALIDA Y ENTRADA DE ALMUERZO",
    //  IF(G9=0,"NO REGISTRA SALIDA DE ALMUERZO",
    //  IF(I9=0,"NO REGISTRA ENTRADA DEL AMUERZO",
    //  IF(G9=I9,"NO TOMA MINUTOS DE ALMUERZO",
    //  IF(G9>I9,"MAL TIMBRADO",I9-G9)))))
    // ==========================================
    let tiempoAlmuerzoTomado = '';
    let tiempoAlmuerzoTomadoMinutos: number | undefined = undefined;

    if (G === null && I === null) {
        tiempoAlmuerzoTomado = 'NO REGISTRA SALIDA Y ENTRADA DE ALMUERZO';
    } else if (G === null) {
        tiempoAlmuerzoTomado = 'NO REGISTRA SALIDA DE ALMUERZO';
    } else if (I === null) {
        tiempoAlmuerzoTomado = 'NO REGISTRA ENTRADA DEL AMUERZO';
    } else if (G === I) {
        tiempoAlmuerzoTomado = 'NO TOMA MINUTOS DE ALMUERZO';
        tiempoAlmuerzoTomadoMinutos = 0;
    } else if (G > I) {
        tiempoAlmuerzoTomado = 'MAL TIMBRADO';
    } else {
        tiempoAlmuerzoTomadoMinutos = I - G;
        tiempoAlmuerzoTomado = formatMinutesToHHMMSS(tiempoAlmuerzoTomadoMinutos);
    }

    // ==========================================
    // 2. NOVEDADES ENTRADA JORNADA LABORAL (Fórmula W9)
    // =IF(P9="No Laborable","NO APLICA JORNADA LABORAL",
    //  IF(N9="FD",
    //    IF(MIN(E9,I9)=0,"NO REGISTRA ENTRADA",
    //    IF((MAX(K9,G9)-MIN(E9,I9))<8.5/24,"JORNADA FD INCOMPLETA","SIN NOVEDAD")),
    //  IF(E9=0,"NO REGISTRA ENTRADA",
    //  IF(E9="NO SE MARCA EN ESTE DIA","NO SE MARCA EN ESTE DIA",
    //  IF(E9<=S9,"SIN NOVEDAD",E9-S9)))))
    // ==========================================
    let novedadesEntrada = '';

    if (!esLaborable) {
        novedadesEntrada = 'NO APLICA JORNADA LABORAL';
    } else if (tipoFuncionario === 'FD') {
        const validStart = [E, I].filter((v): v is number => v !== null);
        const validEnd = [K, G].filter((v): v is number => v !== null);

        if (validStart.length === 0) {
            novedadesEntrada = 'NO REGISTRA ENTRADA';
        } else {
            const minStart = Math.min(...validStart);
            const maxEnd = validEnd.length > 0 ? Math.max(...validEnd) : minStart;
            const fdDuration = maxEnd - minStart;
            // 8.5 hours = 510 minutes
            if (fdDuration < (8.5 * 60)) {
                novedadesEntrada = 'JORNADA FD INCOMPLETA';
            } else {
                novedadesEntrada = 'SIN NOVEDAD';
            }
        }
    } else {
        if (E === null) {
            novedadesEntrada = 'NO REGISTRA ENTRADA';
        } else if (E <= S) {
            novedadesEntrada = 'SIN NOVEDAD';
        } else {
            // Late: E - S in HH:MM:SS
            const atrasoMins = E - S;
            novedadesEntrada = formatMinutesToHHMMSS(atrasoMins);
        }
    }

    // ==========================================
    // 3. NOVEDADES ALMUERZO (Fórmula X9)
    // =IF(P9="No Laborable","NO APLICA JORNADA LABORAL",
    //  IF(N9="FD","DENTRO DE TIEMPO DE ALMUERZO",
    //  IF((R9-Q9)<(6.5/24),"DENTRO DE TIEMPO DE ALMUERZO",
    //  IF(AND(G9=0,I9=0),"NO REGISTRA SALIDA Y ENTRADA DE ALMUERZO",
    //  IF(G9=0,"NO REGISTRA SALIDA DE ALMUERZO",
    //  IF(I9=0,"NO REGISTRA ENTRADA DEL AMUERZO",
    //  IF(G9=I9,"NO TOMA MINUTOS DE ALMUERZO",
    //  IF(U9<VALUE("00:30:59"),"DENTRO DE TIEMPO DE ALMUERZO",
    //  IF(U9="MAL TIMBRADO","MAL TIMBRADO",U9-V9)))))))))
    // ==========================================
    let novedadesAlmuerzo = '';

    if (!esLaborable) {
        novedadesAlmuerzo = 'NO APLICA JORNADA LABORAL';
    } else if (tipoFuncionario === 'FD') {
        novedadesAlmuerzo = 'DENTRO DE TIEMPO DE ALMUERZO';
    } else if ((T - S) < (6.5 * 60)) {
        // Less than 6.5 hours shift
        novedadesAlmuerzo = 'DENTRO DE TIEMPO DE ALMUERZO';
    } else if (G === null && I === null) {
        novedadesAlmuerzo = 'NO REGISTRA SALIDA Y ENTRADA DE ALMUERZO';
    } else if (G === null) {
        novedadesAlmuerzo = 'NO REGISTRA SALIDA DE ALMUERZO';
    } else if (I === null) {
        novedadesAlmuerzo = 'NO REGISTRA ENTRADA DEL AMUERZO';
    } else if (G === I) {
        novedadesAlmuerzo = 'NO TOMA MINUTOS DE ALMUERZO';
    } else if (tiempoAlmuerzoTomado === 'MAL TIMBRADO') {
        novedadesAlmuerzo = 'MAL TIMBRADO';
    } else if (tiempoAlmuerzoTomadoMinutos !== undefined) {
        // Excel formula allows up to 30:59 mins or user allowed lunch time
        const toleranceMins = allowedLunchMins + (59 / 60);
        if (tiempoAlmuerzoTomadoMinutos <= toleranceMins) {
            novedadesAlmuerzo = 'DENTRO DE TIEMPO DE ALMUERZO';
        } else {
            // Exceeded lunch: U9 - V9 in HH:MM:SS
            const excesoMins = tiempoAlmuerzoTomadoMinutos - allowedLunchMins;
            novedadesAlmuerzo = formatMinutesToHHMMSS(excesoMins);
        }
    } else {
        novedadesAlmuerzo = tiempoAlmuerzoTomado;
    }

    // ==========================================
    // 4. NOVEDADES SALIDA (Fórmula Salida)
    // =IF(P9="No Laborable","NO APLICA JORNADA LABORAL",
    //  IF(N9="FD",
    //    IF(MAX(K9,G9)=0,"NO REGISTRA SALIDA",
    //    IF((MAX(K9,G9)-MIN(E9,I9))<8.5/24,"JORNADA FD INCOMPLETA","SIN NOVEDAD")),
    //  IF(K9=0,"NO REGISTRA SALIDA",
    //  IF(K9>=T9,"SIN NOVEDAD",T9-K9))))
    // ==========================================
    let novedadesSalida = '';

    if (!esLaborable) {
        novedadesSalida = 'NO APLICA JORNADA LABORAL';
    } else if (tipoFuncionario === 'FD') {
        const validStart = [E, I].filter((v): v is number => v !== null);
        const validEnd = [K, G].filter((v): v is number => v !== null);

        if (validEnd.length === 0) {
            novedadesSalida = 'NO REGISTRA SALIDA';
        } else {
            const minStart = validStart.length > 0 ? Math.min(...validStart) : (7 * 60);
            const maxEnd = Math.max(...validEnd);
            const fdDuration = maxEnd - minStart;
            if (fdDuration < (8.5 * 60)) {
                novedadesSalida = 'JORNADA FD INCOMPLETA';
            } else {
                novedadesSalida = 'SIN NOVEDAD';
            }
        }
    } else {
        if (K === null) {
            novedadesSalida = 'NO REGISTRA SALIDA';
        } else if (K >= T) {
            novedadesSalida = 'SIN NOVEDAD';
        } else {
            // Early departure: T - K in HH:MM:SS
            const salidaAnticipadaMins = T - K;
            novedadesSalida = formatMinutesToHHMMSS(salidaAnticipadaMins);
        }
    }

    // ==========================================
    // 5. TIEMPO FUERA DE LA JORNADA
    // =IF(P9="No Laborable","NO APLICA JORNADA LABORAL",
    //  IF(N9="FD",
    //    IF((MAX(K9,G9)-MIN(E9,I9))<8.5/24,"JORNADA FD INCOMPLETA","FD NO APLICA TIEMPO FUERA DE LA JORNADA LABORAL"),
    //  IF(K9=0,"NO REGISTRA SALIDA",
    //  IF(K9<=T9,"NO TIENE TIEMPO FUERA DE LA JORNADA",K9-T9))))
    // ==========================================
    let tiempoFueraJornada = '';

    if (!esLaborable) {
        tiempoFueraJornada = 'NO APLICA JORNADA LABORAL';
    } else if (tipoFuncionario === 'FD') {
        const validStart = [E, I].filter((v): v is number => v !== null);
        const validEnd = [K, G].filter((v): v is number => v !== null);
        const minStart = validStart.length > 0 ? Math.min(...validStart) : (7 * 60);
        const maxEnd = validEnd.length > 0 ? Math.max(...validEnd) : (15 * 60 + 30);
        const fdDuration = maxEnd - minStart;

        if (fdDuration < (8.5 * 60)) {
            tiempoFueraJornada = 'JORNADA FD INCOMPLETA';
        } else {
            tiempoFueraJornada = 'FD NO APLICA TIEMPO FUERA DE LA JORNADA LABORAL';
        }
    } else {
        if (K === null) {
            tiempoFueraJornada = 'NO REGISTRA SALIDA';
        } else if (K <= T) {
            tiempoFueraJornada = 'NO TIENE TIEMPO FUERA DE LA JORNADA';
        } else {
            // Extra time: K - T
            const extraMins = K - T;
            tiempoFueraJornada = formatMinutesToHHMMSS(extraMins);
        }
    }

    // ==========================================
    // 6. MARCACIONES CONSISTENTES
    // =IF(OR(
    //   AND(LEN(E)>0, LEN(G)>0, E>G),
    //   AND(LEN(E)>0, LEN(I)>0, E>I),
    //   AND(LEN(G)>0, LEN(K)>0, G>K),
    //   AND(LEN(I)>0, LEN(K)>0, I>K),
    //   AND(LEN(G)>0, LEN(I)>0, G>I)
    // ), "INCONSISTENTES", "CONSISTENTES")
    // ==========================================
    let marcacionesConsistentes: 'CONSISTENTES' | 'INCONSISTENTES' = 'CONSISTENTES';

    const hasInconsistency = (
        (E !== null && G !== null && E > G) ||
        (E !== null && I !== null && E > I) ||
        (G !== null && K !== null && G > K) ||
        (I !== null && K !== null && I > K) ||
        (G !== null && I !== null && G > I)
    );

    if (hasInconsistency) {
        marcacionesConsistentes = 'INCONSISTENTES';
    }

    // ==========================================
    // 7. NOVEDADES DIA
    // =IF(P9="No Laborable","NO APLICA JORNADA LABORAL",
    //   (IF(AND(
    //      EXACT(TRIM(W9),"SIN NOVEDAD"),
    //      EXACT(TRIM(X9),"DENTRO DE TIEMPO DE ALMUERZO"),
    //      EXACT(TRIM(Y9),"SIN NOVEDAD")
    //    ),"DIA SIN NOVEDAD","DIA CON NOVEDAD")))
    // ==========================================
    let novedadesDia: 'DIA SIN NOVEDAD' | 'DIA CON NOVEDAD' | 'NO APLICA JORNADA LABORAL' = 'DIA CON NOVEDAD';

    if (!esLaborable) {
        novedadesDia = 'NO APLICA JORNADA LABORAL';
    } else {
        const isEntradaOk = novedadesEntrada.trim() === 'SIN NOVEDAD';
        const isAlmuerzoOk = novedadesAlmuerzo.trim() === 'DENTRO DE TIEMPO DE ALMUERZO';
        const isSalidaOk = novedadesSalida.trim() === 'SIN NOVEDAD';

        if (isEntradaOk && isAlmuerzoOk && isSalidaOk) {
            novedadesDia = 'DIA SIN NOVEDAD';
        } else {
            novedadesDia = 'DIA CON NOVEDAD';
        }
    }

    // Biometric & Geofence issues
    const hasBiometricIssue = punches.some(p => p.facialMatch === false || (p.facialConfidence !== undefined && p.facialConfidence < 60));
    const hasGeofenceIssue = punches.some(p => (p.distanceFromInstitution || 0) > 100);

    return {
        fecha: date,
        diaSemana: dayInfo.en,
        esLaborable,
        laborableLabel,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        cedula: user.cedula || 'N/A',
        grupoOcupacional,
        tipoFuncionario,
        marcacion1: m1Str,
        origen1: orig1,
        marcacion2: m2Str,
        origen2: orig2,
        marcacion3: m3Str,
        origen3: orig3,
        marcacion4: m4Str,
        origen4: orig4,
        horaEntradaDefinida,
        horaSalidaDefinida,
        tiempoAlmuerzoAutorizado,
        tiempoAlmuerzoAutorizadoMinutos: allowedLunchMins,
        tiempoAlmuerzoTomado,
        tiempoAlmuerzoTomadoMinutos,
        novedadesEntrada,
        novedadesAlmuerzo,
        novedadesSalida,
        tiempoFueraJornada,
        marcacionesConsistentes,
        novedadesDia,
        hasBiometricIssue,
        hasGeofenceIssue,
        punches
    };
};
