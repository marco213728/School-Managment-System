
import { 
  Role, User, JobVacancy, Candidate, PerformanceEvaluation, Institution, Class, Student, ScheduleEntry, Notification, SupportContact, 
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
  EvaluationCategory,
  Appointment, ChatChannel, ChatMessage, DepartmentCode,
  EnrollmentRecord, MogacTicket, StudentTransferPass, TransferPassStatus, InstitutionFundingType,
  BibliographicItem, PhysicalCopy, LibraryLoan, LibraryHold, TextbookAssignment
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
        contact: { phone: '02-123-4567', email: 'info@uemol.edu.ec', address: 'Quito, Sector Sur - Guamaní' }, 
        codeAMIE: '17H00001',
        fundingType: 'Municipal',
        rectorName: 'Dra. Patricia Alvear',
        operatingPermit: {
          permitNumber: 'AUT-DMQ-EDUC-045',
          validUntil: '2028-12-31',
          issuingDistrict: '17D06 Eloy Alfaro'
        },
        costResolution: {
          resolutionNumber: 'RES-MUN-DMQ-2025-012',
          approvalDate: '2025-06-15',
          maxTuitionFee: 0,
          maxEnrollmentFee: 0,
          validAcademicPeriod: '2025-2026',
          authoritySignature: 'Dirección Metropolitana de Educación Quito'
        },
        scholarshipPolicies: {
          mandatoryPercentage: 10,
          municipalOrdinanceNumber: 'OM-DMQ-2024-089',
          availableCategories: ['Beca Municipal al Mérito', 'Ayuda Social Distrital', 'Beca Vulnerabilidad Socioeconómica']
        },
        communicationChannels: DEFAULT_COMMUNICATION_CHANNELS,
        automatedNotifications: DEFAULT_AUTOMATED_NOTIFICATIONS
    },
    { 
        id: 'ctee', 
        name: 'Colegio Técnico Fiscal "Eugenio Espejo"', 
        logoUrl: 'https://placehold.co/150x150/800000/white?text=CTEE', 
        contact: { phone: '02-765-4321', email: 'rectorado@espejo.edu.ec', address: 'Quito, Sector Centro Histórico' }, 
        codeAMIE: '17H00002',
        fundingType: 'Fiscal',
        rectorName: 'Mgs. Hernán Delgado',
        operatingPermit: {
          permitNumber: 'MINEDUC-CZ9-17D04-019',
          validUntil: '2029-08-31',
          issuingDistrict: '17D04 Centro'
        },
        costResolution: {
          resolutionNumber: 'MINEDUC-GRATUIDAD-LOEI-001',
          approvalDate: '2025-01-01',
          maxTuitionFee: 0,
          maxEnrollmentFee: 0,
          validAcademicPeriod: '2025-2026',
          authoritySignature: 'Ministerio de Educación del Ecuador'
        },
        communicationChannels: DEFAULT_COMMUNICATION_CHANNELS,
        automatedNotifications: DEFAULT_AUTOMATED_NOTIFICATIONS
    },
    { 
        id: 'inst-part-amazonia', 
        name: 'Unidad Educativa Particular "Bilingüe Amazonas"', 
        logoUrl: 'https://placehold.co/150x150/1e3a8a/white?text=UEPA', 
        contact: { phone: '02-255-8899', email: 'admisiones@bilingueamazonas.edu.ec', address: 'Quito, Av. América y República' }, 
        codeAMIE: '17H00999',
        fundingType: 'Particular',
        rectorName: 'PhD. Fernando Montalvo',
        operatingPermit: {
          permitNumber: 'AUT-MINEDUC-DP-17D05-341',
          validUntil: '2027-10-15',
          issuingDistrict: '17D05 Norte'
        },
        costResolution: {
          resolutionNumber: 'JD-PICH-0174-2025',
          approvalDate: '2025-05-20',
          maxTuitionFee: 195.00,
          maxEnrollmentFee: 146.25, // 75% reglamentario
          validAcademicPeriod: '2025-2026',
          authoritySignature: 'Junta Distrital de Regulación de Pensiones y Matrículas 17D05'
        },
        scholarshipPolicies: {
          mandatoryPercentage: 5,
          availableCategories: ['Beca Mérito Académico (100%)', 'Beca Hermanos (15%)', 'Beca Deportiva / Talento (50%)']
        },
        communicationChannels: DEFAULT_COMMUNICATION_CHANNELS,
        automatedNotifications: DEFAULT_AUTOMATED_NOTIFICATIONS
    }
];

export const MOCK_USERS: User[] = [
    { id: 'super1', name: 'Super Administrador Global', email: 'super@amauta.com', password: 'password', role: Role.SuperAdmin },
    { id: 'admin1', name: 'Admin Osvaldo Lombeida', email: 'admin@school.com', password: 'password', role: Role.InstitutionAdmin, institutionId: 'uemol' },
    { id: 'teacher1', name: 'Prof. Juan Pérez', email: 'juan.perez@school.com', password: 'password', role: Role.Teacher, institutionId: 'uemol', classIds: ['class1'], tieneLimitacionMovilidad: true },
    { id: 'teacher_lc', name: 'Lic. Martha Gómez (Lactancia)', email: 'martha@school.com', password: 'password', role: Role.Teacher, institutionId: 'uemol', classIds: ['class1'], esPeriodoLactancia: true },
    { id: 'parent1', name: 'Maria Gomez', email: 'maria@gmail.com', password: 'password', role: Role.Parent, institutionId: 'uemol', childIds: ['student1'] },
    
    // Usuarios de roles específicos añadidos para el flujo de trabajo
    { id: 'vice1', name: 'Dra. Carmen Salazar', email: 'vicerrector@school.com', password: 'password', role: Role.Vicerrector, institutionId: 'uemol' },
    { id: 'insp1', name: 'Abg. Luis Morales', email: 'inspector@school.com', password: 'password', role: Role.InspectorGeneral, institutionId: 'uemol' },
    { id: 'dece1', name: 'Psic. Ana Rivadeneira', email: 'dece@school.com', password: 'password', role: Role.JefeDECE, institutionId: 'uemol' },
    { id: 'med1', name: 'Dr. Roberto Méndez', email: 'medico@school.com', password: 'password', role: Role.HealthProfessional, institutionId: 'uemol' },

    { id: 'admin2', name: 'Ing. Roberto Espejo', email: 'admin2@school.com', password: 'password', role: Role.InstitutionAdmin, institutionId: 'ctee' },
    { id: 'teacher2', name: 'Dra. Elena Santos', email: 'profe.espejo@school.com', password: 'password', role: Role.Teacher, institutionId: 'ctee', classIds: ['class2'], esPeriodoLactancia: true },
    { id: 'parent2', name: 'Pedro Andrade', email: 'pedro.padre@gmail.com', password: 'password', role: Role.Parent, institutionId: 'ctee', childIds: ['student2'] }
];

export const MOCK_CLASSES: Class[] = [
    { id: 'class1', institutionId: 'uemol', name: '10mo EGB A', studentIds: ['student1'], timetableId: 'tt1', tutorId: 'teacher1', gradoCurso: 'Décimo de Básica', letra: 'A' },
    { id: 'class_sexto', institutionId: 'uemol', name: '6to EGB B', studentIds: [], timetableId: 'tt1', gradoCurso: 'Sexto de Básica', letra: 'B' },
    { id: 'class2', institutionId: 'ctee', name: '3ro Bachillerato Ciencias', studentIds: ['student2'], timetableId: 'tt2', tutorId: 'teacher2', gradoCurso: 'Tercero de Bachillerato', letra: 'A' }
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

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'appt-1',
        institutionId: 'uemol',
        studentId: 'student1',
        studentName: 'Carlos Andrade',
        studentGrade: '10mo EGB A',
        parentId: 'parent1',
        parentName: 'Maria Gomez',
        parentPhone: '0991234567',
        parentEmail: 'maria@gmail.com',
        staffId: 'teacher1',
        staffName: 'Prof. Juan Pérez',
        staffRole: 'Profesor / Tutor',
        departmentCode: 'DOCENTE',
        startTime: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + 'T09:30:00.000Z',
        endTime: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] + 'T10:15:00.000Z',
        status: 'CONFIRMED',
        parentReasonCategory: 'Rendimiento Académico',
        parentNotes: 'Deseo revisar el progreso de Carlos en la asignatura de Matemática y los refuerzos pedagógicos.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'appt-2',
        institutionId: 'uemol',
        studentId: 'student1',
        studentName: 'Carlos Andrade',
        studentGrade: '10mo EGB A',
        parentId: 'parent1',
        parentName: 'Maria Gomez',
        parentPhone: '0991234567',
        parentEmail: 'maria@gmail.com',
        staffId: 'dece1',
        staffName: 'Psic. Ana Rivadeneira',
        staffRole: 'Jefe DECE',
        departmentCode: 'DECE',
        startTime: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0] + 'T11:00:00.000Z',
        endTime: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0] + 'T11:45:00.000Z',
        status: 'PENDING',
        parentReasonCategory: 'Acompañamiento Socioemocional',
        parentNotes: 'Consulta sobre orientación vocacional y proyecto de vida del estudiante.',
        isConfidentialDece: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'appt-3',
        institutionId: 'uemol',
        studentId: 'student1',
        studentName: 'Carlos Andrade',
        studentGrade: '10mo EGB A',
        parentId: 'parent1',
        parentName: 'Maria Gomez',
        parentPhone: '0991234567',
        parentEmail: 'maria@gmail.com',
        staffId: 'insp1',
        staffName: 'Abg. Luis Morales',
        staffRole: 'Inspector General',
        departmentCode: 'INSPECCION',
        startTime: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] + 'T08:00:00.000Z',
        endTime: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0] + 'T08:40:00.000Z',
        status: 'COMPLETED',
        parentReasonCategory: 'Justificación de Inasistencias',
        parentNotes: 'Justificación médica por inasistencia de dos días a clases.',
        internalResolutionNotes: 'Se presentó certificado médico del centro de salud. Se procede a justificar las faltas y coordinar tareas atrasadas.',
        commitmentsAcuerdos: [
            { id: 'c1', description: 'Presentar tareas pendientes de Matemática y Ciencias en el plazo de 3 días', responsible: 'ESTUDIANTE', dueDate: '2026-10-22', status: 'CUMPLIDO' },
            { id: 'c2', description: 'Monitorear la entrega oportuna de las actividades justificadas', responsible: 'PADRE', dueDate: '2026-10-25', status: 'PENDIENTE' }
        ],
        attendedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        digitalSignature: {
            signedByStaffId: 'insp1',
            signedByStaffName: 'Abg. Luis Morales',
            staffRole: 'Inspector General',
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
];

export const MOCK_CHAT_CHANNELS: ChatChannel[] = [
    {
        id: 'chan-1',
        institutionId: 'uemol',
        channelType: 'GRADE_LEVEL',
        name: 'Junta de Curso - 10mo EGB A',
        description: 'Canal oficial de docentes del paralelo 10mo EGB A para seguimiento de rendimiento, conducta y evaluación continua.',
        relatedEntityId: 'class1',
        relatedEntityName: '10mo EGB A',
        participantIds: ['teacher1', 'teacher_lc', 'dece1', 'insp1', 'vice1'],
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        isArchived: false,
        lastMessage: {
            content: 'Estimados compañeros, favor revisar el informe de refuerzo pedagógico para la junta parcial.',
            senderId: 'teacher1',
            senderName: 'Prof. Juan Pérez',
            sentAt: new Date(Date.now() - 3600000 * 2).toISOString()
        }
    },
    {
        id: 'chan-2',
        institutionId: 'uemol',
        channelType: 'SUBJECT_AREA',
        name: 'Comisión Técnico-Pedagógica de Matemática',
        description: 'Alineación curricular, banco de ítems de evaluación y proyectos interdisciplinares STEM.',
        relatedEntityId: 'subj1',
        relatedEntityName: 'Matemática',
        participantIds: ['teacher1', 'vice1', 'admin1'],
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        isArchived: false,
        lastMessage: {
            content: 'Comparto la rúbrica unificada para el proyecto integrador del trimestre.',
            senderId: 'vice1',
            senderName: 'Dra. Carmen Salazar',
            sentAt: new Date(Date.now() - 86400000).toISOString()
        }
    },
    {
        id: 'chan-3',
        institutionId: 'uemol',
        channelType: 'CASE_THREAD',
        name: 'Caso Interdisciplinar: Carlos Andrade',
        description: 'Canal restringido entre Docente Tutor y DECE para seguimiento de adaptación psicopedagógica.',
        relatedEntityId: 'student1',
        relatedEntityName: 'Carlos Andrade',
        participantIds: ['teacher1', 'dece1'],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        isArchived: false,
        caseCitation: {
            studentId: 'student1',
            studentName: 'Carlos Andrade',
            category: 'DECE_REFERRAL',
            summary: 'Seguimiento por atención dispersa y adaptación curricular grado 2.'
        },
        lastMessage: {
            content: 'Se realizó la entrevista preliminar con la representante. Coordinamos refuerzo con pausas activas.',
            senderId: 'dece1',
            senderName: 'Psic. Ana Rivadeneira',
            sentAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
    },
    {
        id: 'chan-4',
        institutionId: 'uemol',
        channelType: 'DIRECT',
        name: 'Prof. Juan Pérez & Abg. Luis Morales',
        description: 'Mensajes directos de coordinación institucional.',
        participantIds: ['teacher1', 'insp1'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        isArchived: false,
        lastMessage: {
            content: 'Abogado, le remití el reporte de asistencia del viernes para el trámite de justificación.',
            senderId: 'teacher1',
            senderName: 'Prof. Juan Pérez',
            sentAt: new Date(Date.now() - 3600000 * 6).toISOString()
        }
    }
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 'msg-1',
        channelId: 'chan-1',
        senderId: 'teacher1',
        senderName: 'Prof. Juan Pérez',
        senderRole: Role.Teacher,
        content: 'Buenos días colegas. Damos inicio a la coordinación semanal del curso 10mo A.',
        sentAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: 'msg-2',
        channelId: 'chan-1',
        senderId: 'dece1',
        senderName: 'Psic. Ana Rivadeneira',
        senderRole: Role.JefeDECE,
        content: 'Buen día equipo. Desde DECE estaremos aplicando el taller de habilidades socioemocionales este jueves.',
        sentAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'msg-3',
        channelId: 'chan-1',
        senderId: 'teacher1',
        senderName: 'Prof. Juan Pérez',
        senderRole: Role.Teacher,
        content: 'Estimados compañeros, favor revisar el informe de refuerzo pedagógico para la junta parcial.',
        attachmentMetadata: [
            { name: 'Informe_Refuerzo_Pedagogico_10moA.pdf', url: '#', size: '1.2 MB', type: 'pdf' }
        ],
        sentAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
        id: 'msg-4',
        channelId: 'chan-3',
        senderId: 'teacher1',
        senderName: 'Prof. Juan Pérez',
        senderRole: Role.Teacher,
        content: 'Estimada psicóloga, Carlos ha mostrado mejoría en su concentración en los primeros bloques de clase.',
        caseCitationId: 'student1',
        sentAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
        id: 'msg-5',
        channelId: 'chan-3',
        senderId: 'dece1',
        senderName: 'Psic. Ana Rivadeneira',
        senderRole: Role.JefeDECE,
        content: 'Se realizó la entrevista preliminar con la representante. Coordinamos refuerzo con pausas activas.',
        sentAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
];
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
export const MOCK_ROOMS: Room[] = [
    { id: 'room1', institutionId: 'uemol', name: 'Aula 101 - 10mo A', capacidad: 40, esLaboratorio: false, piso: 1, tieneAscensor: false, tieneRampaAcceso: true },
    { id: 'room2', institutionId: 'uemol', name: 'Laboratorio de Computación (2do Piso)', capacidad: 30, esLaboratorio: true, piso: 2, tieneAscensor: false, tieneRampaAcceso: false },
    { id: 'room3', institutionId: 'uemol', name: 'Aula 205 (2do Piso)', capacidad: 35, esLaboratorio: false, piso: 2, tieneAscensor: false, tieneRampaAcceso: false },
    { id: 'room_basica1', institutionId: 'uemol', name: 'Aula 103 (Mobiliario Pequeño)', capacidad: 30, esLaboratorio: false, piso: 1, tieneAscensor: false, tieneRampaAcceso: true, gradoExclusivo: 'Segundo de Básica' },
    { id: 'room_basica2', institutionId: 'uemol', name: 'Aula 104', capacidad: 30, esLaboratorio: false, piso: 1, tieneAscensor: false, tieneRampaAcceso: true, gradoExclusivo: 'Tercero de Básica' },
    { id: 'room4', institutionId: 'ctee', name: 'Taller de Mecánica', capacidad: 25, esLaboratorio: true, piso: 1, tieneAscensor: false, tieneRampaAcceso: true },
];

export const MOCK_JOB_VACANCIES: JobVacancy[] = [
    { id: 'v1', institutionId: 'uemol', title: 'Docente de Matemáticas - EGB', department: 'Académico', contractType: 'LOEI', description: 'Requerimos docente con experiencia en método singapur.', requirements: ['Título de tercer nivel', '2 años de experiencia'], salaryRange: '$817', status: 'Open', createdAt: new Date().toISOString() },
    { id: 'v2', institutionId: 'uemol', title: 'Médico Escolar', department: 'Salud', contractType: 'LOSEP', description: 'Atención primaria y prevención en salud escolar.', requirements: ['Título de Médico', 'Registro Senescyt'], salaryRange: '$1200', status: 'Open', createdAt: new Date().toISOString() }
];

export const MOCK_CANDIDATES: Candidate[] = [
    { id: 'c1', vacancyId: 'v1', name: 'Laura Mendoza', email: 'laura@email.com', phone: '0999999999', stage: 'Entrevista', score: 85, createdAt: new Date().toISOString() },
    { id: 'c2', vacancyId: 'v1', name: 'Carlos Viteri', email: 'carlos@email.com', phone: '0988888888', stage: 'Aplicado', createdAt: new Date().toISOString() },
    { id: 'c3', vacancyId: 'v2', name: 'Dra. Sofia Proaño', email: 'sofia@email.com', phone: '0977777777', stage: 'Prueba Técnica', createdAt: new Date().toISOString() }
];

export const MOCK_ABSENCE_REQUESTS: any[] = [];

export const MOCK_PERFORMANCE_EVALUATIONS: PerformanceEvaluation[] = [
    { id: 'pe1', institutionId: 'uemol', userId: 'teacher1', evaluatorId: 'vicerrector1', year: '2025-2026', functionalScore: 65, behavioralScore: 28, totalScore: 93, evidenceLinks: ['Portafolio_Juan_Perez.pdf'], commitments: ['Implementar ABP en Ciencias Naturales en el primer quimestre.'], status: 'Acknowledged', createdAt: new Date().toISOString() }
];

export const MOCK_ENROLLMENT_RECORDS: EnrollmentRecord[] = [
  {
    id: 'mat-2026-001',
    institutionId: 'uemol',
    studentId: 'student1',
    studentName: 'Carlos Andrade',
    studentNationalId: '1728394051',
    studentBirthDate: '2012-05-14',
    studentGender: 'MASCULINO',
    parentId: 'parent1',
    parentName: 'Maria Gomez',
    parentNationalId: '1712345678',
    parentEmail: 'maria@gmail.com',
    parentPhone: '0991234567',
    parentAddress: 'Av. Maldonado S14-89 y Moraspungo, Sector Sur',
    planillaContrato: '1004829104',
    zone: 'Zona 9 - Distrito Metropolitano de Quito',
    district: '17D06 Eloy Alfaro',
    circuit: '17D06C04_Solanda',
    academicYear: '2026-2027',
    targetClassId: 'class1',
    targetGrade: '10mo EGB A',
    enrollmentType: 'REMATRICULA_AUTOMATICA',
    status: 'APROBADO',
    documents: {
      cedulaRepresentante: {
        id: 'doc-1',
        name: 'Cedula_Representante_MariaGomez.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'VALIDADO',
        documentType: 'CEDULA_REPRESENTANTE'
      },
      cedulaEstudiante: {
        id: 'doc-2',
        name: 'Cedula_Estudiante_CarlosAndrade.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'VALIDADO',
        documentType: 'CEDULA_ESTUDIANTE'
      },
      planillaElectrica: {
        id: 'doc-3',
        name: 'Planilla_EEQ_Contrato1004829104.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'VALIDADO',
        documentType: 'PLANILLA_ELECTRICA'
      },
      certificadosPromocion: {
        id: 'doc-4',
        name: 'Certificado_Promocion_9noEGB.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'VALIDADO',
        documentType: 'CERTIFICADO_PROMOCION'
      },
      fichaDece: {
        id: 'doc-5',
        name: 'Ficha_Socioemocional_DECE.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        status: 'VALIDADO',
        documentType: 'FICHA_DECE'
      }
    },
    juntosReceipt: {
      receiptNumber: 'JUNTOS-2026-9D06-0418',
      assignmentDate: new Date(Date.now() - 86400000 * 12).toISOString(),
      distanceKm: 0.85,
      capacityAvailable: 14,
      priorityAssigned: 'Prioridad 1 - Georreferenciación y Continuidad'
    },
    enrollmentCertificateCode: 'CERT-2026-UEMOL-10A-0418',
    enrolledAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    reviewedBy: 'admin1',
    reviewedByName: 'Lic. Mariana Cruz (Secretaría General)',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'mat-2026-002',
    institutionId: 'uemol',
    studentName: 'Mateo Sebastián Morales',
    studentNationalId: '1752981042',
    studentBirthDate: '2014-08-21',
    studentGender: 'MASCULINO',
    parentId: 'parent-demo-2',
    parentName: 'Gloria Estefanía Ramos',
    parentNationalId: '1719283746',
    parentEmail: 'gloria.ramos@gmail.com',
    parentPhone: '0984561234',
    parentAddress: 'La Floresta, Calle Guipúzcoa N24-110',
    planillaContrato: '1009384712',
    zone: 'Zona 9 - Distrito Metropolitano de Quito',
    district: '17D06 Eloy Alfaro',
    circuit: '17D06C04_Solanda',
    academicYear: '2026-2027',
    targetClassId: 'class1',
    targetGrade: '8vo EGB B',
    enrollmentType: 'NUEVA_ASIGNACION',
    status: 'OBSERVADO',
    reviewNotes: 'La planilla eléctrica adjunta no muestra con claridad la dirección residencial ni el sello de pago del último mes. Por favor volver a subir una imagen legible.',
    documents: {
      cedulaRepresentante: {
        id: 'doc-21',
        name: 'Cedula_Gloria_Ramos.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'VALIDADO',
        documentType: 'CEDULA_REPRESENTANTE'
      },
      planillaElectrica: {
        id: 'doc-22',
        name: 'Planilla_Ilegible.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'OBSERVADO',
        reviewComment: 'Imagen borrosa, no se distingue el Código Único Eléctrico Nacional (CUEN)',
        documentType: 'PLANILLA_ELECTRICA'
      },
      certificadosPromocion: {
        id: 'doc-23',
        name: 'Certificado_7moEGB.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'VALIDADO',
        documentType: 'CERTIFICADO_PROMOCION'
      }
    },
    juntosReceipt: {
      receiptNumber: 'JUNTOS-2026-9D06-0921',
      assignmentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
      distanceKm: 1.2,
      capacityAvailable: 8,
      priorityAssigned: 'Prioridad 2 - Asignación Ordinaria por Sede'
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mat-2026-003',
    institutionId: 'uemol',
    studentName: 'Valeria Nicole Cárdenas',
    studentNationalId: '1759402819',
    studentBirthDate: '2013-02-19',
    studentGender: 'FEMENINO',
    parentId: 'parent1',
    parentName: 'Maria Gomez',
    parentNationalId: '1712345678',
    parentEmail: 'maria@gmail.com',
    parentPhone: '0991234567',
    parentAddress: 'Av. Maldonado S14-89 y Moraspungo, Sector Sur',
    planillaContrato: '1004829104',
    zone: 'Zona 9 - Distrito Metropolitano de Quito',
    district: '17D06 Eloy Alfaro',
    circuit: '17D06C04_Solanda',
    academicYear: '2026-2027',
    targetClassId: 'class1',
    targetGrade: '9no EGB C',
    enrollmentType: 'NUEVA_ASIGNACION',
    status: 'EN_REVISION',
    documents: {
      cedulaRepresentante: {
        id: 'doc-31',
        name: 'Cedula_MariaGomez.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'PENDIENTE',
        documentType: 'CEDULA_REPRESENTANTE'
      },
      planillaElectrica: {
        id: 'doc-32',
        name: 'Planilla_Electrica_Marzo2026.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'PENDIENTE',
        documentType: 'PLANILLA_ELECTRICA'
      },
      certificadosPromocion: {
        id: 'doc-33',
        name: 'Certificado_Promocion_8vo.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'PENDIENTE',
        documentType: 'CERTIFICADO_PROMOCION'
      }
    },
    juntosReceipt: {
      receiptNumber: 'JUNTOS-2026-9D06-1102',
      assignmentDate: new Date(Date.now() - 86400000).toISOString(),
      distanceKm: 0.85,
      capacityAvailable: 11,
      priorityAssigned: 'Prioridad 1 - Georreferenciación'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export const MOCK_MOGAC_TICKETS: MogacTicket[] = [
  {
    id: 'mogac-tk-001',
    ticketNumber: 'MOGAC-2026-0042',
    institutionId: 'uemol',
    requesterId: 'parent1',
    requesterName: 'Maria Gomez',
    requesterRole: 'PADRE',
    targetEntityType: 'STUDENT',
    targetEntityId: 'student1',
    targetEntityName: 'Carlos Andrade',
    category: 'APELLIDOS_NOMBRES',
    currentValue: 'Carlos Andrade',
    requestedValue: 'Carlos David Andrade Gómez',
    justification: 'Inclusión del segundo nombre y segundo apellido conforme constan en la Partida de Nacimiento y Cédula de Identidad actualizada.',
    supportingDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    supportingDocumentName: 'Partida_Nacimiento_RegistroCivil.pdf',
    status: 'EN_TRAMITE',
    legalSlaDays: 15,
    deadlineDate: new Date(Date.now() + 86400000 * 8).toISOString(), // 8 días restantes
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'mogac-tk-002',
    ticketNumber: 'MOGAC-2026-0038',
    institutionId: 'uemol',
    requesterId: 'parent1',
    requesterName: 'Maria Gomez',
    requesterRole: 'PADRE',
    targetEntityType: 'PARENT',
    targetEntityId: 'parent1',
    targetEntityName: 'Maria Gomez',
    category: 'CONTACTO_CORREO_TELEFONO',
    currentValue: 'Tel: 0991234567 | Email: maria_antiguo@gmail.com',
    requestedValue: 'Tel: 0995551234 | Email: maria@gmail.com',
    justification: 'Actualización urgente de número de contacto telefónico para notificaciones de leccionario y citaciones docentes.',
    supportingDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    supportingDocumentName: 'Cedula_Actualizada.pdf',
    status: 'RESUELTO_APROBADO',
    legalSlaDays: 15,
    deadlineDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    resolutionNotes: 'Se verificó la titularidad de la representante y se procedió a la actualización de su expediente de contacto en el sistema central.',
    resolvedBy: 'admin1',
    resolvedByName: 'Lic. Mariana Cruz (Secretaría)',
    resolvedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'mogac-tk-003',
    ticketNumber: 'MOGAC-2026-0051',
    institutionId: 'uemol',
    requesterId: 'parent-demo-2',
    requesterName: 'Gloria Estefanía Ramos',
    requesterRole: 'PADRE',
    targetEntityType: 'STUDENT',
    targetEntityId: 'student-temp-2',
    targetEntityName: 'Mateo Sebastián Morales',
    category: 'DIRECCION_RESIDENCIA',
    currentValue: 'La Floresta, Guipúzcoa N24-110',
    requestedValue: 'Solanda, Sector 2, Manzana 14 Villa 8',
    justification: 'Cambio de domicilio familiar por arrendamiento. Se adjunta nueva planilla de luz con cuenta contrato.',
    supportingDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    supportingDocumentName: 'Nueva_Planilla_EEQ_Solanda.pdf',
    status: 'INGRESADO',
    legalSlaDays: 15,
    deadlineDate: new Date(Date.now() + 86400000 * 13).toISOString(), // 13 días restantes
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const MOCK_TRANSFER_PASSES: StudentTransferPass[] = [
  {
    id: 'trf-pass-001',
    transferCode: 'TRF-2026-0041',
    studentId: 'student1',
    studentName: 'Carlos Andrade',
    studentIdentification: '1723456789',
    parentId: 'parent1',
    parentName: 'Maria Gomez',
    parentEmail: 'maria@gmail.com',
    parentPhone: '0995551234',
    originInstitutionId: 'uemol',
    originInstitutionName: 'U.E. Municipal "Osvaldo Lombeida"',
    originFundingType: 'Municipal',
    destinationInstitutionId: 'ctee',
    destinationInstitutionName: 'Colegio Técnico Fiscal "Eugenio Espejo"',
    destinationFundingType: 'Fiscal',
    requestedGrade: '10mo EGB',
    academicPeriod: '2025-2026',
    transferReason: 'Cambio de Domicilio',
    reasonDetails: 'La familia se mudó al Centro Histórico por cercanía laboral y asignación de circuito fiscal 17D04.',
    requestDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'APROBADO_ORIGEN',
    originApprovalDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    originApprovedByName: 'Dra. Patricia Alvear (Rectorado UEMOL)',
    originNotes: 'Expediente académico completo y liberado. Sin adeudos ni compromisos pendientes.',
    academicPortfolio: {
      gradeRecords: [
        { grade: '8vo EGB', schoolYear: '2023-2024', averageScore: 9.25, passed: true },
        { grade: '9no EGB', schoolYear: '2024-2025', averageScore: 9.10, passed: true }
      ],
      promotionCertificatesUploaded: true,
      conductGrade: 'A'
    },
    deceTransferFile: {
      hasNee: false,
      psychosocialObservations: 'Estudiante con excelente desenvolvimiento social, sin antecedentes de vulnerabilidad.',
      deceOfficerName: 'Psic. Ana Rivadeneira'
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'trf-pass-002',
    transferCode: 'TRF-2026-0029',
    studentId: 'student-demo-part-1',
    studentName: 'Sofía Valentina Morales',
    studentIdentification: '1752349912',
    parentId: 'parent-demo-part-1',
    parentName: 'Ing. Javier Morales',
    parentEmail: 'javier.morales@outlook.ec',
    parentPhone: '0987654321',
    originInstitutionId: 'inst-part-amazonia',
    originInstitutionName: 'Unidad Educativa Particular "Bilingüe Amazonas"',
    originFundingType: 'Particular',
    destinationInstitutionId: 'uemol',
    destinationInstitutionName: 'U.E. Municipal "Osvaldo Lombeida"',
    destinationFundingType: 'Municipal',
    requestedGrade: '1ro BGU',
    academicPeriod: '2025-2026',
    transferReason: 'Beca Municipal / Mérito',
    reasonDetails: 'Adjudicación de Beca Municipal de Excelencia Académica otorgada por el Municipio del DMQ.',
    requestDate: new Date(Date.now() - 86400000 * 18).toISOString(),
    status: 'COMPLETADO',
    originApprovalDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    originApprovedByName: 'PhD. Fernando Montalvo (Rector UEPA)',
    originNotes: 'Se legaliza pase de salida de institución particular. Sin valores pendientes de pensiones.',
    destinationApprovalDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    destinationApprovedByName: 'Secretaría General UEMOL',
    destinationNotes: 'Estudiante matriculada con éxito en 1ro BGU paralelo A con asignación de Beca Municipal 100%.',
    academicPortfolio: {
      gradeRecords: [
        { grade: '9no EGB', schoolYear: '2023-2024', averageScore: 9.85, passed: true },
        { grade: '10mo EGB', schoolYear: '2024-2025', averageScore: 9.90, passed: true }
      ],
      promotionCertificatesUploaded: true,
      conductGrade: 'A'
    },
    deceTransferFile: {
      hasNee: false,
      psychosocialObservations: 'Estudiante destacada en oratoria y olimpiadas de matemáticas.',
      deceOfficerName: 'Lic. Andrés Paredes (DECE UEPA)'
    },
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  }
];

// ==========================================
// MOCK DATA: BIBLIOTECA ESCOLAR (SLMS)
// ==========================================

export const MOCK_BIBLIOGRAPHIC_ITEMS: BibliographicItem[] = [
  {
    id: 'bib-001',
    institutionId: 'inst-1790363544282-swirjer',
    isbn: '978-9978809426',
    title: 'Huasipungo',
    subtitle: 'Edición crítica conmemorativa',
    author: 'Jorge Icaza',
    publisher: 'Editorial Libresa / Ministerio de Educación',
    publicationYear: 2021,
    edition: '12ª edición escolar',
    deweyDecimal: '863.64', // Literatura ecuatoriana
    physicalDescription: '224 p. ; 19 cm',
    subjectHeadings: ['Literatura Ecuatoriana', 'Novela Indigenista', 'Historia Social', 'Clásicos Latinoamericanos'],
    lexileLevel: '880L',
    acceleratedReader: {
      atosLevel: 6.2,
      points: 8.0,
      quizNumber: 'EC-0149'
    },
    materialType: 'GENERAL_BOOK',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    summary: 'Obra cumbre de la literatura indigenista ecuatoriana que retrata las vivencias, la resistencia y la identidad de los pueblos ancestrales de la serranía.',
    copiesCount: 8,
    availableCopiesCount: 6,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'bib-002',
    institutionId: 'inst-1790363544282-swirjer',
    isbn: '978-9978772391',
    title: 'Matemática Divertida y Desafiante 1ro BGU',
    subtitle: 'Texto del Estudiante - Tronco Común',
    author: 'Grupo Pedagógico SM & MinEduc',
    publisher: 'Ediciones SM Ecuador',
    publicationYear: 2025,
    edition: 'Reforma Curricular Vigente',
    deweyDecimal: '510.71',
    physicalDescription: '288 p. ilustraciones a color ; 28 cm',
    subjectHeadings: ['Matemáticas', 'Álgebra', 'Funciones Reales', 'Trigonometría', 'BGU'],
    lexileLevel: '950L',
    materialType: 'TEXTBOOK',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
    summary: 'Texto curricular oficial para 1ro de Bachillerato General Unificado, con ejercicios de aplicación, modelado y resolución de problemas de la vida real.',
    copiesCount: 35,
    availableCopiesCount: 5,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'bib-003',
    institutionId: 'inst-1790363544282-swirjer',
    isbn: '978-9580479130',
    title: 'Cien Años de Soledad',
    subtitle: 'Edición conmemorativa RAE',
    author: 'Gabriel García Márquez',
    publisher: 'Penguin Random House / Alfaguara',
    publicationYear: 2022,
    edition: '5ª reimpresión',
    deweyDecimal: '863.64',
    physicalDescription: '496 p. ; 21 cm',
    subjectHeadings: ['Realismo Mágico', 'Literatura Colombiana', 'Nobel de Literatura', 'Macondo'],
    lexileLevel: '1040L',
    acceleratedReader: {
      atosLevel: 7.8,
      points: 17.0,
      quizNumber: 'ES-0021'
    },
    materialType: 'GENERAL_BOOK',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    summary: 'La saga de la familia Buendía a lo largo de siete generaciones en el pueblo mítico de Macondo. Monumento de la lengua española.',
    copiesCount: 5,
    availableCopiesCount: 2,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-02-05T11:15:00.000Z'
  },
  {
    id: 'bib-004',
    institutionId: 'inst-1790363544282-swirjer',
    isbn: '978-9942051288',
    title: 'Biología y Ecosistemas del Ecuador: De Galápagos a la Amazonía',
    subtitle: 'Atlas Científico Ilustrado',
    author: 'Dra. María Eugenia Holguín',
    publisher: 'Universidad Central del Ecuador / PUCE',
    publicationYear: 2024,
    edition: '1ª edición ilustrada',
    deweyDecimal: '577.09866',
    physicalDescription: '340 p. mapas y láminas fotográficas ; 30 cm',
    subjectHeadings: ['Biología', 'Ecología', 'Ecuador Biodiverso', 'Ciencias Naturales', 'Conservación'],
    lexileLevel: '1120L',
    materialType: 'REFERENCE',
    coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
    summary: 'Material de referencia de consulta en sala sobre los 4 mundos del Ecuador: Costa, Sierra, Amazonía y Región Insular.',
    copiesCount: 2,
    availableCopiesCount: 2,
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'bib-005',
    institutionId: 'inst-1790363544282-swirjer',
    isbn: '978-0141439518',
    title: 'Pride and Prejudice',
    subtitle: 'English Readers Level B2',
    author: 'Jane Austen',
    publisher: 'Penguin Readers',
    publicationYear: 2020,
    edition: 'Graded Reader Series',
    deweyDecimal: '823.7',
    physicalDescription: '120 p. con glosario y audio digital ; 19 cm',
    subjectHeadings: ['English Literature', 'Graded Readers', 'Foreign Language Study', 'B2 CEFR'],
    lexileLevel: '680L',
    acceleratedReader: {
      atosLevel: 4.5,
      points: 5.0,
      quizNumber: 'EN-8841'
    },
    materialType: 'GENERAL_BOOK',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
    summary: 'Adaptación pedagógica para el desarrollo de destrezas comunicativas en el idioma inglés nivel intermedio.',
    copiesCount: 6,
    availableCopiesCount: 4,
    createdAt: '2026-02-01T08:30:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z'
  }
];

export const MOCK_PHYSICAL_COPIES: PhysicalCopy[] = [
  // Huasipungo (bib-001)
  {
    id: 'copy-001-1',
    bibliographicItemId: 'bib-001',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-10491',
    barcode: '786100104911',
    nfcUid: '04:A2:3B:5C:8D',
    shelfLocation: 'ESTANTE-LIT-01',
    condition: 'GOOD',
    status: 'BORROWED',
    replacementCost: 12.50
  },
  {
    id: 'copy-001-2',
    bibliographicItemId: 'bib-001',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-10492',
    barcode: '786100104928',
    nfcUid: '04:B3:4C:6D:9E',
    shelfLocation: 'ESTANTE-LIT-01',
    condition: 'NEW',
    status: 'AVAILABLE',
    replacementCost: 12.50
  },
  {
    id: 'copy-001-3',
    bibliographicItemId: 'bib-001',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-10493',
    barcode: '786100104935',
    shelfLocation: 'ESTANTE-LIT-01',
    condition: 'GOOD',
    status: 'AVAILABLE',
    replacementCost: 12.50
  },
  // Matemática 1ro BGU (bib-002)
  {
    id: 'copy-002-1',
    bibliographicItemId: 'bib-002',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-20101',
    barcode: '786200201012',
    nfcUid: '04:C4:5D:7E:AF',
    shelfLocation: 'BODEGA-TEXTOS-01',
    condition: 'NEW',
    status: 'BORROWED',
    replacementCost: 18.00
  },
  {
    id: 'copy-002-2',
    bibliographicItemId: 'bib-002',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-20102',
    barcode: '786200201029',
    nfcUid: '04:D5:6E:8F:B0',
    shelfLocation: 'BODEGA-TEXTOS-01',
    condition: 'GOOD',
    status: 'AVAILABLE',
    replacementCost: 18.00
  },
  // Cien Años de Soledad (bib-003)
  {
    id: 'copy-003-1',
    bibliographicItemId: 'bib-003',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-30411',
    barcode: '786300304115',
    nfcUid: '04:E6:7F:90:C1',
    shelfLocation: 'ESTANTE-LIT-02',
    condition: 'GOOD',
    status: 'BORROWED',
    replacementCost: 22.00
  },
  {
    id: 'copy-003-2',
    bibliographicItemId: 'bib-003',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-30412',
    barcode: '786300304122',
    shelfLocation: 'ESTANTE-LIT-02',
    condition: 'FAIR',
    status: 'AVAILABLE',
    replacementCost: 22.00
  },
  // Biología de Referencia (bib-004)
  {
    id: 'copy-004-1',
    bibliographicItemId: 'bib-004',
    institutionId: 'inst-1790363544282-swirjer',
    accessionNumber: 'ACC-40001',
    barcode: '786400400018',
    shelfLocation: 'SALA-REFERENCIA-R1',
    condition: 'NEW',
    status: 'AVAILABLE',
    isReferenceOnly: true, // Solo consulta en sala
    replacementCost: 45.00
  }
];

export const MOCK_LIBRARY_LOANS: LibraryLoan[] = [
  {
    id: 'loan-101',
    institutionId: 'inst-1790363544282-swirjer',
    copyId: 'copy-001-1',
    bibliographicItemId: 'bib-001',
    accessionNumber: 'ACC-10491',
    barcode: '786100104911',
    bookTitle: 'Huasipungo',
    studentId: 'student1',
    studentName: 'Ana Belén Morales Viteri',
    studentGrade: '1ro BGU "A"',
    borrowDate: new Date(Date.now() - 86400000 * 18).toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 4).toISOString(), // Vencido hace 4 días (días hábiles = multa)
    status: 'OVERDUE',
    renewalCount: 0,
    fineAmount: 2.00, // $0.50 por día hábil de retraso
    finePaid: false,
    handledByUserId: 'user-librarian-1',
    handledByUserName: 'Lic. Martha Zambrano (Bibliotecaria)'
  },
  {
    id: 'loan-102',
    institutionId: 'inst-1790363544282-swirjer',
    copyId: 'copy-003-1',
    bibliographicItemId: 'bib-003',
    accessionNumber: 'ACC-30411',
    barcode: '786300304115',
    bookTitle: 'Cien Años de Soledad',
    studentId: 'student2',
    studentName: 'Carlos Andrés Mendoza Solís',
    studentGrade: '2do BGU "B"',
    borrowDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 9).toISOString(), // En vigencia
    status: 'ACTIVE',
    renewalCount: 1,
    fineAmount: 0.00,
    finePaid: true,
    handledByUserId: 'user-librarian-1',
    handledByUserName: 'Lic. Martha Zambrano (Bibliotecaria)'
  },
  {
    id: 'loan-103',
    institutionId: 'inst-1790363544282-swirjer',
    copyId: 'copy-001-2',
    bibliographicItemId: 'bib-001',
    accessionNumber: 'ACC-10492',
    barcode: '786100104928',
    bookTitle: 'Huasipungo',
    studentId: 'student-demo-part-1',
    studentName: 'Sofía Valentina Morales',
    studentGrade: '1ro BGU "A"',
    borrowDate: new Date(Date.now() - 86400000 * 25).toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 11).toISOString(),
    returnDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'RETURNED',
    renewalCount: 0,
    fineAmount: 0.50,
    finePaid: true,
    returnedCondition: 'GOOD',
    handledByUserId: 'user-librarian-1',
    handledByUserName: 'Lic. Martha Zambrano (Bibliotecaria)'
  }
];

export const MOCK_LIBRARY_HOLDS: LibraryHold[] = [
  {
    id: 'hold-201',
    institutionId: 'inst-1790363544282-swirjer',
    bibliographicItemId: 'bib-003',
    bookTitle: 'Cien Años de Soledad',
    studentId: 'student1',
    studentName: 'Ana Belén Morales Viteri',
    studentGrade: '1ro BGU "A"',
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'WAITING',
    queuePosition: 1,
    notes: 'Lectura requerida para ensayo de Lengua y Literatura'
  }
];

export const MOCK_TEXTBOOK_ASSIGNMENTS: TextbookAssignment[] = [
  {
    id: 'txt-assign-001',
    institutionId: 'inst-1790363544282-swirjer',
    classId: 'class1',
    className: '1ro BGU "A"',
    subjectId: 'sub1',
    subjectName: 'Matemática',
    studentId: 'student1',
    studentName: 'Ana Belén Morales Viteri',
    studentIdentification: '1723456789',
    textbookTitle: 'Matemática Divertida y Desafiante 1ro BGU',
    textbookBarcode: '786200201012',
    textbookAccessionNumber: 'ACC-20101',
    checkoutCondition: 'NEW',
    assignedDate: '2026-01-05T08:00:00.000Z',
    status: 'ASSIGNED',
    notes: 'Libro entregado con forro protector oficial'
  },
  {
    id: 'txt-assign-002',
    institutionId: 'inst-1790363544282-swirjer',
    classId: 'class1',
    className: '1ro BGU "A"',
    subjectId: 'sub1',
    subjectName: 'Matemática',
    studentId: 'student2',
    studentName: 'Carlos Andrés Mendoza Solís',
    studentIdentification: '1723456790',
    textbookTitle: 'Matemática Divertida y Desafiante 1ro BGU',
    textbookBarcode: '786200201013',
    textbookAccessionNumber: 'ACC-20103',
    checkoutCondition: 'GOOD',
    assignedDate: '2026-01-05T08:00:00.000Z',
    status: 'ASSIGNED',
    notes: 'Detalles mínimos en esquinas posteriores'
  }
];

