

import { User, Role, Student, Class, Activity, ActivityType, AttendanceRecord, AttendanceStatus, Notification, SupportContact, Intervention, InterventionType, OvpActivity, OvpAxis, HealthRecord, Institution, OcrSubmission, OcrSubmissionStatus, ScheduleEntry, MedicalVisit, Shift, TimeSlot, Subject, Room, Timetable, ViccIntervention, ViccInterventionType, ExitPass, Citacion, CitacionStatus, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, CurricularPlanStatus, GradeLevel, GRADE_LEVELS, Dcd, EvaluationCriterion, EvaluationIndicator, Competency, COMPETENCIES, CURRICULAR_INSERTIONS, AREAS_OF_KNOWLEDGE, SUBJECT_LEVELS, Gradebook, TrimesterRecord, StudentGradebook, GradeEntry, EVALUATION_CATEGORIES, ClassroomObservation, TrainingSession, InstitutionalDocument, MeetingRecord, DisciplinaryAction, DisciplinarySeverity, InspectionVisit, ConflictMediation, QualityMetric, ClassroomVisit, RubricCriterion, ReinforcementPlan, StaffAttendanceRecord, FormalRequestStatus, FormalRequestType, FormalRequestRecipient, TrainingPlan, Rubric, ResourceRepositoryItem, FormalRequest, SubjectReport, JuntaDeCurso, ProtocolCase } from './types';

export { GRADE_LEVELS, COMPETENCIES, CURRICULAR_INSERTIONS, AREAS_OF_KNOWLEDGE, SUBJECT_LEVELS, EVALUATION_CATEGORIES };

export const ATTENDANCE_OBSERVATIONS: { [key: number]: string } = {
  1: 'Atraso a la hora clase',
  2: 'Falta a la hora clase',
  3: 'Salida de actividades educativas con justificación',
  4: 'Salida de actividades educativas sin justificación',
  5: 'Uso incorrecto del uniforme',
  6: 'Uso de aparatos electrónicos',
  7: 'No cuenta con materiales',
  8: 'No presenta tareas',
  9: 'No rinde lección',
  10: 'Llamado a representante',
  11: 'Reporte al tutor',
  12: 'Reporte a Inspección',
  13: 'Reporte al DECE',
};

export const OBLIGACIONES_ESTUDIANTILES: { [key: string]: string } = {
  'A': 'Cumplir con las actividades académico-formativas programadas, tareas y responsabilidades obligaciones derivadas del proceso de enseñanza y aprendizaje.',
  'B': 'Participar en la evaluación de manera permanente, a través de procesos internos y externos que validen la calidad de la educación y el inter aprendizaje.',
  'C': 'Procurar la excelencia educativa y mostrar integridad y honestidad académica en el cumplimiento de las tareas, obligaciones y responsabilidades.',
  'D': 'Comprometerse con el cuidado y buen uso, de las instalaciones físicas, bienes y servicios de los establecimientos educativos.',
  'E': 'Tratar con dignidad, respeto y sin discriminación alguna a los miembros de la comunidad educativa.',
  'F': 'Participar en los procesos de elección del gobierno escolar, gobierno estudiantil, de los consejos de curso, consejo estudiantil, de las directivas de grado y de los demás entes de participación.',
  'G': 'Fundamentar debidamente sus opiniones y respetar las de los demás.',
  'H': 'Respetar y cumplir los códigos de convivencia armónica y promover la resolución pacífica de los conflictos.',
  'I': 'Hacer buen uso de becas y materiales que recibe.',
  'J': 'Respetar y cumplir la Constitución, las leyes, reglamentos y demás normas que regulen al Sistema Nacional de Educación en general y a los establecimientos educativos en particular.',
  'K': 'Cuidar y respetar la privacidad, intimidad, difusión y exposición mediáticas de todos los miembros de la comunidad educativa, en todos sus ámbitos y expresiones.',
  'L': 'Denunciar ante las autoridades e instituciones competentes todo acto de violación de sus derechos y actos de corrupción, cometidos por y en contra de un miembro de la comunidad.',
};

export const REGIMEN_DISCIPLINARIO: { [key: string]: string } = {
  'M': 'Alterar la paz, la convivencia armónica e irrespetar los Códigos de Convivencia de los Centros Educativos;',
  'N': 'No cumplir con las disposiciones contenidas en la presente Ley;',
  'O': 'Obstaculizar o interferir en el normal desenvolvimiento de las actividades académicas y culturales de la Institución, siempre y cuando no tengan relación con el ejercicio de su derecho de expresión, asociación o protesta;',
};

export const DEFAULT_RUBRIC_CRITERIA: RubricCriterion[] = [
    { id: 'c1', category: 'Planificación', description: 'La planificación microcurricular incluye elementos DUA y está alineada al currículo nacional.', maxScore: 4 },
    { id: 'c2', category: 'Metodología', description: 'Implementa estrategias activas (DUA) que fomentan la participación de todos los estudiantes.', maxScore: 4 },
    { id: 'c3', category: 'Clima de Aula', description: 'Mantiene un ambiente de respeto, gestión efectiva del comportamiento y motivación.', maxScore: 4 },
    { id: 'c4', category: 'Uso de Recursos', description: 'Utiliza recursos didácticos y tecnológicos pertinentes para el objetivo de aprendizaje.', maxScore: 4 },
    { id: 'c5', category: 'Evaluación', description: 'Aplica evaluación formativa y retroalimentación oportuna durante la clase.', maxScore: 4 },
];

export const MOCK_CLASSROOM_VISITS: ClassroomVisit[] = [
    {
        id: 'visit1',
        institutionId: 'uemol',
        teacherId: 'teacher1',
        observerId: 'vicerrector1',
        date: '2024-09-15',
        startTime: '08:30',
        className: 'ESO 1ºA',
        subject: 'Matemáticas',
        topic: 'Números Enteros',
        focus: 'Metodología DUA',
        status: 'Completed',
        scores: [
            { criteriaId: 'c1', score: 4, evidence: 'Planificación visible y completa.' },
            { criteriaId: 'c2', score: 3, evidence: 'Buena participación, faltó diversificar actividades.' },
            { criteriaId: 'c3', score: 4, evidence: 'Excelente clima.' },
            { criteriaId: 'c4', score: 4, evidence: 'Uso de material concreto.' },
            { criteriaId: 'c5', score: 3, evidence: 'Retroalimentación general, faltó individual.' },
        ],
        strengths: 'Buen dominio del grupo y uso de recursos.',
        weaknesses: 'Mejorar la diferenciación en la evaluación.',
        agreements: 'Aplicar rúbricas diferenciadas para la próxima unidad.',
        rating: 3.6,
        feedbackDate: '2024-09-16'
    },
    {
        id: 'visit2',
        institutionId: 'uemol',
        teacherId: 'teacher2',
        observerId: 'vicerrector1',
        date: '2024-10-10',
        startTime: '10:00',
        className: 'ESO 1ºB',
        subject: 'Historia',
        topic: 'La Edad Media',
        focus: 'Uso de TIC',
        status: 'Scheduled',
    }
];

export const MOCK_ACADEMIC_CALENDAR_EVENTS: AcademicCalendarEvent[] = [
  {
    id: 'ace1',
    institutionId: 'uemol',
    name: 'Independencia de Guayaquil',
    startDate: '2024-10-09',
    endDate: '2024-10-09',
  },
  {
    id: 'ace2',
    institutionId: 'uemol',
    name: 'Día de Difuntos',
    startDate: '2024-11-02',
    endDate: '2024-11-03',
  },
  {
    id: 'ace3',
    institutionId: 'uemol',
    name: 'Vacaciones de Navidad',
    startDate: '2024-12-24',
    endDate: '2025-01-01',
  },
];

export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'uemol',
    name: "Unidad Educativa Municipal Oswaldo Lombeyda",
    logoUrl: "https://placehold.co/150x150/3b82f6/white?text=UEMOL",
    contact: {
      phone: "02-222-2222",
      email: "contacto@uelombeyda.edu.ec",
      address: "Av. Principal 123, Quito, Ecuador",
    },
    academicYear: {
      startDate: '2024-09-01',
      endDate: '2025-06-30',
    },
    activeModules: { dece: true, health: true },
    adminIds: ['admin1'],
    methodologyFocus: 'DUA',
    communicationChannels: {
      email: { enabled: true },
      sms: { enabled: true },
      internalMessaging: { enabled: true },
      pushNotifications: { enabled: false },
      phoneCalls: { enabled: true },
      socialMedia: { enabled: false },
      circulars: { enabled: true },
    },
    automatedNotifications: {
      absences: { enabled: true, channel: 'email', template: '...' },
      discipline: { enabled: true, channel: 'internalMessaging', template: '...' },
      healthEmergencies: { enabled: true, channel: 'sms', template: '...' },
      events: { enabled: false, channel: 'internalMessaging', template: '...' },
      grades: { enabled: false, channel: 'internalMessaging', template: '...' },
      checkInOut: { enabled: true, channel: 'sms', template: '...' },
    }
  },
  {
    id: 'colegio-xyz',
    name: "Colegio Experimental XYZ",
    logoUrl: "https://placehold.co/150x150/16a34a/white?text=XYZ",
    contact: { phone: "04-333-4444", email: "info@colegioxyz.edu.ec", address: "Calle Secundaria 456, Guayaquil, Ecuador" },
    activeModules: { dece: false, health: true },
    adminIds: ['admin2'],
    methodologyFocus: 'Tradicional',
    communicationChannels: { email: { enabled: true }, sms: { enabled: false }, internalMessaging: { enabled: true }, pushNotifications: { enabled: true }, phoneCalls: { enabled: true }, socialMedia: { enabled: false }, circulars: { enabled: false } },
    automatedNotifications: { absences: { enabled: true, channel: 'sms', template: '...' }, discipline: { enabled: false, channel: 'internalMessaging', template: '...' }, healthEmergencies: { enabled: true, channel: 'phoneCalls', template: '...' }, events: { enabled: true, channel: 'email', template: '...' }, grades: { enabled: true, channel: 'internalMessaging', template: '...' }, checkInOut: { enabled: false, channel: 'sms', template: '...' } }
  }
];

export const MOCK_USERS: User[] = [
  { id: 'superadmin', name: 'Super Admin', email: 'super@platform.com', password: 'password', role: Role.SuperAdmin },
  { id: 'admin1', name: 'Admin Director (UEMOL)', email: 'marco213728@gmail.com', password: 'password', role: Role.InstitutionAdmin, institutionId: 'uemol', phone: '600111222', address: 'Calle Principal 1, 28001 Madrid' },
  { id: 'teacher1', name: 'Prof. García', email: 'garcia@school.com', password: 'password', role: Role.Teacher, classIds: ['class1'], institutionId: 'uemol', phone: '611222333', maxMonthlyHours: 80, biometricRegistered: true, accessPin: '1234', workSchedule: { Lunes: { startTime: '08:00', endTime: '16:00' }, Martes: { startTime: '08:00', endTime: '16:00' }, Miércoles: { startTime: '08:00', endTime: '16:00' }, Jueves: { startTime: '08:00', endTime: '16:00' }, Viernes: { startTime: '08:00', endTime: '16:00' } } },
  { id: 'teacher2', name: 'Prof. López', email: 'lopez@school.com', password: 'password', role: Role.Teacher, classIds: ['class2'], institutionId: 'uemol', maxMonthlyHours: 75, biometricRegistered: false, accessPin: '5678', workSchedule: { Lunes: { startTime: '08:30', endTime: '16:30' }, Martes: { startTime: '08:30', endTime: '16:30' }, Miércoles: { startTime: '08:30', endTime: '16:30' }, Jueves: { startTime: '08:30', endTime: '16:30' }, Viernes: { startTime: '08:30', endTime: '16:30' } } },
  { id: 'parent1', name: 'Sr. Martinez', email: 'martinez@family.com', password: 'password', role: Role.Parent, childIds: ['student1', 'student3'], institutionId: 'uemol', phone: '622333444', address: 'Avenida del Sol 4, 28002 Madrid' },
  { id: 'parent2', name: 'Sra. Diaz', email: 'diaz@family.com', password: 'password', role: Role.Parent, childIds: ['student2'], institutionId: 'uemol' },
  { id: 'parent3', name: 'Sr. Sanchez', email: 'sanchez@family.com', password: 'password', role: Role.Parent, childIds: ['student3'], institutionId: 'uemol' },
  { id: 'parent4', name: 'Sra. Fernandez', email: 'fernandez@family.com', password: 'password', role: Role.Parent, childIds: ['student4'], institutionId: 'uemol' },
  { id: 'parent5', name: 'Sr. Gomez', email: 'gomez@family.com', password: 'password', role: Role.Parent, childIds: ['student5'], institutionId: 'uemol' },
  { id: 'parent6', name: 'Sra. Rodriguez', email: 'rodriguez@family.com', password: 'password', role: Role.Parent, childIds: ['student6'], institutionId: 'uemol' },
  { id: 'student1', name: 'ARAUJO SANGUCHO ADELE CONSUELO', email: 'juan@student.com', password: 'password', role: Role.Student, classIds: ['class1'], institutionId: 'uemol' },
  { id: 'student2', name: 'Ana Diaz', email: 'ana@student.com', password: 'password', role: Role.Student, classIds: ['class2'], institutionId: 'uemol' },
  { id: 'student3', name: 'Pedro Sanchez', email: 'pedro@student.com', password: 'password', role: Role.Student, classIds: ['class1'], institutionId: 'uemol'},
  { id: 'student4', name: 'Lucia Fernandez', email: 'lucia@student.com', password: 'password', role: Role.Student, classIds: ['class2'], institutionId: 'uemol'},
  { id: 'student5', name: 'Carlos Gomez', email: 'carlos@student.com', password: 'password', role: Role.Student, classIds: ['class1'], institutionId: 'uemol'},
  { id: 'student6', name: 'Sofia Rodriguez', email: 'sofia@student.com', password: 'password', role: Role.Student, classIds: ['class2'], institutionId: 'uemol'},
  { id: 'dece1', name: 'Lic. Ana Torres', email: 'atorres@dece.school.com', password: 'password', role: Role.JefeDECE, institutionId: 'uemol', phone: '633444555' },
  { id: 'dece2', name: 'Psic. Carlos Vera', email: 'cvera@dece.school.com', password: 'password', role: Role.PsicologoEducativo, institutionId: 'uemol', phone: '644555666' },
  { id: 'health1', name: 'Dr. López (Médico)', email: 'drlopez@health.school.com', password: 'password', role: Role.HealthProfessional, institutionId: 'uemol', phone: '655666777'},
  { id: 'vicerrector1', name: 'Lic. Ricardo Montes', email: 'rmontes@school.com', password: 'password', role: Role.Vicerrector, institutionId: 'uemol' },
  { id: 'inspector1', name: 'Abg. Sofia Delgado', email: 'sdelgado@school.com', password: 'password', role: Role.InspectorGeneral, institutionId: 'uemol' },
  { id: 'inspector2', name: 'Mariela Allauca', email: 'mallauca@school.com', password: 'password', role: Role.InspectorGeneral, institutionId: 'uemol' },
  { id: 'vicerrector2', name: 'Gabriela', email: 'gabriela@school.com', password: 'password', role: Role.Vicerrector, institutionId: 'uemol' },
  { id: 'teacher4', name: 'Prof. Lorena', email: 'lorena@school.com', password: 'password', role: Role.Teacher, classIds: ['class1'], institutionId: 'uemol', maxMonthlyHours: 80, workSchedule: { Lunes: { startTime: '07:30', endTime: '15:30' }, Martes: { startTime: '07:30', endTime: '15:30' }, Miércoles: { startTime: '07:30', endTime: '15:30' }, Jueves: { startTime: '07:30', endTime: '15:30' }, Viernes: { startTime: '07:30', endTime: '15:30' } } },
  { id: 'rector1', name: 'Dr. Fausto Rueda', email: 'rector@school.com', password: 'password', role: Role.Rector, institutionId: 'uemol', phone: '600000000' },
  { id: 'admin2', name: 'Directora Pérez (XYZ)', email: 'perez@xyz.com', password: 'password', role: Role.InstitutionAdmin, institutionId: 'colegio-xyz' },
  { id: 'teacher3', name: 'Prof. Vera', email: 'vera@xyz.com', password: 'password', role: Role.Teacher, classIds: ['class3'], institutionId: 'colegio-xyz', maxMonthlyHours: 90 },
  { id: 'student7', name: 'Maria Solis', email: 'maria@xyz.com', password: 'password', role: Role.Student, classIds: ['class3'], institutionId: 'colegio-xyz'},
  { id: 'parent7', name: 'Sr. Solis', email: 'solis@family.com', password: 'password', role: Role.Parent, childIds: ['student7'], institutionId: 'colegio-xyz'},
];

export const MOCK_TIMETABLES: Timetable[] = [
  { id: 'tt1', institutionId: 'uemol', name: 'Horario General Mañana', shift: Shift.Morning },
  { id: 'tt2', institutionId: 'uemol', name: 'Horario Tarde', shift: Shift.Afternoon },
  { id: 'tt3', institutionId: 'colegio-xyz', name: 'Horario XYZ Mañana', shift: Shift.Morning },
];

export const MOCK_CLASSES: Class[] = [
    { id: 'class1', institutionId: 'uemol', name: 'ESO 1ºA', studentIds: ['student1', 'student3', 'student5'], timetableId: 'tt1', tutorId: 'teacher1' },
    { id: 'class2', institutionId: 'uemol', name: 'ESO 1ºB', studentIds: ['student2', 'student4', 'student6'], timetableId: 'tt1', tutorId: 'teacher2' },
    { id: 'class3', institutionId: 'colegio-xyz', name: 'Ciencias 8ºA', studentIds: ['student7'], timetableId: 'tt3' },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'subj1', institutionId: 'uemol', name: 'Matemáticas', teacherId: 'teacher1', maxWeeklyHours: 5, areaOfKnowledge: 'Matemática', level: 'Todos' },
  { id: 'subj-math-lorena', institutionId: 'uemol', name: 'Matemáticas', teacherId: 'teacher4', maxWeeklyHours: 5, areaOfKnowledge: 'Matemática', level: 'Todos' },
  { id: 'subj-ll', institutionId: 'uemol', name: 'Lengua y Literatura', teacherId: 'teacher2', maxWeeklyHours: 5, areaOfKnowledge: 'Lengua y Literatura', level: 'Todos' },
  { id: 'subj-cn-egb', institutionId: 'uemol', name: 'Ciencias Naturales', teacherId: 'teacher4', maxWeeklyHours: 4, areaOfKnowledge: 'Ciencias Naturales', level: 'EGB' },
  { id: 'subj-cs-egb', institutionId: 'uemol', name: 'Estudios Sociales', teacherId: 'teacher2', maxWeeklyHours: 3, areaOfKnowledge: 'Ciencias Sociales', level: 'EGB' },
  { id: 'subj-en', institutionId: 'uemol', name: 'Lengua Extranjera (Inglés)', teacherId: 'teacher4', maxWeeklyHours: 3, areaOfKnowledge: 'Lengua Extranjera', level: 'Todos' },
  { id: 'subj-ef', institutionId: 'uemol', name: 'Educación Física', teacherId: 'teacher1', maxWeeklyHours: 2, areaOfKnowledge: 'Educación Física', level: 'Todos' },
  { id: 'subj-eca', institutionId: 'uemol', name: 'Educación Cultural y Artística', teacherId: 'teacher2', maxWeeklyHours: 2, areaOfKnowledge: 'Educación Cultural y Artística', level: 'Todos' },
  { id: 'subj2', institutionId: 'uemol', name: 'Historia', teacherId: 'teacher2', maxWeeklyHours: 4, areaOfKnowledge: 'Ciencias Sociales', level: 'BGU' },
  { id: 'subj-hist-garcia', institutionId: 'uemol', name: 'Historia', teacherId: 'teacher1', maxWeeklyHours: 4, areaOfKnowledge: 'Ciencias Sociales', level: 'BGU' },
  { id: 'subj-bio', institutionId: 'uemol', name: 'Biología', teacherId: 'teacher4', maxWeeklyHours: 2, areaOfKnowledge: 'Ciencias Naturales', level: 'BGU' },
  { id: 'subj-fis', institutionId: 'uemol', name: 'Física', teacherId: 'teacher1', maxWeeklyHours: 2, areaOfKnowledge: 'Ciencias Naturales', level: 'BGU' },
  { id: 'subj-qui', institutionId: 'uemol', name: 'Química', teacherId: 'teacher4', maxWeeklyHours: 2, areaOfKnowledge: 'Ciencias Naturales', level: 'BGU' },
  { id: 'subj-fil', institutionId: 'uemol', name: 'Filosofía', teacherId: 'teacher2', maxWeeklyHours: 2, areaOfKnowledge: 'Ciencias Sociales', level: 'BGU' },
  { id: 'subj-ciu', institutionId: 'uemol', name: 'Educación para la Ciudadanía', teacherId: 'teacher2', maxWeeklyHours: 2, areaOfKnowledge: 'Ciencias Sociales', level: 'BGU' },
  { id: 'subj-eyg', institutionId: 'uemol', name: 'Emprendimiento y Gestión', teacherId: 'teacher1', maxWeeklyHours: 2, areaOfKnowledge: 'Interdisciplinar', level: 'BGU', isModule: true },
  { id: 'subj3', institutionId: 'colegio-xyz', name: 'Ciencias Naturales', teacherId: 'teacher3', maxWeeklyHours: 6, areaOfKnowledge: 'Ciencias Naturales', level: 'EGB' },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'room1', institutionId: 'uemol', name: 'Aula 101' },
  { id: 'room2', institutionId: 'uemol', name: 'Aula 102' },
  { id: 'room3', institutionId: 'uemol', name: 'Laboratorio de Ciencias' },
  { id: 'room4', institutionId: 'colegio-xyz', name: 'Salón Principal' },
];

export const MOCK_STUDENTS: Student[] = [
  { 
    id: 'student1', 
    institutionId: 'uemol', 
    name: 'ARAUJO SANGUCHO ADELE CONSUELO', 
    classId: 'class1', 
    parentId: 'parent1', 
    phone: '612345678', 
    address: 'Guamani Alto Barrio La Esperanza Calle AS55E Mz2 Lote 3', 
    photoUrl: 'https://placehold.co/200x200/3b82f6/white?text=AC',
    grade: 'CUARTO DE E.G.B A',
    listNumber: 1,
    nationalId: '1757866973',
    birthDate: '2017-10-01',
    gender: 'FEMENINO',
    homeLocationLink: 'https://maps.app.goo.gl/sFw5eJ8g8T3',
    relatedContacts: [
      { id: 'contact1', relation: 'Padre', name: 'Desconozco', occupation: 'Desconozco', phone: '111-111-1111', email: 'padre@example.com' },
      { id: 'contact2', relation: 'Madre', name: 'Evelyn Tatiana Sangucho Guan...', occupation: 'Empleada', phone: '222-222-2222', email: 'madre@example.com' },
      { id: 'contact3', relation: 'Tía', name: 'Jessica Maribel Sangucho Gua...', occupation: 'Ama de casa', phone: '333-333-3333', email: 'tia1@example.com' },
      { id: 'contact4', relation: 'Tía', name: 'Norma Isabel Sanguacho Guanot...', occupation: 'Estudiante', phone: '444-444-4444', email: 'tia2@example.com' },
    ]
  },
  { id: 'student2', institutionId: 'uemol', name: 'Ana Diaz', classId: 'class2', parentId: 'parent2', phone: '687654321', address: 'Avenida Siempre Viva 742, Madrid', photoUrl: 'https://placehold.co/200x200/ec4899/white?text=AD' },
  { id: 'student3', institutionId: 'uemol', name: 'Pedro Sanchez', classId: 'class1', parentId: 'parent1', photoUrl: 'https://placehold.co/200x200/f97316/white?text=PS' }, // Changed parentId to parent1
  { id: 'student4', institutionId: 'uemol', name: 'Lucia Fernandez', classId: 'class2', parentId: 'parent4' },
  { id: 'student5', institutionId: 'uemol', name: 'Carlos Gomez', classId: 'class1', parentId: 'parent5' },
  { id: 'student6', institutionId: 'uemol', name: 'Sofia Rodriguez', classId: 'class2', parentId: 'parent6' },
  { id: 'student7', institutionId: 'colegio-xyz', name: 'Maria Solis', classId: 'class3', parentId: 'parent7', photoUrl: 'https://placehold.co/200x200/14b8a6/white?text=MS' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'act1', institutionId: 'uemol', classId: 'class1', teacherId: 'teacher1', title: 'Álgebra: Ejercicios 1-5', description: 'Resolver los ejercicios de la página 45.', type: ActivityType.Homework, deliveryDate: '2024-08-15', subjectId: 'subj1', trimester: 1, evaluationCategory: 'ACTIVIDAD_INDIVIDUAL', gradebookIndex: 0 },
  { id: 'act2', institutionId: 'uemol', classId: 'class2', teacherId: 'teacher2', title: 'Examen: La Edad Media', description: 'Estudiar los capítulos 3 y 4 del libro.', type: ActivityType.Exam, deliveryDate: '2024-08-20', subjectId: 'subj2', trimester: 1, evaluationCategory: 'EVALUACION_SUMATIVA' },
  { id: 'act3', institutionId: 'uemol', classId: 'class1', teacherId: 'teacher1', title: 'Lectura: "El hombre que calculaba"', description: 'Leer los primeros dos capítulos.', type: ActivityType.Reading, deliveryDate: '2024-08-22', subjectId: 'subj1', trimester: 1, evaluationCategory: 'ACTIVIDAD_INDIVIDUAL', gradebookIndex: 1 },
  { id: 'act4', institutionId: 'colegio-xyz', classId: 'class3', teacherId: 'teacher3', title: 'Laboratorio: Célula', description: 'Completar el informe del laboratorio.', type: ActivityType.Homework, deliveryDate: '2024-08-18', subjectId: 'subj3', trimester: 1, evaluationCategory: 'ACTIVIDAD_GRUPAL', gradebookIndex: 0 },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'att1', institutionId: 'uemol', studentId: 'student1', date: '2024-08-01', timeSlot: '8:30-10:15', status: AttendanceStatus.Present },
    { id: 'att6', institutionId: 'uemol', studentId: 'student1', date: '2024-08-05', timeSlot: '10:35-12:20', status: AttendanceStatus.Unexcused },
    { id: 'att2', institutionId: 'uemol', studentId: 'student3', date: '2024-08-01', timeSlot: '8:30-10:15', status: AttendanceStatus.Tardy, notes: 'Llegó 10 minutos tarde.' },
    { id: 'att3', institutionId: 'uemol', studentId: 'student5', date: '2024-08-01', timeSlot: '8:30-10:15', status: AttendanceStatus.Unexcused, observations: [5, 8] },
    { id: 'att4', institutionId: 'colegio-xyz', studentId: 'student7', date: '2024-08-01', timeSlot: '9:00-10:30', status: AttendanceStatus.Present },
    { id: 'att5', institutionId: 'uemol', studentId: 'student2', date: '2024-08-02', timeSlot: '8:30-10:15', status: AttendanceStatus.Excused, notes: 'Cita médica.' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif1', institutionId: 'uemol', userId: 'teacher1', title: 'Tarea Entregada', message: 'Juan Martinez ha entregado la tarea de Álgebra.', date: '2024-08-14', read: false },
  { id: 'notif2', institutionId: 'uemol', userId: 'teacher1', title: 'Mensaje de un Familiar', message: 'El Sr. Martinez ha enviado un mensaje.', date: '2024-08-13', read: true },
  { id: 'notif3', institutionId: 'uemol', userId: 'parent1', title: 'Falta de Asistencia', message: 'Juan tiene una falta registrada en la primera hora.', date: '2024-08-15', read: false },
  { id: 'notif4', institutionId: 'uemol', userId: 'parent1', title: 'Próximo Examen', message: 'Recordatorio: Examen de Álgebra el 20 de Agosto.', date: '2024-08-12', read: false },
  { id: 'notif5', institutionId: 'uemol', userId: 'student1', title: 'Nueva Actividad', message: 'El Prof. García ha publicado una nueva lectura recomendada.', date: '2024-08-14', read: false },
  { id: 'notif6', institutionId: 'uemol', userId: 'student1', title: 'Examen Próximo', message: 'Tu examen de Álgebra es en 5 días.', date: '2024-08-15', read: true },
];

export const MOCK_SHIFTS: Shift[] = [Shift.Morning, Shift.Afternoon, Shift.Night];

export const MOCK_TIME_SLOTS: TimeSlot[] = [
  { id: 'ts1', institutionId: 'uemol', timetableId: 'tt1', shift: Shift.Morning, startTime: '08:30', endTime: '10:15', isBreak: false },
  { id: 'ts2', institutionId: 'uemol', timetableId: 'tt1', shift: Shift.Morning, startTime: '10:15', endTime: '10:35', isBreak: true },
  { id: 'ts3', institutionId: 'uemol', timetableId: 'tt1', shift: Shift.Morning, startTime: '10:35', endTime: '12:20', isBreak: false },
  { id: 'ts4', institutionId: 'uemol', timetableId: 'tt1', shift: Shift.Morning, startTime: '12:20', endTime: '12:40', isBreak: true },
  { id: 'ts5', institutionId: 'uemol', timetableId: 'tt1', shift: Shift.Morning, startTime: '12:40', endTime: '14:25', isBreak: false },
  { id: 'ts6', institutionId: 'uemol', timetableId: 'tt2', shift: Shift.Afternoon, startTime: '15:00', endTime: '16:45', isBreak: false },
  { id: 'ts7', institutionId: 'colegio-xyz', timetableId: 'tt3', shift: Shift.Morning, startTime: '09:00', endTime: '10:30', isBreak: false },
  { id: 'ts8', institutionId: 'colegio-xyz', timetableId: 'tt3', shift: Shift.Morning, startTime: '10:30', endTime: '10:45', isBreak: true },
  { id: 'ts9', institutionId: 'colegio-xyz', timetableId: 'tt3', shift: Shift.Morning, startTime: '10:45', endTime: '12:15', isBreak: false },
];

export const DAYS_OF_WEEK: ScheduleEntry['day'][] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [
    { day: 'Lunes', timeSlotId: 'ts1', classId: 'class1', subjectId: 'subj1', roomId: 'room1' },
    { day: 'Lunes', timeSlotId: 'ts1', classId: 'class2', subjectId: 'subj2', roomId: 'room2' },
    { day: 'Martes', timeSlotId: 'ts3', classId: 'class2', subjectId: 'subj2', roomId: 'room2' },
    { day: 'Miércoles', timeSlotId: 'ts1', classId: 'class1', subjectId: 'subj1', roomId: 'room1' },
    { day: 'Jueves', timeSlotId: 'ts3', classId: 'class2', subjectId: 'subj2', roomId: 'room2' },
    { day: 'Viernes', timeSlotId: 'ts5', classId: 'class1', subjectId: 'subj1', roomId: 'room1' },
];

export const MOCK_SUPPORT_CONTACTS: SupportContact[] = [
  { id: 'sup1', institutionId: 'uemol', name: 'Centro de Salud Mental Joven', type: 'Salud Mental', phone: '912345678', email: 'info@saludmentaljoven.org', address: 'Calle de la Esperanza 5, 28012 Madrid' },
  { id: 'sup2', institutionId: 'uemol', name: 'Apoyo Legal para Familias', type: 'Apoyo Legal', phone: '918765432', email: 'contacto@apoyolegalfam.es', address: 'Plaza Mayor 10, 28013 Madrid' },
  { id: 'sup3', institutionId: 'uemol', name: 'Centro de Salud Primaria Sol', type: 'Centro de Salud', phone: '061', address: 'Calle Montera 22, 28013 Madrid' },
];

export const MOCK_INTERVENTIONS: Intervention[] = [
    { id: 'int1', institutionId: 'uemol', studentId: 'student1', deceProfessionalId: 'dece2', date: '2024-08-02', type: InterventionType.TeacherReport, summary: 'Prof. García reporta baja participación en clase.' },
    { id: 'int2', institutionId: 'uemol', studentId: 'student1', deceProfessionalId: 'dece2', date: '2024-08-05', type: InterventionType.IndividualSession, summary: 'Primera sesión con el alumno. Se discuten posibles causas de la apatía.' },
    { id: 'int3', institutionId: 'uemol', studentId: 'student1', deceProfessionalId: 'dece1', date: '2024-08-10', type: InterventionType.ParentMeeting, summary: 'Reunión con Sr. Martinez.', participants: ['Lic. Ana Torres', 'Sr. Martinez', 'Juan Martinez'], agreements: 'Compromiso de estudio.' },
    { id: 'int4', institutionId: 'uemol', studentId: 'student2', deceProfessionalId: 'dece2', date: '2024-08-03', type: InterventionType.IndividualSession, summary: 'Sesión de seguimiento sobre técnicas de estudio.'},
];

export const MOCK_VICC_INTERVENTIONS: ViccIntervention[] = [
    { id: 'vicc1', institutionId: 'uemol', studentId: 'student1', vicerrectorId: 'vicerrector1', date: '2024-09-01', type: ViccInterventionType.AcademicMeeting, summary: 'Reunión académica.', participants: ['Lic. Montes', 'Sr. Martinez'], agreements: 'Refuerzo académico.' }
];

export const MOCK_OVP_ACTIVITIES: OvpActivity[] = [
    { id: 'ovp1', institutionId: 'uemol', studentId: 'student1', title: 'Test de Intereses Vocacionales', axis: OvpAxis.SelfKnowledge, status: 'Completada' },
    { id: 'ovp2', institutionId: 'uemol', studentId: 'student1', title: 'Investigar 3 carreras de interés', axis: OvpAxis.Information, status: 'Pendiente' },
    { id: 'ovp3', institutionId: 'uemol', studentId: 'student2', title: 'Charla sobre Bachillerato de Ciencias vs. Letras', axis: OvpAxis.DecisionMaking, status: 'Completada' },
];

export const MOCK_HEALTH_RECORDS: HealthRecord[] = [
    { id: 'hr1', institutionId: 'uemol', studentId: 'student1', allergies: ['Penicilina', 'Nueces'], conditions: ['Asma Leve'], emergencyContact: { name: 'Sr. Martinez', phone: '622333444', relation: 'Padre' }, medications: [{ name: 'Ventolin', dosage: 'S.O.S', notes: '' }], lastCheckup: '2024-03-15' },
    { id: 'hr2', institutionId: 'uemol', studentId: 'student2', allergies: [], conditions: [], emergencyContact: { name: 'Sra. Diaz', phone: '699888777', relation: 'Madre' }, medications: [], lastCheckup: '2024-01-20' },
];

export const MOCK_MEDICAL_VISITS: MedicalVisit[] = [
  { id: 'visit1', institutionId: 'uemol', studentId: 'student1', healthProfessionalId: 'health1', date: '2024-08-10', motive: 'Dolor de cabeza', vitalSigns: { temperature: '37.8', pulse: '90', respiratoryRate: '20', bloodPressure: '110/70' }, anthropometry: { weight: '25', height: '120', imc: '17.4' }, diagnoses: [{ code: 'R51', description: 'Cefalea', type: 'PRE' }], treatmentPlan: { diagnostic: 'Obs', therapeutic: 'Paracetamol', educational: 'Signos alarma' }, isReferred: false },
  { id: 'visit2', institutionId: 'uemol', studentId: 'student1', healthProfessionalId: 'health1', date: '2024-05-20', motive: 'Caída', vitalSigns: { temperature: '36.5', pulse: '85', respiratoryRate: '18', bloodPressure: '105/65' }, anthropometry: { weight: '24.5', height: '119', imc: '17.3' }, diagnoses: [{ code: 'S50.0', description: 'Contusión', type: 'DEF' }], treatmentPlan: { diagnostic: 'N/A', therapeutic: 'Hielo', educational: 'Cuidado herida' }, isReferred: true, referralDetails: 'Radiografía' },
];

export const MOCK_OCR_SUBMISSIONS: OcrSubmission[] = [
    { id: 'ocr1', institutionId: 'uemol', classId: 'class1', uploaderId: 'teacher1', uploadDate: '2024-08-10T10:00:00Z', fileName: 'lista_eso1a.jpg', imageUrl: 'https://placehold.co/800x1100', status: OcrSubmissionStatus.PendingVerification, extractedData: [] },
    { id: 'ocr2', institutionId: 'uemol', classId: 'class1', uploaderId: 'teacher1', uploadDate: '2024-08-09T09:30:00Z', fileName: 'asistencia.png', imageUrl: 'https://placehold.co/800x1100', status: OcrSubmissionStatus.Completed, extractedData: [] },
    { id: 'ocr3', institutionId: 'uemol', classId: 'class2', uploaderId: 'teacher2', uploadDate: '2024-08-11T11:00:00Z', fileName: 'historia.pdf', imageUrl: 'https://placehold.co/800x1100', status: OcrSubmissionStatus.Processing, extractedData: [] }
];

export const MOCK_EXIT_PASSES: ExitPass[] = [
  { id: 'ep1', institutionId: 'uemol', studentId: 'student2', inspectorId: 'inspector1', date: '2024-08-12T11:30:00Z', reason: 'Cita médica dental.', responsibleName: 'Sra. Diaz', responsibleId: '123456789-0' }
];

export const MOCK_CITACIONES: Citacion[] = [
  { id: 'cit1', institutionId: 'uemol', studentId: 'student1', parentId: 'parent1', staffId: 'teacher1', date: '2024-09-15T10:00:00Z', reason: 'Rendimiento académico.', status: CitacionStatus.Sent, creationDate: '2024-09-10T14:00:00Z' }
];

export const MOCK_LECCIONARIO_ENTRIES: LeccionarioEntry[] = [
  { id: 'lec1', institutionId: 'uemol', teacherId: 'teacher1', classId: 'class1', subjectId: 'subj1', date: new Date().toISOString().split('T')[0], timeSlotId: 'ts1', skillCode: 'M.2.1.1.', topics: 'Sumas y restas.', tasks: 'Ejercicios pág 25.', observations: 'Grupo participativo.' }
];

export const MOCK_MICRO_PLANS: MicroPlan[] = [
  { id: 'mp1', institutionId: 'uemol', teacherId: 'teacher1', classId: 'class1', subjectId: 'subj1', academicYear: '2024-2025', unitTitle: 'Unidad 1', unitObjectives: 'Objetivos...', dcdIds: ['dcd-m-1'], duaRepresentation: '...', duaActionExpression: '...', duaEngagement: '...', methodology: '...', resources: '...', evaluation: '...', adaptations: [], status: CurricularPlanStatus.Draft, creationDate: '2024-08-20' },
  { id: 'mp2', institutionId: 'uemol', teacherId: 'teacher2', classId: 'class2', subjectId: 'subj2', academicYear: '2024-08-25', unitTitle: 'Unidad 1', unitObjectives: 'Objetivos...', dcdIds: ['dcd-ll-1'], duaRepresentation: '...', duaActionExpression: '...', duaEngagement: '...', methodology: '...', resources: '...', evaluation: '...', adaptations: [], status: CurricularPlanStatus.PendingReview, creationDate: '2024-08-21' },
  { id: 'mp3', institutionId: 'uemol', teacherId: 'teacher1', classId: 'class1', subjectId: 'subj1', academicYear: '2024-08-15', unitTitle: 'Unidad 2', unitObjectives: 'Objetivos...', dcdIds: ['dcd-m-1'], duaRepresentation: '...', duaActionExpression: '...', duaEngagement: '...', methodology: '...', resources: '...', evaluation: '...', adaptations: [], status: CurricularPlanStatus.Approved, creationDate: '2024-08-15' },
];

export const MOCK_EVALUATION_CRITERIA: EvaluationCriterion[] = [
  { id: 'ce-ll-4-1', institutionId: 'uemol', code: 'CE.LL.4.1.', description: 'Criterio LL', subjectId: 'subj2', gradeLevel: 'EGB Superior' },
  { id: 'ce-ll-4-2', institutionId: 'uemol', code: 'CE.LL.4.2.', description: 'Criterio LL 2', subjectId: 'subj2', gradeLevel: 'EGB Superior' },
  { id: 'ce-m-4-1', institutionId: 'uemol', code: 'CE.M.4.1.', description: 'Criterio M', subjectId: 'subj1', gradeLevel: 'EGB Superior' },
];

export const MOCK_EVALUATION_INDICATORS: EvaluationIndicator[] = [
  { id: 'ie-ll-4-1-1', institutionId: 'uemol', code: 'I.LL.4.1.1.', description: 'Indicador LL', criterionId: 'ce-ll-4-1' },
  { id: 'ie-ll-4-2-1', institutionId: 'uemol', code: 'I.LL.4.2.1.', description: 'Indicador LL 2', criterionId: 'ce-ll-4-2' },
];

export const MOCK_DCDS: Dcd[] = [
  { id: 'dcd-m-1', institutionId: 'uemol', code: 'M.4.1.1.', description: 'Destreza M', subjectId: 'subj1', gradeLevel: 'EGB Superior', criterionId: 'ce-m-4-1', competencies: ['Lógico-Matemática'], curricularInsertions: ['Educación Financiera'], isDisaggregated: false },
  { id: 'dcd-ll-1', institutionId: 'uemol', code: 'LL.4.1.1.', description: 'Destreza LL', subjectId: 'subj2', gradeLevel: 'EGB Superior', criterionId: 'ce-ll-4-1', competencies: ['Comunicacional'], curricularInsertions: ['Socioemocional'], isDisaggregated: false },
  { id: 'dcd-ll-2', institutionId: 'uemol', code: 'LL.4.1.3.', description: 'Destreza LL 2', subjectId: 'subj2', gradeLevel: 'EGB Superior', criterionId: 'ce-ll-4-2', competencies: ['Comunicacional'], curricularInsertions: ['Educación para el Desarrollo Sostenible'], isDisaggregated: true, refCode: 'LL.4.1.3' }
];

// Helper to create empty trimester records
const createEmptyTrimester = (): TrimesterRecord => ({ actividades: Array(5).fill(null).map(() => ({ promedio: 0, activityId: undefined })), promedioFormativas: 0, portafolio: { promedio: 0 }, evaluacionSumativa: { promedio: 0 }, proyectoIntegrador: { promedio: 0 }, sumaTrimestre: 0 });
const createEmptyStudentGradebook = (studentId: string): StudentGradebook => ({ studentId, trimester1: createEmptyTrimester(), trimester2: createEmptyTrimester(), trimester3: createEmptyTrimester(), mejorasUtilizadas: 0, promedioTrimestralFinal: 0, notaAnual90: 0, proyectoFinal10: { promedio: 0 }, notaFinal100: 0, observacionFinal: 'Pendiente' });

export const MOCK_GRADEBOOKS: Gradebook[] = [
  { id: 'gb1', institutionId: 'uemol', classId: 'class1', subjectId: 'subj1', records: [ { studentId: 'student1', trimester1: { actividades: [ { activityId: 'act1', nota: 8, mejora: 9, promedio: 9 }, { activityId: 'act3', nota: 7, promedio: 7 }, { promedio: 0 }, { nota: 6, refuerzo: 7, promedio: 7 }, { nota: 8, promedio: 8 } ], promedioFormativas: 8.0, portafolio: { nota: 10, promedio: 10 }, evaluacionSumativa: { nota: 7.5, promedio: 7.5 }, proyectoIntegrador: { nota: 8, promedio: 8 }, sumaTrimestre: 8.08 }, trimester2: createEmptyTrimester(), trimester3: createEmptyTrimester(), mejorasUtilizadas: 1, promedioTrimestralFinal: 0, notaAnual90: 0, proyectoFinal10: { promedio: 0 }, notaFinal100: 0, observacionFinal: 'Pendiente' }, { studentId: 'student3', trimester1: { actividades: [ { activityId: 'act1', nota: 5, promedio: 5 }, { activityId: 'act3', nota: 6, promedio: 6 }, { nota: 7, promedio: 7 }, { nota: 5, refuerzo: 6, promedio: 6 }, { nota: 7, promedio: 7 } ], promedioFormativas: 6.2, portafolio: { nota: 8, promedio: 8 }, evaluacionSumativa: { nota: 6, promedio: 6 }, proyectoIntegrador: { nota: 7, promedio: 7 }, sumaTrimestre: 6.44 }, trimester2: createEmptyTrimester(), trimester3: createEmptyTrimester(), mejorasUtilizadas: 0, promedioTrimestralFinal: 0, notaAnual90: 0, proyectoFinal10: { promedio: 0 }, notaFinal100: 0, observacionFinal: 'Pendiente' }, createEmptyStudentGradebook('student5') ] }
];

export const MOCK_DISCIPLINARY_ACTIONS: DisciplinaryAction[] = [
    { id: 'da1', institutionId: 'uemol', studentId: 'student3', date: '2024-09-10', infraction: 'Incumplimiento', description: 'Uso de móvil.', severity: DisciplinarySeverity.Serious, status: 'En Proceso', actionsTaken: 'Retiro.' }
];

export const MOCK_INSPECTION_VISITS: InspectionVisit[] = [
    { id: 'iv1', institutionId: 'uemol', inspectorId: 'inspector1', date: '2024-09-05', type: 'Ordinaria', target: 'Laboratorios', findings: 'Falta señalética.', status: 'Realizada' }
];

export const MOCK_CONFLICT_MEDIATIONS: ConflictMediation[] = [
    { id: 'cm1', institutionId: 'uemol', date: '2024-10-01', partiesInvolved: ['student1', 'student2'], description: 'Disputa verbal.', status: 'En Mediación', agreements: '' }
];

export const MOCK_QUALITY_METRICS: QualityMetric[] = [
    { id: 'qm1', institutionId: 'uemol', year: '2024', category: 'Asistencia', metric: 'Tasa Global', value: 92.5, target: 95 },
    { id: 'qm2', institutionId: 'uemol', year: '2024', category: 'Rendimiento', metric: 'Promedio Matemáticas', value: 7.8, target: 8.0 }
];

export const MOCK_REINFORCEMENT_PLANS: ReinforcementPlan[] = [
    { id: 'rp1', institutionId: 'uemol', studentId: 'student1', subjectId: 'subj1', teacherId: 'teacher1', tutorId: 'teacher2', academicYear: '2025-2026', status: 'In_Progress', nominationDate: '2024-09-10', nominationObservations: 'Dificultades...', modalidad: 'extra_class', groupType: 'small_group', schedule: 'Ma/Ju 14:00', duration: '6 sem', startDate: '2024-09-15', generalObjective: 'Fortalecer...', topics: [{ dcd: 'M.4.1.1.', strategies: '...', resources: '...', evaluationCriteria: '...' }], notificationDate: '2024-09-12', parentConsented: true, parentConsentDate: '2024-09-13', sessions: [{ id: 'sess1', date: '2024-09-15', attendance: true, skillsReinforced: '...', achievements: '...', observations: '...' }] },
    { id: 'rp2', institutionId: 'uemol', studentId: 'student3', subjectId: 'subj-ll', teacherId: 'teacher2', tutorId: 'teacher2', academicYear: '2025-2026', status: 'Nominated', nominationDate: '2024-10-01', nominationObservations: 'Bajo rendimiento...', topics: [], sessions: [], parentConsented: false }
];

export const MOCK_FORMAL_REQUESTS: FormalRequest[] = [
    {
        id: 'req1',
        institutionId: 'uemol',
        requesterId: 'teacher1',
        recipientRole: Role.Vicerrector,
        type: 'Time Off',
        subject: 'Permiso por cita médica',
        details: 'Solicito permiso para ausentarme el día 25 de octubre por una cita médica programada.',
        attachmentUrl: 'https://example.com/medical_note.pdf',
        status: 'Pending',
        submissionDate: '2024-10-20T09:00:00Z',
    },
    {
        id: 'req2',
        institutionId: 'uemol',
        requesterId: 'teacher2',
        recipientRole: Role.Rector,
        type: 'Supply Request',
        subject: 'Solicitud de materiales para laboratorio',
        details: 'Se requieren reactivos para las prácticas de química del próximo mes.',
        attachmentUrl: '',
        status: 'Approved',
        submissionDate: '2024-10-15T14:30:00Z',
        resolutionDate: '2024-10-16T10:00:00Z',
        resolverId: 'admin1',
        resolutionComments: 'Materiales aprobados, se realizará la compra en la próxima semana.'
    },
];

export const MOCK_STAFF_ATTENDANCE: StaffAttendanceRecord[] = [
    { id: 'sa1', institutionId: 'uemol', userId: 'teacher1', date: '2024-10-20', punches: [{ time: '07:55:00', type: 'in', method: 'Biometric' }] },
    { id: 'sa2', institutionId: 'uemol', userId: 'teacher1', date: '2024-10-21', punches: [{ time: '08:05:00', type: 'in', method: 'Biometric', location: { latitude: -0.2111, longitude: -78.4891 } }] },
    { id: 'sa3', institutionId: 'uemol', userId: 'teacher2', date: '2024-10-20', punches: [{ time: '08:00:00', type: 'in', method: 'Manual' }] },
    { id: 'sa4', institutionId: 'uemol', userId: 'teacher4', date: '2024-10-21', punches: [{ time: '07:28:00', type: 'in', method: 'Biometric' }, { time: '12:00:00', type: 'out_break', method: 'Biometric' }, { time: '12:45:00', type: 'in_break', method: 'Biometric' }, { time: '16:00:00', type: 'out', method: 'Biometric', location: { latitude: -0.2115, longitude: -78.4895 } }] },
    { id: 'sa5', institutionId: 'uemol', userId: 'teacher1', date: '2024-10-22', punches: [{ time: '07:58:00', type: 'in', method: 'Biometric' }] },
];

export const MOCK_TRAINING_SESSIONS: TrainingSession[] = [
    {
        id: 'train1',
        institutionId: 'uemol',
        title: 'Taller sobre Metodología DUA',
        date: '2024-08-25',
        duration: '4 horas',
        topic: 'Implementación del DUA en la planificación microcurricular',
        trainer: 'MSc. Laura Torres',
        attendees: ['teacher1', 'teacher2', 'teacher4']
    }
];

export const MOCK_INSTITUTIONAL_DOCUMENTS: InstitutionalDocument[] = [
    {
        id: 'doc1',
        institutionId: 'uemol',
        type: 'PEI',
        title: 'Proyecto Educativo Institucional 2024-2028',
        status: 'Vigente',
        lastUpdated: '2024-05-10',
        version: '1.0'
    },
    {
        id: 'doc2',
        institutionId: 'uemol',
        type: 'PCI',
        title: 'Plan Curricular Institucional',
        status: 'Revisión',
        lastUpdated: '2024-08-20',
        version: '2.3'
    }
];

export const MOCK_MEETING_RECORDS: MeetingRecord[] = [
    {
        id: 'meet1',
        institutionId: 'uemol',
        type: 'Junta de Curso',
        date: '2024-10-30',
        title: 'Junta de 1er Trimestre - ESO 1ºA',
        summary: 'Análisis de rendimiento académico y comportamental.',
        agreements: 'Refuerzo académico para 3 estudiantes en Matemáticas.',
        attendees: ['teacher1', 'teacher2', 'vicerrector1', 'dece1']
    }
];

export const MOCK_TRAINING_PLANS: TrainingPlan[] = [
    {
        id: 'tp1',
        institutionId: 'uemol',
        academicYear: '2025-2026',
        title: 'Plan de Fortalecimiento Pedagógico DUA',
        objectives: 'Capacitar al 100% de la planta docente en estrategias de Diseño Universal para el Aprendizaje y manejo de adaptaciones curriculares.',
        justification: 'Necesidad detectada en el informe del DECE sobre el incremento de estudiantes con NEE y reporte de Juntas de Curso.',
        transversalThemes: ['Inclusión Educativa', 'Derechos Humanos'],
        methodology: 'Talleres prácticos con modelado y acompañamiento áulico posterior.',
        status: 'In_Progress',
        courses: [
            {
                id: 'tc1',
                planId: 'tp1',
                title: 'Estrategias DUA en el Aula: Principio de Representación',
                instructor: 'MSc. Laura Torres',
                startDate: '2024-09-01',
                endDate: '2024-09-05',
                durationHours: 20,
                modality: 'Híbrida',
                type: 'Interna',
                enrolledTeachers: [
                    { teacherId: 'teacher1', attendancePercentage: 100, finalGrade: 9.5, status: 'Aprobado' },
                    { teacherId: 'teacher2', attendancePercentage: 80, finalGrade: 8.0, status: 'Aprobado' }
                ]
            },
             {
                id: 'tc2',
                planId: 'tp1',
                title: 'Evaluación Diferenciada',
                instructor: 'Dr. Carlos Vera',
                startDate: '2024-10-15',
                endDate: '2024-10-20',
                durationHours: 40,
                modality: 'Presencial',
                type: 'Interna',
                enrolledTeachers: []
            }
        ]
    }
];

export const MOCK_RUBRICS: Rubric[] = [
    {
        id: 'rub1',
        institutionId: 'uemol',
        title: 'Rúbrica de Debate (EGB Superior)',
        description: 'Evaluación de argumentación y expresión oral.',
        scaleType: 'Quantitative',
        levels: [
            { id: 'l1', rubricId: 'rub1', label: 'Domina', value: 10, order: 4, color: 'bg-green-100' },
            { id: 'l2', rubricId: 'rub1', label: 'Adquirido', value: 8, order: 3, color: 'bg-blue-100' },
            { id: 'l3', rubricId: 'rub1', label: 'En Proceso', value: 6, order: 2, color: 'bg-yellow-100' },
            { id: 'l4', rubricId: 'rub1', label: 'Inicio', value: 4, order: 1, color: 'bg-red-100' }
        ],
        criteria: [
            { id: 'c1', rubricId: 'rub1', description: 'Argumentación y Evidencia', weight: 50 },
            { id: 'c2', rubricId: 'rub1', description: 'Expresión Oral y Corporal', weight: 30 },
            { id: 'c3', rubricId: 'rub1', description: 'Respeto y Escucha Activa', weight: 20 }
        ],
        descriptors: [
            { criteriaId: 'c1', levelId: 'l1', description: 'Argumentos sólidos respaldados por fuentes confiables.' },
            { criteriaId: 'c1', levelId: 'l2', description: 'Argumentos claros con alguna evidencia.' },
            { criteriaId: 'c1', levelId: 'l3', description: 'Argumentos débiles o sin evidencia suficiente.' },
            { criteriaId: 'c1', levelId: 'l4', description: 'No presenta argumentos coherentes.' },
            // ... descriptors for c2 and c3 would go here
        ]
    }
];

export const MOCK_REPOSITORY_ITEMS: ResourceRepositoryItem[] = [
    {
        id: 'res1',
        institutionId: 'uemol',
        authorId: 'teacher1',
        title: 'La Tienda Matemática (Juego de Roles)',
        description: 'Actividad práctica para reforzar operaciones básicas con números enteros en un contexto real.',
        level: 'EGB',
        gradeLevel: 'EGB Superior',
        type: 'Activity',
        areaOfKnowledge: 'Matemática',
        dcdIds: ['dcd-m-1'], // M.4.1.1
        curricularInsertions: ['Educación Financiera'],
        competencies: ['Lógico-Matemática', 'Socioemocional'],
        duaRepresentation: 'Uso de billetes didácticos y lista de precios visual.',
        duaActionExpression: 'Los estudiantes pueden calcular mentalmente, usar papel o calculadora. Deben verbalizar la transacción.',
        duaEngagement: 'Gamificación: Simulación de compra-venta competitiva.',
        rubricId: 'rub1', // Linked Rubric
        shared: true,
        creationDate: '2024-09-10T10:00:00Z',
        resourceLinks: ['https://example.com/billetes_imprimibles.pdf']
    },
    {
        id: 'res2',
        institutionId: 'uemol',
        authorId: 'teacher2',
        title: 'Proyecto: Huerto Escolar Sostenible',
        description: 'Proyecto interdisciplinario para crear y mantener un huerto, aplicando conocimientos de Ciencias, Matemáticas y Lengua.',
        level: 'EGB',
        type: 'Project',
        isInterdisciplinary: true,
        generativeTopic: 'Soberanía Alimentaria y Vida Saludable',
        finalProduct: 'Cosecha y Feria de Platos Saludables',
        curricularInsertions: ['Educación para el Desarrollo Sostenible'],
        competencies: ['Comunicacional', 'Lógico-Matemática', 'Digital'],
        dcdIds: ['dcd-cn-1', 'dcd-m-1'], // Mock IDs
        phases: [
            { name: 'Fase 1: Investigación de Suelos', trimester: 1, description: 'Análisis de tipos de tierra y semillas (Ciencias).' },
            { name: 'Fase 2: Diseño y Siembra', trimester: 2, description: 'Cálculo de áreas y perímetros para parcelas (Matemáticas).' },
            { name: 'Fase 3: Cosecha y Reporte', trimester: 3, description: 'Elaboración de informe y feria (Lengua).' }
        ],
        duaEngagement: 'Aprendizaje basado en la naturaleza y trabajo colaborativo al aire libre.',
        shared: true,
        creationDate: '2024-08-15T09:00:00Z',
    }
];

export const MOCK_SUBJECT_REPORTS: SubjectReport[] = [
    {
        id: 'sr1',
        institutionId: 'uemol',
        classId: 'class1',
        subjectId: 'subj1',
        teacherId: 'teacher1',
        trimester: 1,
        academicYear: '2025-2026',
        status: 'Submitted',
        dcdsCovered: ['M.3.1.4.', 'M.3.1.14.', 'M.3.1.30.', 'M.3.2.11.'],
        difficulties: [
            {
                studentId: 'student1',
                difficulty: 'Dificultad en operaciones básicas',
                cause: 'Vacíos de años anteriores',
                measure: 'Refuerzo en clase',
                results: 'Mejora parcial',
                minGrade: 6,
                improvedGrade: 7.5
            }
        ],
        conclusions: 'El rendimiento general es satisfactorio. Se ha cubierto el 80% de lo planificado.',
        recommendations: 'Continuar con el refuerzo académico para estudiantes con rezago.',
        submissionDate: '2024-11-20'
    }
];

export const MOCK_JUNTAS: JuntaDeCurso[] = [
    {
        id: 'junta1',
        institutionId: 'uemol',
        classId: 'class1',
        trimester: 1,
        academicYear: '2025-2026',
        status: 'Planned',
        date: '2024-11-25',
        reportIds: ['sr1'],
    }
];

// --- MOCK PROTOCOL CASES ---

export const MOCK_PROTOCOL_CASES: ProtocolCase[] = [
    {
        id: 'case-001',
        institutionId: 'uemol',
        studentId: 'student1',
        dateDetected: '2024-10-25',
        detectedBy: 'teacher1',
        detectionMethod: 'Observación Directa',
        violenceType: 'Física',
        scope: 'Entre Pares',
        severity: 'Conflicto Escolar',
        isSexualViolence: false,
        denunciaFiled: false,
        status: 'Intervención',
        description: 'Pelea en el recreo con otro estudiante. Hematomas leves.',
        indicators: ['Marcas físicas'],
        actionsTaken: 'Separación inmediata, diálogo con ambos estudiantes.',
    },
    {
        id: 'case-002',
        institutionId: 'uemol',
        studentId: 'student2',
        dateDetected: '2024-10-26', // Recent
        detectedBy: 'teacher2',
        detectionMethod: 'Relato',
        violenceType: 'Sexual',
        scope: 'Intrafamiliar',
        severity: 'Vulneración de Derechos/Delito',
        isSexualViolence: true,
        denunciaFiled: false,
        denunciaDeadline: '2024-10-27T10:00:00Z', // 24h deadline
        status: 'Detección',
        description: 'Estudiante relata situación de abuso en el hogar.',
        indicators: ['Cambios de conducta', 'Relato espontáneo'],
        actionsTaken: 'Escucha activa, contención emocional inicial.',
    }
];
