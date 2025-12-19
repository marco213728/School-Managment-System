

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
  Rector = 'Rector',
}

export enum PeiStatus {
    Draft = 'Borrador',
    PendingReview = 'En Revisión',
    AdjustmentRequired = 'Requiere Ajustes',
    Approved = 'Aprobado'
}

export enum StandardDimension {
    Administrative = 'Gestión Administrativa',
    Pedagogical = 'Gestión Pedagógica',
    Coexistence = 'Convivencia, Participación y Cooperación',
    Security = 'Seguridad Escolar'
}

export enum StandardLevel {
    NoCumple = 1,
    EnProceso = 2,
    Satisfactorio = 3,
    Destacado = 4
}

export enum AttendanceStatus { 
    Present = 'Presente', 
    Tardy = 'Atraso', 
    Unexcused = 'Falta Injustificada', 
    Excused = 'Falta Justificada', 
    Absent = 'Ausente', 
    JustificationPending = 'Justificación Pendiente' 
}

export enum ActivityType { 
    Homework = 'Tarea', 
    Quiz = 'Lección', 
    Exam = 'Examen', 
    Project = 'Proyecto', 
    Workshop = 'Taller' 
}

export enum CitacionStatus { 
    Sent = 'Enviada', 
    Acknowledged = 'Recibida', 
    Completed = 'Realizada', 
    Cancelled = 'Cancelada' 
}

export enum CurricularPlanStatus { 
    Draft = 'Borrador', 
    PendingReview = 'Pendiente de Revisión', 
    Approved = 'Aprobado', 
    RequiresAdjustments = 'Requiere Ajustes' 
}

export enum OcrSubmissionStatus { 
    Processing = 'Procesando', 
    PendingVerification = 'Pendiente de Verificación', 
    Completed = 'Completado', 
    Failed = 'Error' 
}

export enum DisciplinarySeverity { 
    Minor = 'Leve', 
    Serious = 'Grave', 
    VerySerious = 'Muy Grave' 
}

export enum OvpAxis { 
    SelfKnowledge = 'Autoconocimiento', 
    Information = 'Información', 
    DecisionMaking = 'Toma de Decisiones' 
}

export enum Shift { 
    Morning = 'Matutina', 
    Afternoon = 'Vespertina', 
    Night = 'Nocturna' 
}

export enum ViccInterventionType { 
    AcademicMeeting = 'Reunión Académica', 
    DisciplinaryMeeting = 'Reunión Disciplinaria', 
    ParentsMeeting = 'Reunión con Padres' 
}

export enum InterventionType { 
    IndividualSession = 'Sesión Individual', 
    GroupSession = 'Sesión Grupal', 
    FamilyVisit = 'Visita Domiciliaria', 
    Assessment = 'Evaluación' 
}

export enum Modality { 
    AUDIO = 'AUDIO', 
    TEXT = 'TEXT', 
    IMAGE = 'IMAGE' 
}

export type AreaOfKnowledge = string;
export type SubjectLevel = string;
export type GradeLevel = string;
export type Competency = string;
export type CurricularInsertion = string;
export type ViolenceType = 'Física' | 'Psicológica' | 'Sexual' | 'Negligencia' | 'Ciberacoso';
export type ProtocolScope = 'Intrafamiliar' | 'Institucional' | 'Entre Pares' | 'Género';
export type ProtocolSeverity = 'Conflicto Escolar' | 'Vulneración de Derechos/Delito';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  institutionId?: string;
  classIds?: string[];
  childIds?: string[];
  phone?: string;
  address?: string;
  biometricRegistered?: boolean;
  accessPin?: string;
  maxMonthlyHours?: number;
  workSchedule?: Record<string, { startTime: string; endTime: string }>;
}

export interface PeiFodaEntry {
    id: string;
    type: 'Fortaleza' | 'Oportunidad' | 'Debilidad' | 'Amenaza';
    description: string;
}

export interface PeiStrategy {
    id: string;
    type: 'FO' | 'FA' | 'DO' | 'DA';
    description: string;
    magnitude: number;
    gravity: number;
    capacity: number;
    benefit: number;
    priorityScore: number;
}

export interface PeiDimensionAnalysis {
    dimension: StandardDimension;
    entries: PeiFodaEntry[];
    strategies: PeiStrategy[];
    conclusion: string;
}

export interface PeiGoal {
    id: string;
    description: string;
    indicator: string;
    meta: string;
    responsibleId: string;
}

export interface PeiProjectAction {
    id: string;
    description: string;
    startDate: string;
    endDate: string;
    responsibleId: string;
}

export interface PeiProject {
    id: string;
    problemId?: string;
    title: string;
    problem: string;
    objective: string;
    goal: string;
    actions: PeiProjectAction[];
    resources: {
        available: string;
        needed: string;
        alliances: string;
    };
    indicators: string;
    deadline: string;
    status: 'Planned' | 'In_Progress' | 'Completed';
}

export interface PeiApprovalActa {
    id: string;
    type: 'Identity' | 'Diagnostic' | 'Action_Plan' | 'Final_Approval';
    meetingDate: string;
    summary: string;
    participants: string[];
}

export interface PeiProfile {
    id: string;
    institutionId: string;
    academicPeriod: string;
    status: PeiStatus;
    identity: {
        mission: string;
        vision: string;
        ideario: string;
    };
    diagnostics: PeiDimensionAnalysis[];
    strategicObjectives: {
        dimension: StandardDimension;
        objective: string;
        goals: PeiGoal[];
    }[];
    improvementPlans: PeiProject[];
    approvalData?: {
        approvalMeetingDate?: string;
        ratificationDate?: string;
        expiryDate?: string;
        externalRegistryId?: string;
        actas: PeiApprovalActa[];
    };
    auditData?: {
        phaseFeedback: {
            identity?: string;
            diagnostic?: string;
            planning?: string;
            improvement?: string;
        };
        generalComments?: string;
        lastAuditDate?: string;
        auditorId?: string;
    };
    auditComments?: string; 
    progress: number;
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

export interface Institution { 
    id: string; 
    name: string; 
    codeAMIE?: string; 
    logoUrl: string; 
    contact: { phone: string; email: string; address: string; }; 
    geofenceConfig?: { latitude: number; longitude: number; radius: number; };
    academicYear?: { startDate: string; endDate: string; };
    communicationChannels?: Record<string, { enabled: boolean }>;
    automatedNotifications?: Record<string, { enabled: boolean; channel: string; template: string }>;
    activeModules?: { dece: boolean; health: boolean };
    adminIds?: string[];
    methodologyFocus?: string;
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
    birthDate?: string; 
    gender?: 'FEMENINO' | 'MASCULINO' | 'OTRO'; 
    relatedContacts?: RelatedContact[]; 
    homeLocationLink?: string; 
}

export interface RelatedContact { 
    id: string; 
    relation: string; 
    name: string; 
    occupation?: string; 
    phone?: string; 
    email?: string; 
}

export interface Subject { 
    id: string; 
    institutionId: string; 
    name: string; 
    teacherId: string; 
    areaOfKnowledge: string; 
    level: string; 
    maxWeeklyHours?: number; 
    isModule?: boolean; 
}

export interface ScheduleEntry { 
    day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'; 
    timeSlotId: string; 
    classId: string; 
    subjectId: string; 
    roomId: string; 
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
    emergencyContact: { name: string; phone: string; relation: string; }; 
    medications: { name: string; dosage: string; notes: string; }[]; 
    lastCheckup: string; 
}

export interface MedicalVisit { 
    id: string; 
    institutionId: string; 
    studentId: string; 
    healthProfessionalId: string; 
    date: string; 
    motive: string; 
    vitalSigns: { temperature: string; pulse: string; respiratoryRate: string; bloodPressure: string; }; 
    anthropometry: { weight: string; height: string; imc: string; }; 
    diagnoses: Diagnosis[]; 
    treatmentPlan: { diagnostic: string; therapeutic: string; educational: string; }; 
    isReferred: boolean; 
    referralDetails?: string; 
}

export interface Diagnosis { 
    code: string; 
    description: string; 
    type: 'PRE' | 'DEF'; 
}

export interface TimeSlot { 
    id: string; 
    institutionId: string; 
    timetableId: string; 
    shift: Shift; 
    startTime: string; 
    endTime: string; 
    isBreak: boolean; 
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

export interface Intervention { 
    id: string; 
    institutionId: string; 
    studentId: string; 
    deceProfessionalId: string; 
    date: string; 
    type: InterventionType; 
    summary: string; 
    participants: string[]; 
    agreements: string; 
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
    teacherId: string; 
    classId: string; 
    subjectId: string; 
    date: string; 
    timeSlotId: string; 
    skillCode: string; 
    topics: string; 
    tasks: string; 
    observations: string; 
}

export interface Dcd { 
    id: string; 
    code: string; 
    description: string; 
    subjectId: string; 
    gradeLevel: GradeLevel; 
    criterionId: string; 
    competencies: Competency[]; 
    curricularInsertions?: CurricularInsertion[]; 
    isDisaggregated?: boolean; 
    refCode?: string; 
}

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
    resources: string; 
    evaluation: string; 
    adaptations: AdaptacionCurricular[]; 
    status: CurricularPlanStatus; 
    creationDate: string; 
    submittedDate?: string; 
    reviewDate?: string; 
    reviewerId?: string; 
    reviewComments?: string; 
    methodology?: string; 
}

export interface AdaptacionCurricular { 
    studentId: string; 
    dcdModificada: string; 
    grade: string; 
}

export interface Gradebook { 
    id: string; 
    institutionId: string; 
    classId: string; 
    subjectId: string; 
    records: StudentGradebook[]; 
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
    observacionFinal: string; 
    examenSupletorio?: number; 
    notaFinalConSupletorio?: number; 
}

export interface TrimesterRecord { 
    actividades: GradeEntry[]; 
    portafolio: GradeEntry; 
    evaluacionSumativa: GradeEntry; 
    proyectoIntegrador: GradeEntry; 
    promedioFormativas: number; 
    sumaTrimestre: number; 
}

export interface GradeEntry { 
    nota?: number; 
    mejora?: number; 
    refuerzo?: number; 
    promedio: number; 
    activityId?: string; 
}

export interface Activity { 
    id: string; 
    institutionId: string; 
    teacherId: string; 
    classId: string; 
    subjectId: string; 
    title: string; 
    description: string; 
    type: ActivityType; 
    deliveryDate: string; 
    trimester: 1 | 2 | 3; 
    evaluationCategory: EvaluationCategory; 
    gradebookIndex?: number; 
    microPlanId?: string; 
    dcdId?: string; 
    duaPrinciple?: 'representation' | 'actionExpression' | 'engagement'; 
    rubricId?: string; 
}

export type EvaluationCategory = 'ACTIVIDAD_INDIVIDUAL' | 'ACTIVIDAD_GRUPAL' | 'PORTAFOLIO' | 'EVALUACION_SUMATIVA' | 'PROYECTO_INTEGRADOR';

export interface StaffAttendanceRecord { 
    id: string; 
    institutionId: string; 
    userId: string; 
    date: string; 
    punches: { 
        time: string; 
        type: PunchType; 
        method: 'Biometric' | 'Manual' | 'Facial'; 
        location?: { latitude: number; longitude: number; }; 
        verificationStatus: 'Success' | 'Failed' | 'Pending'; 
        distanceFromInstitution: number; 
    }[]; 
}

export type PunchType = 'in' | 'out_break' | 'in_break' | 'out';

/**
 * Added FormalRequestStatus to define possible statuses for a formal request.
 */
export type FormalRequestStatus = 'Pending' | 'Approved' | 'Rejected';

/**
 * Added FormalRequestRecipient to define allowed roles for receiving formal requests.
 */
export type FormalRequestRecipient = Role.Vicerrector | Role.Rector | Role.InstitutionAdmin | Role.InspectorGeneral;

export interface FormalRequest { 
    id: string; 
    institutionId: string; 
    requesterId: string; 
    subject: string; 
    type: FormalRequestType; 
    recipientRole: Role; 
    details: string; 
    // Updated status to use FormalRequestStatus type
    status: FormalRequestStatus; 
    submissionDate: string; 
    resolutionDate?: string; 
    resolutionComments?: string; 
    resolverId?: string; 
    attachmentUrl?: string; 
}

export type FormalRequestType = 'Time Off' | 'Supply Request' | 'Complaint' | 'Other';

export interface TrainingPlan { 
    id: string; 
    institutionId: string; 
    title: string; 
    academicYear: string; 
    objectives: string; 
    justification: string; 
    methodology: string; 
    status: 'Planned' | 'In_Progress' | 'Completed'; 
    courses: TrainingCourse[]; 
    transversalThemes: string[]; 
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

export type TrainingModality = 'Presencial' | 'Virtual' | 'Híbrida';

export type TrainingType = 'Interna' | 'Externa' | 'Inducción';

export interface TeacherTrainingRecord { 
    teacherId: string; 
    attendancePercentage: number; 
    finalGrade: number; 
    status: 'En Curso' | 'Aprobado' | 'Reprobado'; 
}

export interface InstitutionalDocument { 
    id: string; 
    institutionId: string; 
    type: 'PEI' | 'PCI' | 'PCA' | 'CodigoConvivencia' | 'PlanGestionRiesgos'; 
    title: string; 
    status: 'Borrador' | 'Revisión' | 'Aprobado' | 'Vigente'; 
    version: string; 
    lastUpdated: string; 
    url?: string; 
}

export interface MeetingRecord { 
    id: string; 
    institutionId: string; 
    type: 'Junta de Curso' | 'Junta de Área' | 'Comisión Pedagógica'; 
    title: string; 
    date: string; 
    summary: string; 
    agreements: string; 
    attendees: string[]; 
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
    weight: number; 
}

export interface RubricDescriptor { 
    criteriaId: string; 
    levelId: string; 
    description: string; 
}

export interface ConflictMediation { 
    id: string; 
    institutionId: string; 
    date: string; 
    partiesInvolved: string[]; 
    description: string; 
    status: 'Resuelto' | 'En Proceso'; 
    derivedToDece: boolean; 
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
    topic?: string; 
    focus: string; 
    status: 'Scheduled' | 'Completed'; 
    scores?: RubricScore[]; 
    rating?: number; 
    strengths?: string; 
    weaknesses?: string; 
    agreements?: string; 
}

export interface RubricScore { 
    criteriaId: string; 
    score: number; 
    evidence: string; 
}

export interface TrainingSession { 
    id: string; 
    institutionId: string; 
    title: string; 
    date: string; 
    instructor: string; 
    attendees: string[]; 
}

export interface CronogramaEvent { 
    id: string; 
    institutionId: string; 
    title: string; 
    date: string; 
    startTime: string; 
    endTime: string; 
    location: string; 
    responsible: string; 
    status: 'Pending' | 'Approved' | 'Rejected'; 
    proposedBy: string; 
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
    extractedData: { 
        studentName: string; 
        detectedStatus: string; 
        confidence: number; 
        correctedStatus?: AttendanceStatus; 
    }[]; 
}

export interface ResourceRepositoryItem { 
    id: string; 
    institutionId: string; 
    authorId: string; 
    authorName?: string; 
    authorInstitutionName?: string; 
    title: string; 
    description: string; 
    level: SubjectLevel; 
    gradeLevel?: GradeLevel; 
    type: ResourceType; 
    isInterdisciplinary?: boolean; 
    shared: boolean; 
    creationDate: string; 
    dcdIds: string[]; 
    curricularInsertions: CurricularInsertion[]; 
    competencies: Competency[]; 
    clonedFromId?: string; 
    generativeTopic?: string; 
    finalProduct?: string; 
    phases?: ResourcePhase[]; 
    duaRepresentation?: string; 
    duaActionExpression?: string; 
    duaEngagement?: string; 
    resourceLinks?: string[]; 
    rubricId?: string; 
    linkedSubjectIds?: string[]; 
}

export interface ResourcePhase { 
    name: string; 
    trimester: number; 
    description: string; 
}

export type ResourceType = 'Activity' | 'Project' | 'ABP';

export interface DisciplinaryAction { 
    id: string; 
    institutionId: string; 
    studentId: string; 
    date: string; 
    infraction: string; 
    description: string; 
    severity: DisciplinarySeverity; 
    status: 'Abierto' | 'Cerrado'; 
    actionsTaken: string; 
}

export interface InspectionVisit { 
    id: string; 
    institutionId: string; 
    inspectorId: string; 
    date: string; 
    target: string; 
    type: 'Ordinaria' | 'Extraordinaria' | 'Auditoría'; 
    status: 'Programada' | 'Realizada' | 'Informe Pendiente'; 
    findings: string; 
}

export interface QualityMetric { 
    id: string; 
    institutionId: string; 
    year: string; 
    category: string; 
    metric: string; 
    value: number; 
    target: number; 
}

export interface OvpActivity { 
    id: string; 
    institutionId: string; 
    studentId: string; 
    title: string; 
    axis: OvpAxis; 
    status: 'Pendiente' | 'Completada'; 
}

export interface ProtocolCase { 
    id: string; 
    institutionId: string; 
    studentId: string; 
    dateDetected: string; 
    detectedBy: string; 
    detectionMethod: string; 
    violenceType: ViolenceType; 
    scope: ProtocolScope; 
    severity: ProtocolSeverity; 
    isSexualViolence: boolean; 
    denunciaFiled: boolean; 
    denunciaDeadline?: string; 
    status: 'Detección' | 'Intervención' | 'Derivación' | 'Seguimiento' | 'Cerrado'; 
    description: string; 
    indicators: string[]; 
    actionsTaken: string; 
}

export interface SubjectReport { 
    id: string; 
    institutionId: string; 
    classId: string; 
    subjectId: string; 
    teacherId: string; 
    trimester: number; 
    academicYear: string; 
    submissionDate?: string; 
    status: 'Draft' | 'Submitted' | 'Approved'; 
    dcdsCovered: string[]; 
    difficulties: { 
        studentId: string; 
        difficulty: string; 
        cause: string; 
        measure: string; 
        results: string; 
        minGrade: number; 
        improvedGrade: number; 
    }[]; 
    conclusions: string; 
    recommendations: string; 
}

export interface JuntaDeCurso { 
    id: string; 
    institutionId: string; 
    classId: string; 
    trimester: number; 
    date: string; 
    startTime: string; 
    endTime: string; 
    status: 'Planned' | 'ReadyToMeet' | 'Completed'; 
    reportIds: string[]; 
    academicYear: string; 
    generatedDeceReport?: string; 
    generatedInspectionReport?: string; 
    stimulusAwards?: { studentId: string; reason: string; }[]; 
    resolutions?: string; 
}

export interface StandardIndicator { 
    id: string; 
    code: string; 
    name: string; 
    dimension: StandardDimension; 
    description: string; 
    requirement: string; 
}

export interface StandardCompliance { 
    id: string; 
    institutionId: string; 
    indicatorId: string; 
    level: StandardLevel; 
    evidenceName?: string; 
    evidenceUrl?: string; 
    lastUpdated: string; 
    observations?: string; 
    auditFeedback?: string; 
    verifiedBySuperAdmin: boolean; 
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
    responsibleId: string; 
    deadline: string; 
    status: 'Not Started' | 'In Progress' | 'Completed'; 
    dateCreated: string; 
}

/**
 * Added ReinforcementTopic for planned reinforcement activities.
 */
export interface ReinforcementTopic {
    dcd: string;
    strategies: string;
    resources: string;
    evaluationCriteria: string;
}

/**
 * Added ReinforcementSession to track progress of academic reinforcement.
 */
export interface ReinforcementSession {
    id: string;
    date: string;
    attendance: boolean;
    skillsReinforced: string;
    achievements: string;
    observations: string;
}

/**
 * Added ReinforcementPlan to manage student academic reinforcement processes.
 */
export interface ReinforcementPlan {
    id: string;
    institutionId: string;
    teacherId: string;
    reinforcementTeacherId?: string;
    studentId: string;
    subjectId: string;
    tutorId: string;
    academicYear: string;
    status: 'Nominated' | 'Planned' | 'ParentNotified' | 'In_Progress' | 'Completed';
    nominationDate: string;
    nominationObservations: string;
    modalidad: 'inside_class' | 'extra_class';
    groupType: 'individual' | 'small_group';
    schedule?: string;
    duration?: string;
    startDate?: string;
    generalObjective: string;
    topics: ReinforcementTopic[];
    sessions: ReinforcementSession[];
    parentConsented: boolean;
    notificationDate?: string;
    finalReport?: {
        achievements: string;
        difficulties: string;
        suggestions: string;
    };
}
