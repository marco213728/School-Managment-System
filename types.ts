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

export interface Activity {
  id: string;
  institutionId: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  type: ActivityType;
  deliveryDate: string;
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

export interface Subject {
  id: string;
  institutionId: string;
  name: string; // "Matemáticas"
  teacherId: string;
  maxWeeklyHours?: number;
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
  methodology: string;
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

export const COMPETENCIES = ['Comunicacional', 'Matemática', 'Digital', 'Socioemocional'] as const;
export type Competency = typeof COMPETENCIES[number];

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
}