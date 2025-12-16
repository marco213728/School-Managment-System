export enum Role {
  SuperAdmin = 'SuperAdmin',
  InstitutionAdmin = 'InstitutionAdmin',
  Teacher = 'Teacher',
  Student = 'Student',
  Parent = 'Parent',
  InspectorGeneral = 'InspectorGeneral',
  Vicerrector = 'Vicerrector',
  Rector = 'Rector',
  JefeDECE = 'JefeDECE',
  PsicologoEducativo = 'PsicologoEducativo',
  TrabajadorSocial = 'TrabajadorSocial',
  HealthProfessional = 'HealthProfessional',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  institutionId?: string;
  classIds?: string[];
  childIds?: string[]; // For parents
  phone?: string;
  address?: string;
  photoUrl?: string;
  biometricRegistered?: boolean;
  accessPin?: string;
  maxMonthlyHours?: number;
  workSchedule?: Record<string, { startTime: string; endTime: string }>;
}

export interface Institution {
  id: string;
  name: string;
  logoUrl: string;
  contact: { phone: string; email: string; address: string };
  geofenceConfig?: { latitude: number; longitude: number; radius: number };
  activeModules?: { dece: boolean; health: boolean };
  communicationChannels?: any;
  automatedNotifications?: any;
  academicYear?: { startDate: string; endDate: string };
  adminIds?: string[];
  methodologyFocus?: string;
  codeAMIE?: string;
}

export interface Class {
  id: string;
  institutionId: string;
  name: string;
  studentIds: string[];
  timetableId?: string;
  tutorId?: string;
  academicYear?: string;
}

export interface RelatedContact {
    id: string;
    relation: string;
    name: string;
    occupation?: string;
    phone?: string;
    email?: string;
}

export interface Student {
  id: string;
  institutionId: string;
  name: string;
  parentId: string; // User ID
  classId: string;
  photoUrl?: string;
  listNumber?: number;
  nationalId?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  homeLocationLink?: string;
  relatedContacts?: RelatedContact[];
  className?: string; // Derived prop sometimes
  grade?: string;
}

export enum Shift {
    Morning = 'Matutina',
    Afternoon = 'Vespertina',
    Night = 'Nocturna'
}

export interface TimeSlot {
  id: string;
  institutionId: string;
  timetableId: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  shift: Shift;
}

export interface ScheduleEntry {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  timeSlotId: string;
  classId: string;
  subjectId: string;
  roomId: string;
  // Derived
  subjectName?: string;
  teacherName?: string;
  timeSlot?: TimeSlot;
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

export interface HealthRecord {
  id: string;
  institutionId: string;
  studentId: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: { name: string; phone: string; relation: string };
  medications: { name: string; dosage: string; notes: string }[];
  lastCheckup: string;
}

export interface Diagnosis {
    code: string;
    description: string;
    type: 'PRE' | 'DEF';
}

export interface MedicalVisit {
  id: string;
  institutionId: string;
  studentId: string;
  healthProfessionalId: string;
  date: string;
  motive: string;
  vitalSigns: { temperature: string; pulse: string; respiratoryRate: string; bloodPressure: string };
  anthropometry: { weight: string; height: string; imc: string };
  diagnoses: Diagnosis[];
  treatmentPlan: { diagnostic: string; therapeutic: string; educational: string };
  isReferred: boolean;
  referralDetails?: string;
}

export type AreaOfKnowledge = 'Matemática' | 'Lengua y Literatura' | 'Ciencias Naturales' | 'Ciencias Sociales' | 'ECA' | 'Educación Física' | 'Inglés' | 'Interdisciplinar';
export type SubjectLevel = 'EGB Elemental' | 'EGB Media' | 'EGB Superior' | 'Bachillerato' | 'Todos';

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
  name: string;
}

export interface Timetable {
  id: string;
  institutionId: string;
  name: string;
  shift: Shift;
}

export enum ViccInterventionType {
    AcademicMeeting = 'Junta Académica',
    Disciplinary = 'Disciplinario',
    ParentMeeting = 'Reunión Padres'
}

export interface ViccIntervention {
  id: string;
  institutionId: string;
  studentId: string;
  vicerrectorId: string;
  date: string;
  type: ViccInterventionType;
  summary: string;
  participants: string[];
  agreements: string;
}

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Tardy = 'Tardy',
  Excused = 'Excused',
  Unexcused = 'Unexcused',
  JustificationPending = 'JustificationPending'
}

export interface AttendanceRecord {
  id: string;
  institutionId: string;
  studentId: string;
  date: string;
  timeSlot: string;
  status: AttendanceStatus;
  observations?: string[];
  justificationNotes?: string;
  justificationDocumentUrl?: string;
  // Derived
  studentName?: string;
  student?: Student;
}

export interface ExitPass {
  id: string;
  institutionId: string;
  studentId: string;
  inspectorId: string;
  date: string;
  reason: string;
  responsibleName: string;
  responsibleId: string;
}

export enum CitacionStatus {
    Sent = 'Sent',
    Confirmed = 'Confirmed',
    Completed = 'Completed'
}

export interface Citacion {
  id: string;
  institutionId: string;
  studentId: string;
  parentId: string;
  staffId: string;
  date: string;
  reason: string;
  status: CitacionStatus;
  creationDate: string;
}

export interface AcademicCalendarEvent {
  id: string;
  institutionId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface LeccionarioEntry {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  date: string;
  timeSlotId: string;
  skillCode: string;
  topics: string;
  tasks: string;
  observations: string;
}

export enum CurricularPlanStatus {
    Draft = 'Borrador',
    PendingReview = 'Pendiente de Revisión',
    RequiresAdjustments = 'Requiere Ajustes',
    Approved = 'Aprobado'
}

export interface AdaptacionCurricular {
    studentId: string;
    dcdModificada: string;
    grade: string;
    student?: Student; // derived
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
  duaRepresentation: string;
  duaActionExpression: string;
  duaEngagement: string;
  methodology: string;
  resources: string;
  evaluation: string;
  adaptations: AdaptacionCurricular[];
  status: CurricularPlanStatus;
  creationDate: string;
  submittedDate?: string;
  reviewerId?: string;
  reviewDate?: string;
  reviewComments?: string;
}

export type GradeLevel = 'EGB Elemental' | 'EGB Media' | 'EGB Superior' | 'Bachillerato';
export type Competency = 'Comunicacional' | 'Matemática' | 'Digital' | 'Socioemocional';
export type CurricularInsertion = 'Educación Financiera' | 'Desarrollo Sostenible' | 'Ciudadanía Digital';

export interface Dcd {
  id: string;
  institutionId: string;
  subjectId: string;
  code: string;
  description: string;
  gradeLevel: GradeLevel;
  criterionId: string;
  competencies: Competency[];
  curricularInsertions: CurricularInsertion[];
  isDisaggregated?: boolean;
  refCode?: string;
}

export interface EvaluationCriterion {
  id: string;
  institutionId: string;
  subjectId: string;
  code: string;
  description: string;
  gradeLevel: GradeLevel;
}

export interface EvaluationIndicator {
  id: string;
  institutionId: string;
  criterionId: string;
  code: string;
  description: string;
}

export interface GradeEntry {
    activityId?: string;
    nota?: number;
    mejora?: number;
    refuerzo?: number;
    promedio: number;
}

export interface TrimesterRecord {
    actividades: GradeEntry[];
    portafolio: GradeEntry;
    evaluacionSumativa: GradeEntry;
    proyectoIntegrador: GradeEntry;
    promedioFormativas: number;
    sumaTrimestre: number;
}

export interface StudentGradebook {
    studentId: string;
    trimester1: TrimesterRecord;
    trimester2: TrimesterRecord;
    trimester3: TrimesterRecord;
    mejorasUtilizadas: number;
    promedioTrimestralFinal: number;
    notaAnual90: number;
    proyectoFinal10: GradeEntry;
    notaFinal100: number;
    examenSupletorio?: number;
    notaFinalConSupletorio?: number;
    observacionFinal: string;
}

export interface Gradebook {
  id: string;
  institutionId: string;
  classId: string;
  subjectId: string;
  records: StudentGradebook[];
}

export enum ActivityType {
    Homework = 'Deber',
    Classwork = 'Trabajo en Clase',
    Project = 'Proyecto',
    Exam = 'Examen',
    Lesson = 'Lección'
}

export type EvaluationCategory = 'ACTIVIDAD_INDIVIDUAL' | 'ACTIVIDAD_GRUPAL' | 'PORTAFOLIO' | 'EVALUACION_SUMATIVA' | 'PROYECTO_INTEGRADOR';

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
  gradebookIndex?: 0 | 1 | 2 | 3 | 4;
  microPlanId?: string;
  dcdId?: string;
  duaPrinciple?: 'representation' | 'actionExpression' | 'engagement';
  rubricId?: string;
}

export interface ReinforcementTopic {
    dcd: string;
    evaluationCriteria: string;
    strategies: string;
    resources: string;
}

export interface ReinforcementSession {
    id: string;
    date: string;
    attendance: boolean;
    skillsReinforced: string;
    achievements: string;
    observations: string;
}

export interface ReinforcementPlan {
  id: string;
  institutionId: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  tutorId: string;
  reinforcementTeacherId?: string;
  academicYear: string;
  status: 'Nominated' | 'Planned' | 'ParentNotified' | 'In_Progress' | 'Completed';
  nominationDate: string;
  nominationObservations?: string;
  topics: ReinforcementTopic[];
  sessions: ReinforcementSession[];
  modalidad: 'inside_class' | 'extra_class';
  groupType: 'individual' | 'small_group';
  schedule?: string;
  duration?: string;
  startDate?: string;
  generalObjective?: string;
  parentConsented?: boolean;
  notificationDate?: string;
  finalReport?: { achievements: string; difficulties: string; suggestions: string };
}

export type PunchType = 'in' | 'out' | 'out_break' | 'in_break';

export interface StaffAttendanceRecord {
  id: string;
  institutionId: string;
  userId: string;
  date: string;
  punches: {
      time: string;
      type: PunchType;
      method: 'Biometric' | 'Manual' | 'Facial';
      location?: { latitude: number; longitude: number };
      verificationStatus?: 'Success' | 'Failed' | 'Pending';
      distanceFromInstitution?: number;
  }[];
  checkInTime?: string;
  status?: 'Late' | 'OnTime' | 'Absent';
  method?: string;
  punchSummary?: string;
  location?: { latitude: number; longitude: number };
}

export enum FormalRequestType {
    TimeOff = 'Time Off',
    SupplyRequest = 'Supply Request',
    Complaint = 'Complaint',
    Other = 'Other'
}

export enum FormalRequestRecipient {
    Rector = 'Rector',
    Vicerrector = 'Vicerrector',
    InstitutionAdmin = 'InstitutionAdmin',
    InspectorGeneral = 'InspectorGeneral'
}

export interface FormalRequest {
  id: string;
  institutionId: string;
  requesterId: string;
  subject: string;
  type: FormalRequestType;
  recipientRole: FormalRequestRecipient;
  details: string;
  attachmentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submissionDate: string;
  resolutionComments?: string;
  resolutionDate?: string;
  resolverId?: string;
}

export type TrainingModality = 'Presencial' | 'Virtual' | 'Híbrida';
export type TrainingType = 'Interna' | 'Externa' | 'Inducción';

export interface TeacherTrainingRecord {
    teacherId: string;
    attendancePercentage: number;
    finalGrade: number;
    status: 'En Curso' | 'Aprobado' | 'Reprobado';
}

export interface TrainingCourse {
    id: string;
    planId: string;
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
  title: string;
  academicYear: string;
  objectives: string;
  justification: string;
  methodology: string;
  transversalThemes: string[];
  status: 'Planned' | 'Active' | 'Completed';
  courses: TrainingCourse[];
}

export interface InstitutionalDocument {
  id: string;
  institutionId: string;
  type: 'PEI' | 'PCI' | 'PCA' | 'CodigoConvivencia' | 'PlanGestionRiesgos';
  title: string;
  status: 'Borrador' | 'Revisión' | 'Aprobado' | 'Vigente';
  version: string;
  url?: string;
  lastUpdated: string;
}

export interface MeetingRecord {
  id: string;
  institutionId: string;
  type: 'Junta de Curso' | 'Junta de Área' | 'Comisión Pedagógica';
  title: string;
  date: string;
  summary: string;
  agreements: string;
  attendees: string[]; // User IDs
}

export interface RubricLevel {
    id: string;
    rubricId: string;
    label: string;
    value: number;
    order: number;
    color?: string;
}

export interface RubricCriteria {
    id: string;
    rubricId: string;
    description: string;
    weight: number; // Percentage
}

export interface RubricDescriptor {
    criteriaId: string;
    levelId: string;
    description: string;
}

export interface Rubric {
  id: string;
  institutionId: string;
  title: string;
  description: string;
  scaleType: 'Quantitative' | 'Qualitative';
  levels: RubricLevel[];
  criteria: RubricCriteria[];
  descriptors: RubricDescriptor[];
}

export interface ConflictMediation {
  id: string;
  date: string;
  partiesInvolved: string[]; // Student IDs
  description: string;
  status: 'Resuelto' | 'Pendiente' | 'Derivado';
  derivedToDece?: boolean;
}

export interface CronogramaEvent {
  id: string;
  institutionId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  responsible: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  proposedBy: string; // User ID
}

export interface SubjectReport {
    id: string;
    institutionId: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    trimester: 1 | 2 | 3;
    academicYear: string;
    status: 'Draft' | 'Submitted' | 'Approved';
    submissionDate?: string;
    dcdsCovered: string[];
    difficulties: {
        studentId: string;
        difficulty: string;
        cause: string;
        measure: string;
        results: string;
        minGrade?: number;
        improvedGrade?: number;
        subjectName?: string; // Derived
    }[];
    conclusions: string;
    recommendations: string;
}

export enum OcrSubmissionStatus {
    Processing = 'Procesando',
    PendingVerification = 'Pendiente Verificación',
    Completed = 'Completado',
    Failed = 'Fallido'
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
    extractedData: any[]; // Adjust based on extraction format
}

export enum InterventionType {
    IndividualSession = 'Sesión Individual',
    GroupSession = 'Sesión Grupal',
    FamilyMeeting = 'Reunión Familiar',
    Referral = 'Derivación'
}

export interface Intervention {
    id: string;
    institutionId: string;
    studentId: string;
    deceProfessionalId: string;
    date: string;
    type: InterventionType;
    summary: string;
    participants?: string[];
    agreements?: string;
}

export enum OvpAxis {
    SelfKnowledge = 'Autoconocimiento',
    Information = 'Información',
    DecisionMaking = 'Toma de Decisiones'
}

export interface OvpActivity {
    id: string;
    institutionId: string;
    studentId: string;
    title: string;
    axis: OvpAxis;
    status: 'Pendiente' | 'Completada';
}

export enum DisciplinarySeverity {
    Minor = 'Leve',
    Serious = 'Grave',
    VerySerious = 'Muy Grave'
}

export interface DisciplinaryAction {
    id: string;
    studentId: string;
    date: string;
    infraction: string;
    description: string;
    severity: DisciplinarySeverity;
    status: 'Abierto' | 'Cerrado' | 'En Proceso';
}

export interface InspectionVisit {
    id: string;
    institutionId: string;
    inspectorId: string;
    target: string; // Area or person
    date: string;
    type: 'Ordinaria' | 'Extraordinaria' | 'Auditoría';
    status: 'Programada' | 'Realizada' | 'Informe Pendiente';
    findings: string;
}

export interface QualityMetric {
    id: string;
    name: string;
    value: number;
}

export interface RubricScore {
    criteriaId: string;
    score: number;
    evidence?: string;
}

export interface ClassroomVisit {
    id: string;
    institutionId: string;
    observerId: string;
    teacherId: string;
    date: string;
    startTime: string;
    className: string;
    subject: string;
    topic: string;
    focus: string;
    status: 'Scheduled' | 'Completed';
    scores?: RubricScore[];
    rating?: number;
    strengths?: string;
    weaknesses?: string;
    agreements?: string;
}

export interface TrainingSession {
    id: string;
    title: string;
    date: string;
    attendees: number;
}

export type ViolenceType = 'Física' | 'Psicológica' | 'Sexual' | 'Negligencia' | 'Ciberacoso';
export type ProtocolScope = 'Intrafamiliar' | 'Institucional' | 'Entre Pares' | 'Género';
export type ProtocolSeverity = 'Conflicto Escolar' | 'Vulneración de Derechos/Delito';

export interface ProtocolCase {
    id: string;
    institutionId: string;
    dateDetected: string;
    detectedBy: string; // UserID
    detectionMethod: string;
    studentId: string;
    violenceType: ViolenceType;
    scope: ProtocolScope;
    severity: ProtocolSeverity;
    status: 'Detección' | 'Intervención' | 'Derivación' | 'Seguimiento' | 'Cerrado';
    isSexualViolence: boolean;
    denunciaFiled: boolean;
    denunciaDeadline?: string;
    indicators: string[];
    description: string;
    actionsTaken: string;
}

export interface QualityGoal {
    id: string;
    institutionId: string;
    category: 'Rendimiento' | 'Asistencia' | 'Retención' | 'Comportamiento';
    metricName: string;
    targetValue: number;
    academicYear: string;
}

export interface ImprovementPlan {
    id: string;
    institutionId: string;
    problemDetected: string;
    proposedIntervention: string;
    responsibleId?: string; // User ID
    deadline: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    dateCreated?: string;
}

export interface JuntaDeCurso {
    id: string;
    institutionId: string;
    classId: string;
    trimester: 1 | 2 | 3;
    date: string;
    startTime: string;
    endTime: string;
    academicYear: string;
    status: 'Planned' | 'ReadyToMeet' | 'Completed';
    reportIds: string[]; // SubjectReport IDs
    resolutions?: string;
    stimulusAwards?: { studentId: string; reason: string }[];
    generatedDeceReport?: string;
    generatedInspectionReport?: string;
}

export type ResourceType = 'Activity' | 'Project' | 'ABP';

export interface ResourcePhase {
    name: string; // "Fase 1: Investigación", "Fase 2: Elaboración"
    trimester: 1 | 2 | 3;
    description: string;
}

export interface ResourceAttachment {
    id: string;
    name: string;
    url: string;
    type: 'document' | 'link';
}

export interface ResourceRepositoryItem {
    id: string;
    institutionId: string;
    authorId: string;
    title: string;
    description: string;
    coverImageUrl?: string; // New field for card cover
    
    // Taxonomy
    level: SubjectLevel; // EGB, BGU...
    gradeLevel?: GradeLevel; // Optional specific grade
    type: ResourceType;
    areaOfKnowledge?: AreaOfKnowledge; // For disciplinary
    
    // Curricular Alignment
    dcdIds: string[]; // Linked DCDs
    curricularInsertions: CurricularInsertion[]; // Transversal Axes
    competencies: Competency[];
    
    // DUA Structure
    duaRepresentation?: string; // Resources/Media
    duaActionExpression?: string; // Output formats
    duaEngagement?: string; // Motivation strategy
    
    // Project Specifics
    isInterdisciplinary?: boolean;
    generativeTopic?: string; // "Gran Tema"
    finalProduct?: string;
    phases?: ResourcePhase[];
    linkedSubjectIds?: string[]; // IDs of subjects involved
    
    // Evaluation
    rubricId?: string;
    
    // Meta
    shared: boolean; // Public to institution?
    clonedFromId?: string;
    creationDate: string;
    resourceLinks?: string[]; // URLs (Legacy, keep for backward compat if needed, or migrate to attachments)
    attachments?: ResourceAttachment[]; // New field for structured attachments
}
