
import { User, Role, Institution, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, ViccInterventionType, AttendanceRecord, AttendanceStatus, ExitPass, Citacion, CitacionStatus, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, FormalRequest, TrainingPlan, InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation, CronogramaEvent, SubjectLevel, GradeLevel, AreaOfKnowledge, CurricularInsertion, Competency, SubjectReport, ResourceRepositoryItem, Shift, ProtocolCase, TrainingSession, JuntaDeCurso, OcrSubmission, OcrSubmissionStatus, OvpActivity, OvpAxis, DisciplinaryAction, DisciplinarySeverity, InspectionVisit, QualityMetric, ActivityType, EvaluationCategory, CurricularPlanStatus, ClassroomVisit, Intervention, InterventionType } from './types';

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin Institución', email: 'admin@school.com', role: Role.InstitutionAdmin, institutionId: 'uemol', password: 'password' },
    { id: 'u2', name: 'Prof. Juan Pérez', email: 'juan.perez@school.com', role: Role.Teacher, institutionId: 'uemol', password: 'password', maxMonthlyHours: 160 },
    { id: 'u3', name: 'Prof. Maria Lopez', email: 'maria.lopez@school.com', role: Role.Teacher, institutionId: 'uemol', password: 'password', maxMonthlyHours: 160 },
    { id: 'u4', name: 'Estudiante 1', email: 'est1@school.com', role: Role.Student, institutionId: 'uemol', password: 'password', classIds: ['c1'] },
    { id: 'u5', name: 'Padre 1', email: 'parent1@school.com', role: Role.Parent, institutionId: 'uemol', password: 'password', childIds: ['s1'] },
    { id: 'u6', name: 'Inspector General', email: 'inspector@school.com', role: Role.InspectorGeneral, institutionId: 'uemol', password: 'password' },
    { id: 'u7', name: 'Vicerrector', email: 'vicerrector@school.com', role: Role.Vicerrector, institutionId: 'uemol', password: 'password' },
    { id: 'u8', name: 'Psic. Ana Vela', email: 'dece@school.com', role: Role.JefeDECE, institutionId: 'uemol', password: 'password' },
    { id: 'u9', name: 'Dr. Marco Polo', email: 'medico@school.com', role: Role.HealthProfessional, institutionId: 'uemol', password: 'password' },
];

export const MOCK_INSTITUTIONS: Institution[] = [
    {
        id: 'uemol',
        name: 'Unidad Educativa Municipal Oswaldo Lombeyda',
        logoUrl: 'https://placehold.co/150x150/2563eb/ffffff?text=UEMOL',
        contact: { phone: '02-123-4567', email: 'info@uemol.edu.ec', address: 'Quito, Ecuador' },
        geofenceConfig: { latitude: -0.180653, longitude: -78.467834, radius: 200 },
        activeModules: { dece: true, health: true },
        academicYear: { startDate: '2024-09-01', endDate: '2025-06-30' }
    }
];

export const MOCK_CLASSES: Class[] = [
    { id: 'c1', institutionId: 'uemol', name: '10mo EGB A', studentIds: ['s1', 's2', 's3'], timetableId: 'tt1' },
    { id: 'c2', institutionId: 'uemol', name: '8vo EGB B', studentIds: ['s4', 's5'], timetableId: 'tt1' }
];

export const MOCK_STUDENTS: Student[] = [
    { id: 's1', institutionId: 'uemol', name: 'Carlos Andrade', parentId: 'u5', classId: 'c1', listNumber: 1, nationalId: '1712345678', birthDate: '2010-05-15', gender: 'Masculino', address: 'Av. Amazonas y Colón', phone: '0991234567' },
    { id: 's2', institutionId: 'uemol', name: 'Ana Torres', parentId: 'u5', classId: 'c1', listNumber: 2 },
    { id: 's3', institutionId: 'uemol', name: 'Luis Gomez', parentId: 'u5', classId: 'c1', listNumber: 3 },
    { id: 's4', institutionId: 'uemol', name: 'Elena Diaz', parentId: 'u5', classId: 'c2', listNumber: 1 },
    { id: 's5', institutionId: 'uemol', name: 'Pedro Ruiz', parentId: 'u5', classId: 'c2', listNumber: 2 },
];

export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [
    { day: 'Lunes', timeSlotId: 'ts1', classId: 'c1', subjectId: 'sub1', roomId: 'r1' },
    { day: 'Lunes', timeSlotId: 'ts2', classId: 'c1', subjectId: 'sub2', roomId: 'r2' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', institutionId: 'uemol', userId: 'u2', title: 'Reunión de Personal', message: 'Viernes 3PM en sala de profesores.', date: '2024-10-25T10:00:00Z', read: false }
];

export const MOCK_SUPPORT_CONTACTS: SupportContact[] = [
    { id: 'sc1', institutionId: 'uemol', name: 'Hospital Eugenio Espejo', type: 'Centro de Salud', phone: '02-250-0000', address: 'Gran Colombia' }
];

export const MOCK_HEALTH_RECORDS: HealthRecord[] = [
    { id: 'hr1', institutionId: 'uemol', studentId: 's1', allergies: ['Penicilina'], conditions: ['Asma'], emergencyContact: { name: 'Juan Andrade', phone: '0999999999', relation: 'Padre' }, medications: [], lastCheckup: '2024-01-15' }
];

export const MOCK_MEDICAL_VISITS: MedicalVisit[] = [
    {
        id: 'mv1', institutionId: 'uemol', studentId: 's1', healthProfessionalId: 'u9', date: '2024-03-10', motive: 'Dolor estomacal',
        vitalSigns: { temperature: '37.5', pulse: '80', respiratoryRate: '20', bloodPressure: '110/70' },
        anthropometry: { weight: '45', height: '150', imc: '20' },
        diagnoses: [{ code: 'R10', description: 'Dolor abdominal', type: 'PRE' }],
        treatmentPlan: { diagnostic: 'Observación', therapeutic: 'Paracetamol', educational: 'Dieta blanda' },
        isReferred: false
    }
];

export const MOCK_SUBJECTS: Subject[] = [
    { id: 'sub1', institutionId: 'uemol', name: 'Matemáticas', teacherId: 'u2', areaOfKnowledge: 'Matemática', level: 'EGB Superior', maxWeeklyHours: 5 },
    { id: 'sub2', institutionId: 'uemol', name: 'Lengua y Literatura', teacherId: 'u3', areaOfKnowledge: 'Lengua y Literatura', level: 'EGB Superior', maxWeeklyHours: 5 }
];

export const MOCK_TIME_SLOTS: TimeSlot[] = [
    { id: 'ts1', institutionId: 'uemol', timetableId: 'tt1', startTime: '07:00', endTime: '07:40', isBreak: false, shift: Shift.Morning },
    { id: 'ts2', institutionId: 'uemol', timetableId: 'tt1', startTime: '07:40', endTime: '08:20', isBreak: false, shift: Shift.Morning },
    { id: 'ts3', institutionId: 'uemol', timetableId: 'tt1', startTime: '08:20', endTime: '08:50', isBreak: true, shift: Shift.Morning }, // Break
];

export const MOCK_ROOMS: Room[] = [
    { id: 'r1', institutionId: 'uemol', name: 'Aula 101' },
    { id: 'r2', institutionId: 'uemol', name: 'Laboratorio Química' }
];

export const MOCK_TIMETABLES: Timetable[] = [
    { id: 'tt1', institutionId: 'uemol', name: 'Matutina EGB', shift: Shift.Morning }
];

export const MOCK_VICC_INTERVENTIONS: ViccIntervention[] = [];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'att1', institutionId: 'uemol', studentId: 's1', date: new Date().toISOString().split('T')[0], timeSlot: '07:00-07:40', status: AttendanceStatus.Present },
    { id: 'att2', institutionId: 'uemol', studentId: 's2', date: new Date().toISOString().split('T')[0], timeSlot: '07:00-07:40', status: AttendanceStatus.Absent },
];

export const MOCK_EXIT_PASSES: ExitPass[] = [];

export const MOCK_CITACIONES: Citacion[] = [];

export const MOCK_ACADEMIC_CALENDAR_EVENTS: AcademicCalendarEvent[] = [
    { id: 'ace1', institutionId: 'uemol', name: 'Navidad', startDate: '2024-12-25', endDate: '2024-12-25' }
];

export const MOCK_LECCIONARIO_ENTRIES: LeccionarioEntry[] = [];

export const MOCK_MICRO_PLANS: MicroPlan[] = [
    {
        id: 'mp1', institutionId: 'uemol', teacherId: 'u2', classId: 'c1', subjectId: 'sub1', academicYear: '2024-2025',
        unitTitle: 'Algebra Básica', unitObjectives: 'Comprender conceptos básicos.', dcdIds: ['dcd1'],
        duaRepresentation: 'Videos explicativos', duaActionExpression: 'Ejercicios prácticos', duaEngagement: 'Juegos matemáticos',
        methodology: 'Aprendizaje Basado en Problemas', resources: 'Libro texto, pizarra', evaluation: 'Prueba escrita',
        adaptations: [], status: CurricularPlanStatus.Approved, creationDate: '2024-09-01'
    }
];

export const MOCK_DCDS: Dcd[] = [
    { id: 'dcd1', institutionId: 'uemol', subjectId: 'sub1', code: 'M.4.1.1', description: 'Reconocer los elementos del conjunto de números enteros...', gradeLevel: 'EGB Superior', criterionId: 'ce1', competencies: ['Matemática'], curricularInsertions: [] }
];

export const MOCK_EVALUATION_CRITERIA: EvaluationCriterion[] = [
    { id: 'ce1', institutionId: 'uemol', subjectId: 'sub1', code: 'CE.M.4.1', description: 'Emplea las relaciones de orden...', gradeLevel: 'EGB Superior' }
];

export const MOCK_EVALUATION_INDICATORS: EvaluationIndicator[] = [
    { id: 'ie1', institutionId: 'uemol', criterionId: 'ce1', code: 'I.M.4.1.1', description: 'Ejemplifica situaciones reales...' }
];

export const MOCK_GRADEBOOKS: Gradebook[] = [
    {
        id: 'gb1', institutionId: 'uemol', classId: 'c1', subjectId: 'sub1',
        records: [
            {
                studentId: 's1',
                trimester1: { actividades: [], portafolio: { promedio: 8 }, evaluacionSumativa: { promedio: 9 }, proyectoIntegrador: { promedio: 10 }, promedioFormativas: 8.5, sumaTrimestre: 8.8 },
                trimester2: { actividades: [], portafolio: { promedio: 0 }, evaluacionSumativa: { promedio: 0 }, proyectoIntegrador: { promedio: 0 }, promedioFormativas: 0, sumaTrimestre: 0 },
                trimester3: { actividades: [], portafolio: { promedio: 0 }, evaluacionSumativa: { promedio: 0 }, proyectoIntegrador: { promedio: 0 }, promedioFormativas: 0, sumaTrimestre: 0 },
                mejorasUtilizadas: 0, promedioTrimestralFinal: 8.8, notaAnual90: 7.92, proyectoFinal10: { promedio: 0 }, notaFinal100: 7.92, observacionFinal: 'Aprobado'
            }
        ]
    }
];

export const MOCK_ACTIVITIES: Activity[] = [
    { id: 'act1', institutionId: 'uemol', classId: 'c1', subjectId: 'sub1', teacherId: 'u2', title: 'Deber Ecuaciones', description: 'Resolver pág 20', type: ActivityType.Homework, deliveryDate: '2024-10-30', trimester: 1, evaluationCategory: 'ACTIVIDAD_INDIVIDUAL' }
];

export const MOCK_REINFORCEMENT_PLANS: ReinforcementPlan[] = [];

export const MOCK_STAFF_ATTENDANCE: StaffAttendanceRecord[] = [];

export const MOCK_FORMAL_REQUESTS: FormalRequest[] = [];

export const MOCK_TRAINING_PLANS: TrainingPlan[] = [];

export const MOCK_INSTITUTIONAL_DOCUMENTS: InstitutionalDocument[] = [];

export const MOCK_MEETING_RECORDS: MeetingRecord[] = [];

export const MOCK_RUBRICS: Rubric[] = [
    {
        id: 'rub1', institutionId: 'uemol', title: 'Rúbrica General', description: 'Rúbrica estándar', scaleType: 'Quantitative',
        levels: [{ id: 'l1', rubricId: 'rub1', label: 'Excelente', value: 10, order: 4 }],
        criteria: [{ id: 'cr1', rubricId: 'rub1', description: 'Comprensión', weight: 50 }],
        descriptors: []
    }
];

export const MOCK_CONFLICT_MEDIATIONS: ConflictMediation[] = [];

export const MOCK_CRONOGRAMA_EVENTS: CronogramaEvent[] = [];

export const GRADE_LEVELS: GradeLevel[] = ['EGB Elemental', 'EGB Media', 'EGB Superior', 'Bachillerato'];
export const COMPETENCIES: Competency[] = ['Comunicacional', 'Matemática', 'Digital', 'Socioemocional'];
export const CURRICULAR_INSERTIONS: CurricularInsertion[] = ['Educación Financiera', 'Desarrollo Sostenible', 'Ciudadanía Digital'];
export const SUBJECT_LEVELS: SubjectLevel[] = ['EGB Elemental', 'EGB Media', 'EGB Superior', 'Bachillerato', 'Todos'];
export const AREAS_OF_KNOWLEDGE: AreaOfKnowledge[] = ['Matemática', 'Lengua y Literatura', 'Ciencias Naturales', 'Ciencias Sociales', 'ECA', 'Educación Física', 'Inglés', 'Interdisciplinar'];
export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const MOCK_DISCIPLINARY_ACTIONS: DisciplinaryAction[] = [];
export const MOCK_INSPECTION_VISITS: InspectionVisit[] = [];
export const MOCK_QUALITY_METRICS: QualityMetric[] = [];

export const OBLIGACIONES_ESTUDIANTILES = {
    'a': 'Asistir regularmente a clases y cumplir con las tareas escolares.',
    'b': 'Participar en la evaluación de manera honesta.',
};

export const REGIMEN_DISCIPLINARIO = {
    'a': 'Faltas leves.',
    'b': 'Faltas graves.',
};

export const ATTENDANCE_OBSERVATIONS = {
    1: 'Falta Injustificada',
    2: 'Atraso',
    3: 'Fuga'
};

export const DEFAULT_RUBRIC_CRITERIA = [
    { id: 'crit1', category: 'Planificación', description: 'El docente presenta planificación microcurricular...' },
    { id: 'crit2', category: 'Clima de Aula', description: 'Se mantiene un ambiente de respeto...' }
];

export const MOCK_SHIFTS = [Shift.Morning, Shift.Afternoon, Shift.Night];

export const MOCK_PROTOCOL_CASES: ProtocolCase[] = [];
export const MOCK_TRAINING_SESSIONS: TrainingSession[] = [];
export const MOCK_JUNTAS: JuntaDeCurso[] = [];
export const MOCK_OCR_SUBMISSIONS: OcrSubmission[] = [];

export const MOCK_OVP_ACTIVITIES: OvpActivity[] = [];

export const MOCK_REPOSITORY_ITEMS: ResourceRepositoryItem[] = [
    {
        id: 'res1',
        institutionId: 'uemol',
        authorId: 'teacher1',
        title: 'La Tienda Matemática (Juego de Roles)',
        description: 'Actividad práctica para reforzar operaciones básicas con números enteros en un contexto real.',
        level: 'EGB Superior',
        gradeLevel: 'EGB Superior',
        type: 'Activity',
        areaOfKnowledge: 'Matemática',
        coverImageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=800',
        dcdIds: ['dcd-m-1'], 
        curricularInsertions: ['Educación Financiera'],
        competencies: ['Matemática', 'Socioemocional'],
        duaRepresentation: 'Uso de billetes didácticos y lista de precios visual.',
        duaActionExpression: 'Los estudiantes pueden calcular mentalmente, usar papel o calculadora. Deben verbalizar la transacción.',
        duaEngagement: 'Gamificación: Simulación de compra-venta competitiva.',
        rubricId: 'rub1', 
        shared: true,
        creationDate: '2024-09-10T10:00:00Z',
        attachments: [
            { id: 'att1', name: 'Billetes Imprimibles.pdf', url: '#', type: 'document' },
            { id: 'att2', name: 'Lista de Precios.docx', url: '#', type: 'document' }
        ]
    }
];

export const MOCK_SUBJECT_REPORTS: SubjectReport[] = [];

export const EVALUATION_CATEGORIES: Record<EvaluationCategory, string> = {
    'ACTIVIDAD_INDIVIDUAL': 'Actividad Individual',
    'ACTIVIDAD_GRUPAL': 'Actividad Grupal',
    'PORTAFOLIO': 'Portafolio',
    'EVALUACION_SUMATIVA': 'Evaluación Sumativa',
    'PROYECTO_INTEGRADOR': 'Proyecto Integrador'
};

export const MOCK_INTERVENTIONS: Intervention[] = [
    {
        id: 'int1',
        institutionId: 'uemol',
        studentId: 's1',
        deceProfessionalId: 'u8',
        date: '2024-04-10',
        type: InterventionType.IndividualSession,
        summary: 'Entrevista por bajo rendimiento y reporte de distracción en clase.',
        participants: ['Carlos Andrade', 'Psicólogo DECE'],
        agreements: 'Estudiante se compromete a mejorar atención. Se citará a padres.'
    }
];

export const MOCK_CLASSROOM_VISITS: ClassroomVisit[] = [];
