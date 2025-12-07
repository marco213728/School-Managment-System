export enum Role {
  SuperAdmin = 'Super Administrador',
  InstitutionAdmin = 'Administrador de Institución',
  Teacher = 'Profesor',
  Parent = 'Familiar',
  Student = 'Alumno',
  JefeDECE = 'Jefe DECE',
  PsicologoEducativo = 'Psicólogo Educativo',
  TrabajadorSocial = 'Trabajador Social',
  HealthProfessional = 'Profesional de Salud',
  Vicerrector = 'Vicerrector',
  InspectorGeneral = 'Inspector General',
  Rector = 'Rector', // Added for formal requests
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  institutionId?: string; // Optional for SuperAdmin
  classIds?: string[]; // For teachers and students
  childId?: string; // For parents
  phone?: string;
  address?: string;
  maxMonthlyHours?: number;
  // Staff Attendance Fields
  biometricRegistered?: boolean;
  accessPin?: string;
  // Added workSchedule for staff attendance calculations
  workSchedule?: {
    Lunes?: { startTime: string; endTime: string; };
    Martes?: { startTime: string; endTime: string; };
    Miércoles?: { startTime: string; endTime: string; };
    Jueves?: { startTime: string; endTime: string; };
    Viernes?: { startTime: string; endTime: string; };
  };
}

export interface Timetable {
  id: string;
  institutionId: string;
  name: string; // e.g., "Horario Primaria Mañana"
  shift: Shift;
}

export interface Class {
  id: string;
  institutionId: string;
  name: string; // e.g., "ESO 1ºA"
  studentIds: string[];
  timetableId?: string;
}

export interface RelatedContact {
  id: string;
  relation: string; // Padre, Madre, Tía, etc.
  name: string;
  occupation?: string;
  phone?: string;
  email?: string;
}

export interface Student {
  id:string;
  institutionId: string;
  name: string;
  classId: string;
  parentId: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  grade?: string;
  listNumber?: number;
  nationalId?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: 'FEMENINO' | 'MASCULINO' | 'OTRO';
  homeLocationLink?: string;
  relatedContacts?: RelatedContact[];
}

export enum ActivityType {
  Homework = 'Deberes',
  OptionalHomework = 'Deberes Opcionales',
  Reading = 'Lectura Recomendada',
  Exam = 'Examen',
}

export const EVALUATION_CATEGORIES = {
  'ACTIVIDAD_INDIVIDUAL': 'Actividad Individual',
  'ACTIVIDAD_GRUPAL': 'Actividad Grupal',
  'PORTAFOLIO': 'Portafolio/Bitácora',
  'EVALUACION_SUMATIVA': 'Evaluación Sumativa',
  'PROYECTO_INTEGRADOR': 'Proyecto Integrador'
} as const;

export type EvaluationCategory = keyof typeof EVALUATION_CATEGORIES;


export interface Activity {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  type: ActivityType;
  deliveryDate: string;
  trimester: 1 | 2 | 3;
  evaluationCategory: EvaluationCategory;
  gradebookIndex?: 0 | 1 | 2 | 3 | 4; // for 'actividades' array index
  
  // Curricular Linking
  microPlanId?: string; // Link to PUD (Planificación Microcurricular)
  dcdId?: string; // Link to specific DCD (Destreza con Criterio de Desempeño)
  duaPrinciple?: 'representation' | 'actionExpression' | 'engagement'; // DUA Principle addressed
}

export enum AttendanceStatus {
  Present = 'Presente',
  Tardy = 'Atraso',
  Unexcused = 'Falta Injustificada',
  Excused = 'Falta Justificada',
  Absent = 'Ausente',
  JustificationPending = 'Justificación Pendiente',
}

export interface AttendanceRecord {
  id: string;
  institutionId: string;
  studentId: string;
  date: string;
  timeSlot: string;
  status: AttendanceStatus;
  notes?: string;
  justificationNotes?: string;
  justificationDocumentUrl?: string;
  observations?: number[];
}

export interface Notification {
  id: string;
  institutionId: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface SupportContact {
  id: string;
  institutionId: string;
  name: string;
  type: 'Salud Mental' | 'Apoyo Legal' | 'Centro de Salud' | 'Servicios Sociales';
  phone: string;
  email?: string;
  address: string;
}

// DECE Module Types
export enum InterventionType {
  Call = 'Llamada a Familiar',
  ParentMeeting = 'Reunión con Familiar',
  IndividualSession = 'Sesión Individual',
  TeacherReport = 'Reporte de Profesor',
  GroupSession = 'Sesión Grupal',
}

export interface Intervention {
  id: string;
  institutionId: string;
  studentId: string;
  deceProfessionalId: string;
  date: string;
  type: InterventionType;
  summary: string;
  participants?: string[]; // Names of participants, one per line
  agreements?: string; // Markdown or plain text of agreements
}

// Vicerrectorado Module Types
export enum ViccInterventionType {
  AcademicMeeting = 'Reunión Académica',
  DisciplinaryFollowUp = 'Seguimiento Disciplinario',
  CurricularAdaptation = 'Adaptación Curricular',
  ParentOrientation = 'Orientación a Padres',
}

export interface ViccIntervention {
  id: string;
  institutionId: string;
  studentId: string;
  vicerrectorId: string;
  date: string;
  type: ViccInterventionType;
  summary: string;
  participants?: string[];
  agreements?: string;
}

export interface RubricCriterion {
  id: string;
  category: string; // Planificación, Metodología, Clima, etc.
  description: string;
  maxScore: number; // Usually 4
}

export interface RubricScore {
  criteriaId: string;
  score: number; // 1-4
  evidence?: string;
}

export interface ClassroomVisit {
  id: string;
  institutionId: string;
  teacherId: string;
  observerId: string; // Vicerrector or delegate
  date: string; // Scheduled date
  startTime?: string;
  className: string;
  subject: string;
  topic?: string;
  focus: string; // e.g., "Uso de TIC", "Adaptación Curricular", "Metodología DUA"
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  
  // Execution Data
  scores?: RubricScore[];
  strengths?: string;
  weaknesses?: string; // Or "Areas for Improvement"
  agreements?: string; // Compromisos
  rating?: number; // Calculated average (e.g. 3.5/4)
  feedbackDate?: string;
}

export interface ClassroomObservation {
  id: string;
  institutionId: string;
  teacherId: string;
  observerId: string; 
  date: string;
  className: string;
  subject: string;
  topic: string;
  strengths: string;
  recommendations: string;
  rating: number; 
}

export interface TrainingSession {
  id: string;
  institutionId: string;
  title: string;
  date: string;
  duration: string;
  topic: string;
  trainer: string;
  attendees: string[]; // Teacher IDs
}

export interface InstitutionalDocument {
  id: string;
  institutionId: string;
  type: 'PEI' | 'PCI' | 'PCA' | 'CodigoConvivencia' | 'PlanGestionRiesgos';
  title: string;
  status: 'Borrador' | 'Revisión' | 'Aprobado' | 'Vigente';
  lastUpdated: string;
  version: string;
  url?: string;
}

export interface MeetingRecord {
    id: string;
    institutionId: string;
    type: 'Junta de Curso' | 'Junta de Área' | 'Comisión Pedagógica';
    date: string;
    title: string;
    summary: string;
    agreements: string;
    attendees: string[];
}

// Inspection Module Types
export enum DisciplinarySeverity {
  Minor = 'Leve',
  Serious = 'Grave',
  VerySerious = 'Muy Grave'
}

export interface DisciplinaryAction {
  id: string;
  institutionId: string;
  studentId: string;
  date: string;
  infraction: string; // Linked to article/code
  description: string;
  severity: DisciplinarySeverity;
  status: 'Abierto' | 'En Proceso' | 'Cerrado';
  actionsTaken: string;
}

export interface InspectionVisit {
  id: string;
  institutionId: string;
  inspectorId: string;
  date: string;
  type: 'Ordinaria' | 'Extraordinaria' | 'Auditoría';
  target: string; // e.g., "Área de Matemáticas", "Secretaría"
  findings: string;
  status: 'Programada' | 'Realizada' | 'Informe Pendiente';
}

export interface ConflictMediation {
  id: string;
  institutionId: string;
  date: string;
  partiesInvolved: string[]; // Names or IDs
  description: string;
  status: 'Pendiente' | 'En Mediación' | 'Resuelto';
  agreements: string;
}

export interface QualityMetric {
  id: string;
  institutionId: string;
  year: string;
  category: 'Asistencia' | 'Rendimiento' | 'Convivencia';
  metric: string;
  value: number;
  target: number;
}


export enum OvpAxis {
  SelfKnowledge = 'Autoconocimiento',
  Information = 'Información',
  DecisionMaking = 'Toma de Decisiones',
}

export interface OvpActivity {
  id: string;
  institutionId: string;
  studentId: string;
  title: string;
  axis: OvpAxis;
  status: 'Pendiente' | 'Completada';
}

export interface HealthRecord {
  id: string;
  institutionId: string;
  studentId: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medications: {
    name: string;
    dosage: string;
    notes: string;
  }[];
  lastCheckup: string;
}

export interface Diagnosis {
  code: string; // CIE-10 code
  description: string;
  type: 'PRE' | 'DEF'; // Presuntivo o Definitivo
}

export interface MedicalVisit {
  id: string;
  institutionId: string;
  studentId: string;
  healthProfessionalId: string;
  date: string; // ISO string date
  motive: string;
  vitalSigns: {
    temperature: string;
    pulse: string;
    respiratoryRate: string;
    bloodPressure: string;
  };
  anthropometry: {
    weight: string;
    height: string;
    imc: string;
  };
  diagnoses: Diagnosis[];
  treatmentPlan: {
    diagnostic: string;
    therapeutic: string;
    educational: string;
  };
  isReferred: boolean;
  referralDetails?: string;
}

export interface AcademicCalendarEvent {
  id: string;
  institutionId: string;
  name: string; // "Independencia de Guayaquil", "Vacaciones de Navidad"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface Institution {
  id: string;
  name: string;
  codeAMIE?: string;
  logoUrl: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  branding?: {
    primaryColor: string;
    secondaryColor: string;
  };
  activeModules?: {
    dece: boolean;
    health: boolean;
  };
  adminIds?: string[];
  methodologyFocus?: 'DUA' | 'Tradicional'; // Added for DUA compliance
  communicationChannels?: {
    email: { enabled: boolean };
    sms: { enabled: boolean };
    internalMessaging: { enabled: boolean };
    pushNotifications: { enabled: boolean };
    phoneCalls: { enabled: boolean };
    socialMedia: { enabled: boolean };
    circulars: { enabled: boolean };
  };
  automatedNotifications?: {
    absences: {
      enabled: boolean;
      channel: 'email' | 'sms' | 'internalMessaging';
      template: string;
    };
    discipline: {
      enabled: boolean;
      channel: 'email' | 'internalMessaging';
      template: string;
    };
    healthEmergencies: {
      enabled: boolean;
      channel: 'email' | 'sms' | 'phoneCalls';
      template: string;
    };
    events: {
      enabled: boolean;
      channel: 'internalMessaging' | 'email';
      template: string;
    };
    grades: {
      enabled: boolean;
      channel: 'internalMessaging';
      template: string;
    };
    checkInOut: {
      enabled: boolean;
      channel: 'sms' | 'pushNotifications';
      template: string;
    };
  };
  academicYear?: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  };
}


export enum OcrSubmissionStatus {
    Processing = 'Procesando',
    PendingVerification = 'Pendiente de Verificación',
    Completed = 'Completado',
    Failed = 'Error',
}

export interface ExtractedAttendance {
    studentName: string;
    detectedStatus: string;
    confidence: number; // 0 to 1
    correctedStatus?: AttendanceStatus;
}

export interface OcrSubmission {
    id: string;
    institutionId: string;
    classId: string;
    uploaderId: string;
    uploadDate: string;
    fileName: string;
    imageUrl: string;
    status: OcrSubmissionStatus;
    extractedData: ExtractedAttendance[];
}

export enum Shift {
  Morning = 'Matutina',
  Afternoon = 'Vespertina',
  Night = 'Nocturna',
}

export interface TimeSlot {
  id: string;
  institutionId: string;
  timetableId: string;
  shift: Shift;
  startTime: string; // "08:30"
  endTime: string; // "10:15"
  isBreak: boolean;
}

export const AREAS_OF_KNOWLEDGE = [
  'Lengua y Literatura',
  'Matemática',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Lengua Extranjera',
  'Educación Física',
  'Educación Cultural y Artística',
  'Interdisciplinar',
  'Áreas Técnicas',
  'Acompañamiento Integral',
  'Cívica y Acompañamiento Integral', // Updated for new curriculum
  'Currículo Integral'
] as const;
export type AreaOfKnowledge = typeof AREAS_OF_KNOWLEDGE[number];

export const SUBJECT_LEVELS = ['EGB', 'BGU', 'Todos'] as const;
export type SubjectLevel = typeof SUBJECT_LEVELS[number];

export interface Subject {
  id: string;
  institutionId: string;
  name: string;
  teacherId: string;
  maxWeeklyHours?: number;
  areaOfKnowledge: AreaOfKnowledge;
  level: SubjectLevel;
  isModule?: boolean;
}

export interface Room {
  id: string;
  institutionId: string;
  name: string; // 'Aula 101', 'Laboratorio de Química'
}

export interface ScheduleEntry {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  timeSlotId: string; // ID from TimeSlot
  classId: string;
  subjectId: string;
  roomId: string;
}

export interface ExitPass {
  id: string;
  institutionId: string;
  studentId: string;
  inspectorId: string;
  date: string; // ISO string
  reason: string;
  responsibleName: string;
  responsibleId: string; // National ID
}

export enum CitacionStatus {
  Sent = 'Enviada',
  Confirmed = 'Confirmada',
  Completed = 'Realizada',
}

export interface Citacion {
  id: string;
  institutionId: string;
  studentId: string;
  parentId: string;
  staffId: string; // User ID of the teacher, DECE, inspector, etc.
  date: string; // ISO string for the appointment
  reason: string;
  status: CitacionStatus;
  creationDate: string; // ISO string when it was created
}

export interface LeccionarioEntry {
  id: string;
  institutionId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  timeSlotId: string;
  skillCode: string;
  topics: string;
  tasks: string;
  observations: string;
}

// Curricular Planning Module Types
export enum CurricularPlanStatus {
  Draft = 'Borrador',
  PendingReview = 'Pendiente de Revisión',
  RequiresAdjustments = 'Requiere Ajustes',
  Approved = 'Aprobado',
}

export interface AdaptacionCurricular {
  studentId: string;
  dcdModificada: string;
  grade: '3'; // DUA covers Grade 1 & 2, so we only track Grade 3
}

export interface MicroPlan {
  id: string;
  institutionId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  academicYear: string;
  unitTitle: string;
  unitObjectives: string;
  dcdIds: string[];
  
  // DUA Methodology Integration
  duaRepresentation: string; // Principle 1: Representation (What)
  duaActionExpression: string; // Principle 2: Action & Expression (How)
  duaEngagement: string; // Principle 3: Engagement (Why)
  
  // Legacy field for backward compatibility (optional or computed)
  methodology?: string; 

  resources: string;
  evaluation: string;
  adaptations: AdaptacionCurricular[];
  status: CurricularPlanStatus;
  // Workflow fields
  creationDate: string;
  submittedDate?: string;
  reviewDate?: string;
  reviewerId?: string;
  reviewComments?: string;
}

// Curriculum Repository Types
export const GRADE_LEVELS = ['EGB Preparatoria', 'EGB Elemental', 'EGB Media', 'EGB Superior', 'BGU'] as const;
export type GradeLevel = typeof GRADE_LEVELS[number];

export const COMPETENCIES = ['Comunicacional', 'Lógico-Matemática', 'Digital', 'Socioemocional'] as const;
export type Competency = typeof COMPETENCIES[number];

export const CURRICULAR_INSERTIONS = [
  'Educación Cívica, Ética e Integridad',
  'Educación para el Desarrollo Sostenible',
  'Educación Financiera',
  'Educación para la Seguridad Vial y Movilidad Sostenible',
  'Socioemocional',
] as const;
export type CurricularInsertion = typeof CURRICULAR_INSERTIONS[number];

export interface EvaluationCriterion {
  id: string;
  institutionId: string;
  code: string;
  description: string;
  subjectId: string;
  gradeLevel: GradeLevel;
}

export interface EvaluationIndicator {
  id: string;
  institutionId: string;
  code: string;
  description: string;
  criterionId: string;
}

export interface Dcd {
  id: string;
  institutionId: string;
  code: string;
  description: string;
  subjectId: string;
  gradeLevel: GradeLevel;
  criterionId: string;
  competencies: Competency[];
  curricularInsertions?: CurricularInsertion[];
  isDisaggregated?: boolean; // Flag for disaggregation
  refCode?: string; // Code of the original skill if disaggregated
}

// Teacher Gradebook Module Types
export interface GradeEntry {
  activityId?: string;
  nota?: number;
  mejora?: number;
  refuerzo?: number;
  promedio: number;
}

export interface TrimesterRecord {
  // Evaluaciones Formativas (45%)
  actividades: GradeEntry[]; // Array of 5

  // Portafolio (5%)
  portafolio: GradeEntry;

  // Evaluacion Sumativa y Proyectos (50%)
  evaluacionSumativa: GradeEntry;
  proyectoIntegrador: GradeEntry;

  // Calculated totals
  promedioFormativas: number;
  sumaTrimestre: number; // Sum of weighted components
}


export interface StudentGradebook {
  studentId: string;
  trimester1: TrimesterRecord;
  trimester2: TrimesterRecord;
  trimester3: TrimesterRecord;
  
  // Final calculations
  promedioTrimestralFinal: number; // Average of the 3 trimesters
  notaAnual90: number; // The 90% part
  proyectoFinal10: GradeEntry; // The 10% part
  notaFinal100: number; // The final grade
  
  examenSupletorio?: number;
  notaFinalConSupletorio?: number;
  observacionFinal: 'Aprobado' | 'Reprobado' | 'Supletorio' | 'Pendiente';
  
  // Tracking
  mejorasUtilizadas: number;
}


export interface Gradebook {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  records: StudentGradebook[];
}

// Reinforcement Module Types (Based on PDF)
export type ReinforcementModalidad = 'inside_class' | 'extra_class';
export type ReinforcementGroupType = 'individual' | 'small_group' | 'large_group';

export interface ReinforcementTopic {
    dcd: string; // Destreza
    strategies: string; // Estrategias Metodológicas
    resources: string; // Recursos
    evaluationCriteria: string; // Criterios de Evaluación
}

export interface ReinforcementSession {
    id: string;
    date: string;
    attendance: boolean;
    skillsReinforced: string; // Destrezas Reforzadas
    achievements: string; // Logros de Aprendizaje
    observations: string; // Recomendaciones/Observaciones
}

export interface ReinforcementPlan {
    id: string;
    institutionId: string;
    studentId: string;
    subjectId: string;
    teacherId: string; // Docente responsable de la asignatura
    tutorId: string; // Tutor del grado
    reinforcementTeacherId?: string; // Profesor de refuerzo (puede ser el mismo)
    
    // Context
    academicYear: string;
    status: 'Nominated' | 'Planned' | 'ParentNotified' | 'In_Progress' | 'Completed';
    
    // Phase 1: Nomination & Planning (Page 1 & 2)
    nominationDate: string;
    nominationObservations: string; // Justification
    
    modalidad?: ReinforcementModalidad;
    groupType?: ReinforcementGroupType;
    schedule?: string; // Horario (Días/Horas)
    duration?: string; // Duración prevista
    startDate?: string;
    generalObjective?: string;
    topics: ReinforcementTopic[];
    
    // Phase 2: Parent Communication (Page 4 & 5)
    notificationDate?: string;
    parentConsented: boolean;
    parentConsentDate?: string;
    
    // Phase 3: Execution & Tracking (Page 3)
    sessions: ReinforcementSession[];
    
    // Final Report (Page 5 & 6)
    finalReport?: {
        achievements: string; // Logros
        difficulties: string; // Dificultades
        suggestions: string; // Sugerencias
        completionDate: string;
    };
}

// Staff Attendance & Biometrics
export interface BiometricProfile {
    userId: string;
    consentGiven: boolean;
    consentDate: string;
    templateId: string; // Simulating a biometric template reference
}

export type PunchType = 'in' | 'out_break' | 'in_break' | 'out';

export interface AttendancePunch {
  time: string; // HH:mm:ss format
  type: PunchType;
  method: 'Biometric' | 'Manual' | 'Facial';
  location?: { latitude: number; longitude: number; };
}

export interface StaffAttendanceRecord {
    id: string;
    institutionId: string;
    userId: string;
    date: string; // YYYY-MM-DD
    punches: AttendancePunch[];
}

// Communications Module - Formal Requests
export type FormalRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type FormalRequestType = 'Time Off' | 'Supply Request' | 'Complaint' | 'Other';
export type FormalRequestRecipient = Role.Vicerrector | Role.Rector | Role.InstitutionAdmin | Role.InspectorGeneral;

export interface FormalRequest {
    id: string;
    institutionId: string;
    requesterId: string; // Teacher/Staff ID
    recipientRole: FormalRequestRecipient;
    type: FormalRequestType;
    subject: string;
    details: string;
    attachmentUrl?: string; // Link to the attached file (simulated)
    status: FormalRequestStatus;
    submissionDate: string; // ISO Date string
    resolutionDate?: string; // ISO Date string
    resolverId?: string; // Admin ID who resolved it
    resolutionComments?: string;
}

// Training & Professional Development (Plan de Capacitación)
export type TrainingStatus = 'Planned' | 'In_Progress' | 'Completed' | 'Evaluated';
export type TrainingModality = 'Presencial' | 'Virtual' | 'Híbrida';
export type TrainingType = 'Interna' | 'Externa' | 'Inducción' | 'Directiva';

export interface TeacherTrainingRecord {
    teacherId: string;
    attendancePercentage: number; // Min requirement usually 75% or 80%
    finalGrade: number; // /10
    evidenceUrl?: string; // URL to uploaded evidence of application
    status: 'En Curso' | 'Aprobado' | 'Reprobado';
    certificateUrl?: string;
}

export interface TrainingCourse {
    id: string;
    planId: string; // Link to parent plan
    title: string;
    instructor: string;
    startDate: string;
    endDate: string;
    durationHours: number;
    modality: TrainingModality;
    type: TrainingType;
    enrolledTeachers: TeacherTrainingRecord[];
}

export interface TrainingPlan {
    id: string;
    institutionId: string;
    academicYear: string;
    title: string; // e.g. "Plan de Desarrollo Profesional 2025"
    objectives: string; // Qué se quiere lograr
    justification: string; // Detección de necesidades (Diagnóstico/DECE/PCA)
    transversalThemes: string[]; // e.g. ["Inclusión", "Género", "TICs"]
    methodology: string; // Cómo se hará
    status: TrainingStatus;
    courses: TrainingCourse[];
}

// Ensure Role enum includes Rector if not already present
// export enum Role { ... , Rector = 'Rector', ... }