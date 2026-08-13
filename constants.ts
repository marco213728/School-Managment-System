
import { 
  Role, User, Institution, Class, Student, ScheduleEntry, Notification, SupportContact, 
  HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, 
  AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, 
  MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, 
  ReinforcementPlan, StaffAttendanceRecord, PunchType, FormalRequest, TrainingPlan, 
  InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation, ClassroomVisit, 
  TrainingSession, CronogramaEvent, Shift, ActivityType, AttendanceStatus, 
  CitacionStatus, CurricularPlanStatus, OcrSubmission, ResourceRepositoryItem, 
  DisciplinaryAction, InspectionVisit, QualityMetric, OvpActivity, ProtocolCase, 
  SubjectReport, JuntaDeCurso, GradeLevel, Competency, CurricularInsertion, 
  Intervention, AreaOfKnowledge, StandardIndicator, StandardDimension, StandardLevel, 
  StandardCompliance, SubjectLevel, TrainingCourse, InterventionType, PeiProfile, 
  PeiStatus, ViccInterventionType, OcrSubmissionStatus, DisciplinarySeverity, OvpAxis,
  EvaluationCategory
} from './types';

export * from './types';

// --- UTILITY CONSTANTS ---
export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const;
export const MOCK_SHIFTS: Shift[] = [Shift.Morning, Shift.Afternoon, Shift.Night];
export const AREAS_OF_KNOWLEDGE: AreaOfKnowledge[] = ['Lengua y Literatura', 'Matemática', 'Ciencias Naturales', 'Ciencias Sociales', 'Lengua Extranjera', 'Educación Física', 'Educación Cultural y Artística', 'Interdisciplinar', 'Áreas Técnicas', 'Acompañamiento Integral', 'Cívica y Acompañamiento Integral', 'Currículo Integral'];
export const SUBJECT_LEVELS: SubjectLevel[] = ['EGB', 'BGU', 'Todos'];
export const GRADE_LEVELS: GradeLevel[] = ['EGB Preparatoria', 'EGB Elemental', 'EGB Media', 'EGB Superior', 'BGU'];
export const COMPETENCIES: Competency[] = ['Comunicacional', 'Lógico-Matemática', 'Digital', 'Socioemocional'];
export const CURRICULAR_INSERTIONS: CurricularInsertion[] = ['Educación Cívica, Ética e Integridad', 'Educación para el Desarrollo Sostenible', 'Educación Financiera', 'Educación para la Seguridad Vial y Movilidad Sostenible', 'Socioemocional'];

export const OFFICIAL_STANDARDS: StandardIndicator[] = [
    { id: 's1', code: 'DI1', name: 'Gestión PEI', dimension: StandardDimension.Administrative, description: 'La institución cuenta con PEI vigente y socializado.', requirement: 'Documento PEI aprobado y actas de socialización.' },
    { id: 's2', code: 'DP1', name: 'Planificación Curricular', dimension: StandardDimension.Pedagogical, description: 'Los docentes elaboran planificaciones alineadas al currículo nacional.', requirement: 'Muestra de 10 PUDs revisados y aprobados por Vicerrectorado.' },
    { id: 's3', code: 'DC1', name: 'Convivencia Armónica', dimension: StandardDimension.Coexistence, description: 'Existe un Código de Convivencia vigente registrado en el distrito.', requirement: 'Documento del Código y registro distrital.' }
];

export const ATTENDANCE_OBSERVATIONS: Record<number, string> = {
    1: 'Sin uniforme completo',
    2: 'Indisciplina en clase',
    3: 'No trae material',
    4: 'Retiro anticipado',
    5: 'Enfermedad reportada'
};

export const OBLIGACIONES_ESTUDIANTILES = {
    '1': 'Asistir regularmente a clases y cumplir con puntualidad.',
    '2': 'Participar en las actividades educativas.',
    '3': 'Respetar a todos los miembros de la comunidad educativa.',
    '4': 'Cuidar las instalaciones y recursos de la institución.'
};

export const REGIMEN_DISCIPLINARIO = {
    '1': 'Faltas leves: Amonestación verbal.',
    '2': 'Faltas graves: Suspensión temporal.',
    '3': 'Faltas muy graves: Expulsión o reubicación.'
};

export const DEFAULT_RUBRIC_CRITERIA = [
    { id: 'rc1', category: 'Planificación', description: 'El docente presenta su planificación alineada al PUD.' },
    { id: 'rc2', category: 'Metodología', description: 'Aplica estrategias DUA para la inclusión.' },
    { id: 'rc3', category: 'Evaluación', description: 'Realiza evaluación formativa durante la clase.' }
];

export const EVALUATION_CATEGORIES: Record<EvaluationCategory, string> = {
    'ACTIVIDAD_INDIVIDUAL': 'Actividad Individual',
    'ACTIVIDAD_GRUPAL': 'Actividad Grupal',
    'PORTAFOLIO': 'Portafolio',
    'EVALUACION_SUMATIVA': 'Evaluación Sumativa',
    'PROYECTO_INTEGRADOR': 'Proyecto Integrador'
};

// --- DEFAULT CONFIGS ---

const DEFAULT_COMMUNICATION_CHANNELS = {
    email: { enabled: true },
    sms: { enabled: false },
    internalMessaging: { enabled: true },
    pushNotifications: { enabled: true },
    phoneCalls: { enabled: false },
    socialMedia: { enabled: false },
    circulars: { enabled: true }
};

const DEFAULT_AUTOMATED_NOTIFICATIONS = {
    absences: { enabled: true, channel: 'email', template: 'Estimado [PARENT_NAME], le informamos que [STUDENT_NAME] no asistió a clase el día [DATE].' },
    discipline: { enabled: true, channel: 'internalMessaging', template: 'Alerta de comportamiento para [STUDENT_NAME].' },
    healthEmergencies: { enabled: true, channel: 'email', template: 'Urgencia médica con el estudiante [STUDENT_NAME]. Por favor contáctenos.' },
    events: { enabled: true, channel: 'internalMessaging', template: 'Recordatorio: Mañana hay evento institucional.' },
    grades: { enabled: false, channel: 'internalMessaging', template: 'Nuevas calificaciones disponibles para [STUDENT_NAME].' },
    checkInOut: { enabled: false, channel: 'pushNotifications', template: '[STUDENT_NAME] ha ingresado a la institución.' }
};

// --- MOCK DATA ---

export const MOCK_PEIS: PeiProfile[] = [
    {
        id: 'pei-uemol-2024',
        institutionId: 'uemol',
        academicPeriod: '2024-2029',
        status: PeiStatus.Draft,
        progress: 45,
        identity: {
            mission: 'Formar ciudadanos íntegros con pensamiento crítico y valores éticos, capaces de transformar su entorno mediante una educación inclusiva y de calidad.',
            vision: 'Ser una institución educativa referente a nivel nacional en la aplicación de metodologías DUA y el uso de tecnologías exponenciales para el 2029.',
            ideario: 'Solidaridad, Honestidad, Respeto a la Diversidad, Innovación Permanente.'
        },
        diagnostics: [
            {
                dimension: StandardDimension.Pedagogical,
                conclusion: 'Se requiere una actualización docente en el uso de herramientas de IA y metodologías DUA para mejorar el rendimiento académico.',
                entries: [
                    { id: 'f1', type: 'Fortaleza', description: 'Cuerpo docente altamente capacitado en pedagogía.' },
                    { id: 'd1', type: 'Debilidad', description: 'Bajo equipamiento tecnológico en laboratorios.' },
                    { id: 'o1', type: 'Oportunidad', description: 'Alianzas con universidades locales para capacitación en TIC.' },
                    { id: 'a1', type: 'Amenaza', description: 'Cambios constantes en la normativa ministerial.' }
                ],
                strategies: [
                    { id: 'strat1', type: 'FO', description: 'Aprovechar la capacidad pedagógica del docente para implementar proyectos piloto de IA con apoyo universitario.', magnitude: 3, gravity: 2, capacity: 3, benefit: 3, priorityScore: 11 },
                    { id: 'strat2', type: 'DO', description: 'Modernizar los laboratorios mediante convenios de cooperación externa para superar la brecha tecnológica.', magnitude: 3, gravity: 3, capacity: 2, benefit: 3, priorityScore: 11 }
                ]
            },
            {
                dimension: StandardDimension.Administrative,
                conclusion: 'Optimización de procesos administrativos mediante la digitalización completa del centro.',
                entries: [
                    { id: 'f2', type: 'Fortaleza', description: 'Procesos de auditoría interna bien establecidos.' },
                    { id: 'd2', type: 'Debilidad', description: 'Uso excesivo de papel en trámites internos.' }
                ],
                strategies: []
            }
        ],
        strategicObjectives: [
            {
                dimension: StandardDimension.Pedagogical,
                objective: 'Fortalecer el proceso de enseñanza-aprendizaje mediante la integración efectiva de la tecnología y el diseño universal.',
                goals: [
                    { id: 'g1', description: 'Capacitar al 100% de la planta docente en el uso de herramientas de IA generativa aplicada al aula.', indicator: 'Certificados de capacitación', meta: '100% personal', responsibleId: 'admin1' },
                    { id: 'g2', description: 'Incrementar el promedio general institucional mediante el uso de recursos digitales personalizados.', indicator: 'Promedio Académico', meta: '8.5 / 10', responsibleId: 'teacher1' }
                ]
            }
        ],
        improvementPlans: []
    }
];

export const MOCK_INSTITUTIONS: Institution[] = [
    { 
        id: 'uemol', 
        name: 'U.E. Municipal "Osvaldo Lombeida"', 
        logoUrl: 'https://placehold.co/150x150/003366/white?text=UEMOL', 
        contact: { phone: '02-123-4567', email: 'info@uemol.edu.ec', address: 'Quito, Sector Sur' }, 
        codeAMIE: '17H00001',
        communicationChannels: DEFAULT_COMMUNICATION_CHANNELS,
        automatedNotifications: DEFAULT_AUTOMATED_NOTIFICATIONS
    },
    { 
        id: 'ctee', 
        name: 'Colegio Técnico "Eugenio Espejo"', 
        logoUrl: 'https://placehold.co/150x150/800000/white?text=CTEE', 
        contact: { phone: '02-765-4321', email: 'rectorado@espejo.edu.ec', address: 'Quito, Sector Centro' }, 
        codeAMIE: '17H00002',
        communicationChannels: DEFAULT_COMMUNICATION_CHANNELS,
        automatedNotifications: DEFAULT_AUTOMATED_NOTIFICATIONS
    }
];

export const MOCK_USERS: User[] = [
    { id: 'super1', name: 'Super Administrador Global', email: 'super@amauta.com', password: 'password', role: Role.SuperAdmin },
    { id: 'admin1', name: 'Admin Osvaldo Lombeida', email: 'admin@school.com', password: 'password', role: Role.InstitutionAdmin, institutionId: 'uemol' },
    { id: 'teacher1', name: 'Prof. Juan Pérez', email: 'juan.perez@school.com', password: 'password', role: Role.Teacher, institutionId: 'uemol', classIds: ['class1'] },
    { id: 'parent1', name: 'Maria Gomez', email: 'maria@gmail.com', password: 'password', role: Role.Parent, institutionId: 'uemol', childIds: ['student1'] },
    
    // Usuarios de roles específicos añadidos para el flujo de trabajo
    { id: 'vice1', name: 'Dra. Carmen Salazar', email: 'vicerrector@school.com', password: 'password', role: Role.Vicerrector, institutionId: 'uemol' },
    { id: 'insp1', name: 'Abg. Luis Morales', email: 'inspector@school.com', password: 'password', role: Role.InspectorGeneral, institutionId: 'uemol' },
    { id: 'dece1', name: 'Psic. Ana Rivadeneira', email: 'dece@school.com', password: 'password', role: Role.JefeDECE, institutionId: 'uemol' },
    { id: 'med1', name: 'Dr. Roberto Méndez', email: 'medico@school.com', password: 'password', role: Role.HealthProfessional, institutionId: 'uemol' },

    { id: 'admin2', name: 'Ing. Roberto Espejo', email: 'admin2@school.com', password: 'password', role: Role.InstitutionAdmin, institutionId: 'ctee' },
    { id: 'teacher2', name: 'Dra. Elena Santos', email: 'profe.espejo@school.com', password: 'password', role: Role.Teacher, institutionId: 'ctee', classIds: ['class2'] },
    { id: 'parent2', name: 'Pedro Andrade', email: 'pedro.padre@gmail.com', password: 'password', role: Role.Parent, institutionId: 'ctee', childIds: ['student2'] }
];

export const MOCK_CLASSES: Class[] = [
    { id: 'class1', institutionId: 'uemol', name: '10mo EGB A', studentIds: ['student1'], timetableId: 'tt1', tutorId: 'teacher1' },
    { id: 'class2', institutionId: 'ctee', name: '3ro Bachillerato Ciencias', studentIds: ['student2'], timetableId: 'tt2', tutorId: 'teacher2' }
];

export const MOCK_STUDENTS: Student[] = [
    { id: 'student1', institutionId: 'uemol', name: 'Carlos Andrade', classId: 'class1', parentId: 'parent1', listNumber: 1, grade: '10mo EGB', nationalId: '1723456789', birthDate: '2010-05-15', gender: 'MASCULINO' },
    { id: 'student2', institutionId: 'ctee', name: 'Ana Victoria Espejo', classId: 'class2', parentId: 'parent2', listNumber: 1, grade: '3ro BGU', nationalId: '1755566677', birthDate: '2007-08-20', gender: 'FEMENINO' }
];

export const MOCK_SUBJECTS: Subject[] = [
    { id: 'subj1', institutionId: 'uemol', name: 'Matemática', teacherId: 'teacher1', areaOfKnowledge: 'Matemática', level: 'EGB', maxWeeklyHours: 5 },
    { id: 'subj2', institutionId: 'ctee', name: 'Física Superior', teacherId: 'teacher2', areaOfKnowledge: 'Ciencias Naturales', level: 'BGU', maxWeeklyHours: 4 }
];

export const MOCK_TIME_SLOTS: TimeSlot[] = [
    { id: 'ts1', institutionId: 'uemol', timetableId: 'tt1', shift: Shift.Morning, startTime: '07:00', endTime: '07:40', isBreak: false },
    { id: 'ts2', institutionId: 'ctee', timetableId: 'tt2', shift: Shift.Morning, startTime: '07:15', endTime: '07:55', isBreak: false }
];

export const MOCK_TIMETABLES: Timetable[] = [
    { id: 'tt1', institutionId: 'uemol', name: 'Matutina General', shift: Shift.Morning },
    { id: 'tt2', institutionId: 'ctee', name: 'Bachillerato Técnico', shift: Shift.Morning }
];

export const MOCK_STANDARDS_COMPLIANCE: StandardCompliance[] = [
    { id: 'sc1', institutionId: 'uemol', indicatorId: 's1', level: 4, verifiedBySuperAdmin: true, lastUpdated: '2024-01-10', observations: 'Documentación impecable.' },
    { id: 'sc2', institutionId: 'uemol', indicatorId: 's2', level: 4, verifiedBySuperAdmin: true, lastUpdated: '2024-01-15', observations: 'Alineación DUA al 100%.' },
    { id: 'sc3', institutionId: 'ctee', indicatorId: 's1', level: 2, verifiedBySuperAdmin: false, lastUpdated: '2024-03-01', observations: 'Falta socialización con padres.' },
    { id: 'sc4', institutionId: 'ctee', indicatorId: 's2', level: 3, verifiedBySuperAdmin: false, lastUpdated: '2024-02-20', observations: 'Buen avance en planificación.' }
];

export const MOCK_REPOSITORY_ITEMS: ResourceRepositoryItem[] = [
    { 
        id: 'res1', institutionId: 'uemol', authorId: 'teacher1', authorName: 'Prof. Juan Pérez', authorInstitutionName: 'U.E. Municipal "Osvaldo Lombeida"',
        title: 'Proyecto: El Huerto Escolar Orgánico', description: 'Guía paso a paso para crear un huerto sostenible integrando Ciencias y Matemáticas.', 
        level: 'Todos', type: 'Project', isInterdisciplinary: true, shared: true, creationDate: '2024-02-01', dcdIds: [], curricularInsertions: ['Educación para el Desarrollo Sostenible'], competencies: [] 
    },
    { 
        id: 'res2', institutionId: 'ctee', authorId: 'teacher2', authorName: 'Dra. Elena Santos', authorInstitutionName: 'Colegio Técnico "Eugenio Espejo"',
        title: 'Guía de Circuitos Eléctricos Básicos', description: 'Laboratorio virtual y presencial sobre leyes de Kirchhoff y Ohm.', 
        level: 'BGU', type: 'Activity', isInterdisciplinary: false, shared: true, creationDate: '2024-03-10', dcdIds: [], curricularInsertions: [], competencies: ['Lógico-Matemática', 'Digital'] 
    }
];

export const MOCK_HEALTH_RECORDS: HealthRecord[] = [
    { id: 'hr1', institutionId: 'uemol', studentId: 'student1', allergies: ['Lactosa'], conditions: [], emergencyContact: { name: 'Maria Gomez', phone: '0987654321', relation: 'Madre' }, medications: [], lastCheckup: '2023-10-01' },
    { id: 'hr2', institutionId: 'ctee', studentId: 'student2', allergies: ['Maní'], conditions: ['Astma leve'], emergencyContact: { name: 'Pedro Andrade', phone: '0999888777', relation: 'Padre' }, medications: [{name: 'Salbutamol', dosage: '2 puffs', notes: 'Solo en caso de crisis'}], lastCheckup: '2024-01-20' }
];

export const MOCK_INTERVENTIONS: Intervention[] = [
    { id: 'int1', institutionId: 'ctee', studentId: 'student2', deceProfessionalId: 'admin2', date: '2024-02-15', type: InterventionType.IndividualSession, summary: 'Entrevista inicial por cambio de institución. Se observa buena adaptación.', participants: ['Ana Victoria Espejo'], agreements: 'Continuar con seguimiento mensual.' }
];

export const MOCK_GRADEBOOKS: Gradebook[] = [
    {
        id: 'gb1', institutionId: 'ctee', classId: 'class2', subjectId: 'subj2',
        records: [
            {
                studentId: 'student2',
                trimester1: {
                    actividades: [{promedio: 8.5, activityId: 'act1'}, {promedio: 9.0}, {promedio: 7.5}, {promedio: 0}, {promedio: 0}],
                    portafolio: {promedio: 10}, evaluacionSumativa: {promedio: 8.0}, proyectoIntegrador: {promedio: 9.0},
                    promedioFormativas: 8.33, sumaTrimestre: 8.45
                },
                trimester2: { actividades: [], portafolio: {promedio:0}, evaluacionSumativa: {promedio:0}, proyectoIntegrador: {promedio:0}, promedioFormativas:0, sumaTrimestre:0 },
                trimester3: { actividades: [], portafolio: {promedio:0}, evaluacionSumativa: {promedio:0}, proyectoIntegrador: {promedio:0}, promedioFormativas:0, sumaTrimestre:0 },
                mejorasUtilizadas: 0, promedioTrimestralFinal: 8.45, notaAnual90: 7.61, proyectoFinal10: {promedio: 9}, notaFinal100: 8.51, observacionFinal: 'Aprobado'
            }
        ]
    }
];

export const MOCK_OCR_SUBMISSIONS: OcrSubmission[] = [
    {
        id: 'ocr1',
        institutionId: 'uemol',
        classId: 'class1',
        uploaderId: 'teacher1',
        uploadDate: new Date().toISOString(),
        fileName: 'asistencia_10moA.jpg',
        imageUrl: 'https://placehold.co/600x800?text=Hoja+Asistencia',
        status: OcrSubmissionStatus.PendingVerification,
        extractedData: [
            { studentName: 'Carlos Andrade', detectedStatus: 'P', confidence: 0.98, correctedStatus: AttendanceStatus.Present },
            { studentName: 'Ana Victoria Espejo', detectedStatus: 'A', confidence: 0.85, correctedStatus: AttendanceStatus.Tardy },
        ]
    }
];

export const MOCK_OVP_ACTIVITIES: OvpActivity[] = [
    { id: 'ovp1', institutionId: 'uemol', studentId: 'student1', title: 'Test de Intereses Profesionales', axis: OvpAxis.Information, status: 'Completada' },
    { id: 'ovp2', institutionId: 'ctee', studentId: 'student2', title: 'Proyecto de Vida', axis: OvpAxis.DecisionMaking, status: 'Pendiente' }
];

export const MOCK_DISCIPLINARY_ACTIONS: DisciplinaryAction[] = [
    { id: 'da1', institutionId: 'uemol', studentId: 'student1', date: '2024-03-10', infraction: 'Uso indebido de celular', description: 'El alumno utilizó el celular durante la clase de matemáticas.', severity: DisciplinarySeverity.Minor, status: 'Cerrado', actionsTaken: 'Amonestación verbal y retiro del equipo.' }
];

export const MOCK_INSPECTION_VISITS: InspectionVisit[] = [
    { id: 'iv1', institutionId: 'uemol', inspectorId: 'admin1', date: '2024-03-05', type: 'Ordinaria', target: 'Pabellón A - Aulas de Básica', findings: 'Se observa limpieza adecuada. Falta señalización en el aula 101.', status: 'Realizada' }
];

export const MOCK_QUALITY_METRICS: QualityMetric[] = [
    { id: 'qm1', institutionId: 'uemol', year: '2024', category: 'Asistencia', metric: 'Tasa Global', value: 92, target: 95 }
];

export const MOCK_PROTOCOL_CASES: ProtocolCase[] = [
    {
        id: 'pc1', institutionId: 'uemol', studentId: 'student1', dateDetected: '2024-02-20', detectedBy: 'teacher1', detectionMethod: 'Observation',
        violenceType: 'Física', scope: 'Entre Pares', severity: 'Conflicto Escolar', isSexualViolence: false, denunciaFiled: false,
        status: 'Intervención', description: 'Riña entre estudiantes durante el recreo.', indicators: ['Marcas físicas'], actionsTaken: 'Entrevista con padres y mediación.'
    }
];

export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_SUPPORT_CONTACTS: SupportContact[] = [];
export const MOCK_MEDICAL_VISITS: MedicalVisit[] = [];
export const MOCK_VICC_INTERVENTIONS: ViccIntervention[] = [];
export const MOCK_ATTENDANCE: AttendanceRecord[] = [];
export const MOCK_EXIT_PASSES: ExitPass[] = [];
export const MOCK_CITACIONES: Citacion[] = [];
export const MOCK_ACADEMIC_CALENDAR_EVENTS: AcademicCalendarEvent[] = [];
export const MOCK_LECCIONARIO_ENTRIES: LeccionarioEntry[] = [];
export const MOCK_MICRO_PLANS: MicroPlan[] = [];
export const MOCK_DCDS: Dcd[] = [];
export const MOCK_EVALUATION_CRITERIA: EvaluationCriterion[] = [];
export const MOCK_EVALUATION_INDICATORS: EvaluationIndicator[] = [];
export const MOCK_ACTIVITIES: Activity[] = [];
export const MOCK_REINFORCEMENT_PLANS: ReinforcementPlan[] = [];
export const MOCK_STAFF_ATTENDANCE: StaffAttendanceRecord[] = [];
export const MOCK_FORMAL_REQUESTS: FormalRequest[] = [];
export const MOCK_TRAINING_PLANS: TrainingPlan[] = [];
export const MOCK_INSTITUTIONAL_DOCUMENTS: InstitutionalDocument[] = [];
export const MOCK_MEETING_RECORDS: MeetingRecord[] = [];
export const MOCK_RUBRICS: Rubric[] = [];
export const MOCK_CONFLICT_MEDIATIONS: ConflictMediation[] = [];
export const MOCK_CRONOGRAMA_EVENTS: CronogramaEvent[] = [];
export const MOCK_CLASSROOM_VISITS: ClassroomVisit[] = [];
export const MOCK_TRAINING_SESSIONS: TrainingSession[] = [];
export const MOCK_JUNTAS: JuntaDeCurso[] = [];
export const MOCK_SUBJECT_REPORTS: SubjectReport[] = [];
export const MOCK_ROOMS: Room[] = [];
