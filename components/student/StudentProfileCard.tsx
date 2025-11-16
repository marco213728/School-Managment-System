import React, { useState, useMemo, useEffect, useContext } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
// FIX: Add User and Class to imports to support new props.
import { Student, OvpAxis, HealthRecord, Intervention, InterventionType, User, Class, Role, MedicalVisit, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, ViccInterventionType } from '../../types';
import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_USERS, MOCK_INTERVENTIONS, MOCK_OVP_ACTIVITIES, MOCK_HEALTH_RECORDS, MOCK_MEDICAL_VISITS, MOCK_VICC_INTERVENTIONS } from '../../constants';
import { CloseIcon, ClipboardListIcon, GraduationCapIcon, PlusIcon, DeceIcon, StethoscopeIcon, EditIcon, UsersIcon, PrinterIcon, PhoneIcon, EmailIcon, LocationMarkerIcon, ExternalLinkIcon, ChatBubbleIcon, CalendarIcon, VicerrectoradoIcon } from '../icons/Icons';
import InterventionForm from '../dece/InterventionForm';
import InterventionAgreementPrint from '../dece/InterventionAgreementPrint';
import HealthRecordForm from '../health/HealthRecordForm';
import MedicalVisitForm from '../health/MedicalVisitForm';
import MedicalVisitCertificate from '../health/MedicalVisitCertificate';
import ScheduleView from '../schedule/ScheduleView';
import ViccInterventionForm from '../vicerrectorado/ViccInterventionForm';
import ViccAgreementPrint from '../vicerrectorado/ViccAgreementPrint';


// FIX: Added 'vicerrectorate' to support the Vice-Rectorate module.
type DeceFileTab = 'info' | 'dece' | 'health' | 'schedule' | 'vicerrectorate';

interface StudentProfileCardProps {
    studentId: string;
    onClose: () => void;
    isEditable: boolean;
    initialTab?: DeceFileTab;
    isModal?: boolean;
    allStudents?: Student[];
    onUpdateStudents?: (students: Student[]) => void;
    allUsers?: User[];
    onUpdateUsers?: (users: User[]) => void;
    allClasses?: Class[];
    allHealthRecords?: HealthRecord[];
    onUpdateHealthRecords?: (records: HealthRecord[]) => void;
    allMedicalVisits?: MedicalVisit[];
    onUpdateMedicalVisits?: (visits: MedicalVisit[]) => void;
    schedule?: ScheduleEntry[];
    subjects?: Subject[];
    timeSlots?: TimeSlot[];
    rooms?: Room[];
    timetables?: Timetable[];
    // FIX: Added missing props for ViccIntervention data to resolve type errors.
    viccInterventions?: ViccIntervention[];
    onUpdateViccInterventions?: (interventions: ViccIntervention[]) => void;
}

// FIX: Changed InfoItem to be a React.FC with a props interface to fix children prop errors.
interface InfoItemProps {
    label: string;
    children: React.ReactNode;
    icon?: React.ElementType;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, children, icon: Icon }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 mt-1">
            {Icon && <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />}
            <div className="text-gray-800 break-words">{children}</div>
        </div>
    </div>
);


// FIX: Update component signature to accept new props.
const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ studentId, onClose, isEditable, initialTab = 'info', isModal = true, allStudents, onUpdateStudents, allUsers, onUpdateUsers, allClasses, allHealthRecords, onUpdateHealthRecords, allMedicalVisits, onUpdateMedicalVisits, schedule, subjects, timeSlots, rooms, timetables, viccInterventions, onUpdateViccInterventions }) => {
    const { user } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const [activeTab, setActiveTab] = useState<DeceFileTab>(initialTab);
    const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
    const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
    const [printingIntervention, setPrintingIntervention] = useState<Intervention | null>(null);
    const [isHealthFormOpen, setIsHealthFormOpen] = useState(false);
    const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
    const [printingVisit, setPrintingVisit] = useState<MedicalVisit | null>(null);
    const [isViccInterventionModalOpen, setIsViccInterventionModalOpen] = useState(false);
    const [editingViccIntervention, setEditingViccIntervention] = useState<ViccIntervention | null>(null);
    const [printingViccIntervention, setPrintingViccIntervention] = useState<ViccIntervention | null>(null);

    const [studentData, setStudentData] = useState<Student | null>(null);
    
    // Derived memoized data
    const profileData = useMemo(() => {
      if (!studentData) return null;
      const institutionId = user?.institutionId;
      const classInfo = (allClasses || MOCK_CLASSES).find(c => c.id === studentData.classId && c.institutionId === institutionId);
      const parentInfo = (allUsers || MOCK_USERS).find(u => u.id === studentData.parentId && u.institutionId === institutionId);
      const interventions = MOCK_INTERVENTIONS.filter(i => i.studentId === studentId && i.institutionId === institutionId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const ovpActivities = MOCK_OVP_ACTIVITIES.filter(a => a.studentId === studentId && a.institutionId === institutionId);
      const healthRecord = (allHealthRecords || MOCK_HEALTH_RECORDS).find(hr => hr.studentId === studentId && hr.institutionId === institutionId);
      const medicalVisits = (allMedicalVisits || MOCK_MEDICAL_VISITS).filter(mv => mv.studentId === studentId && mv.institutionId === institutionId)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const studentViccInterventions = (viccInterventions || MOCK_VICC_INTERVENTIONS).filter(i => i.studentId === studentId && i.institutionId === institutionId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
          ...studentData,
          className: classInfo?.name,
          parent: parentInfo,
          interventions,
          ovpActivities,
          healthRecord,
          medicalVisits,
          viccInterventions: studentViccInterventions,
      }
    }, [studentData, studentId, user, allUsers, allClasses, allHealthRecords, allMedicalVisits, viccInterventions]);

    const formattedBirthDate = useMemo(() => {
        if (!profileData?.birthDate) return 'No registrada';
        // Handles YYYY-MM-DD format without timezone issues.
        const parts = profileData.birthDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return profileData.birthDate; // fallback for other formats
    }, [profileData?.birthDate]);

    useEffect(() => {
        const student = (allStudents || MOCK_STUDENTS).find(s => s.id === studentId);
        setStudentData(student || null);
    }, [studentId, allStudents]);

    const staffMap = useMemo(() => new Map((allUsers || MOCK_USERS).filter(u => u.role === Role.JefeDECE || u.role === Role.PsicologoEducativo || u.role === Role.TrabajadorSocial || u.role === Role.HealthProfessional || u.role === Role.Vicerrector).map(u => [u.id, u.name])), [allUsers]);

    const handleOpenInterventionForm = (intervention: Intervention | null) => {
        setEditingIntervention(intervention);
        setIsInterventionModalOpen(true);
    };

    const handleSaveIntervention = (intervention: { id?: string; date: string; type: InterventionType; summary: string; participants: string[]; agreements: string; }) => {
        if (!profileData) return;
        const professionalId = user?.id || 'dece-unknown';
        
        if (intervention.id) { // Editing existing
            console.log("Updating intervention:", intervention);
        } else { // Adding new
            const newIntervention: Intervention = {
                ...intervention,
                id: `int-${Date.now()}`,
                institutionId: profileData.institutionId,
                studentId: profileData.id,
                deceProfessionalId: professionalId,
            };
             console.log("Adding new intervention:", newIntervention);
        }
        setIsInterventionModalOpen(false);
    };

    const handleOpenViccInterventionForm = (intervention: ViccIntervention | null) => {
        setEditingViccIntervention(intervention);
        setIsViccInterventionModalOpen(true);
    };

    const handleSaveViccIntervention = (intervention: { id?: string; date: string; type: ViccInterventionType; summary: string; participants: string[]; agreements: string; }) => {
        if (!profileData || !onUpdateViccInterventions) return;
        const professionalId = user?.id || 'vicerrector-unknown';
        
        let updatedInterventions;
        if (intervention.id) { // Editing existing
            updatedInterventions = (viccInterventions || []).map(i => i.id === intervention.id ? { ...i, ...intervention } as ViccIntervention : i);
        } else { // Adding new
            const newIntervention: ViccIntervention = {
                ...intervention,
                id: `vicc-${Date.now()}`,
                institutionId: profileData.institutionId,
                studentId: profileData.id,
                vicerrectorId: professionalId,
            };
            updatedInterventions = [...(viccInterventions || []), newIntervention];
        }
        onUpdateViccInterventions(updatedInterventions);
        setIsViccInterventionModalOpen(false);
    };

    const handleSaveHealthRecord = (record: HealthRecord) => {
        if (onUpdateHealthRecords && allHealthRecords) {
            const existingRecord = allHealthRecords.find(hr => hr.id === record.id);
            let updatedRecords;
            if (existingRecord) {
                updatedRecords = allHealthRecords.map(hr => hr.id === record.id ? record : hr);
            } else {
                updatedRecords = [...allHealthRecords, record];
            }
            onUpdateHealthRecords(updatedRecords);
        }
        setIsHealthFormOpen(false);
    };

    const handleSaveMedicalVisit = (visit: MedicalVisit) => {
        if (onUpdateMedicalVisits && allMedicalVisits) {
            const existingVisit = allMedicalVisits.find(v => v.id === visit.id);
            let updatedVisits;
            if (existingVisit) {
                updatedVisits = allMedicalVisits.map(v => v.id === visit.id ? visit : v);
            } else {
                updatedVisits = [...allMedicalVisits, visit];
            }
            onUpdateMedicalVisits(updatedVisits);
        }
        setIsVisitFormOpen(false);
    };

    const TabButton = ({ tab, label, icon }: { tab: DeceFileTab; label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            {icon}
            {label}
        </button>
    );

    if (!profileData || !studentData) return null;

    const renderInfoTab = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column: Student Details */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-xl font-bold text-gray-900">{profileData.name}</h3>
                    </div>
    
                    <div className="bg-white p-4 rounded-lg border space-y-4">
                        <InfoItem label="Grado">{profileData.grade || 'No asignado'}</InfoItem>
                        <InfoItem label="No de Lista">{profileData.listNumber || 'N/A'}</InfoItem>
                        <InfoItem label="Cédula">{profileData.nationalId || 'No registrada'}</InfoItem>
                        <InfoItem label="Fecha de Nacimiento">{formattedBirthDate}</InfoItem>
                        <InfoItem label="Género">{profileData.gender || 'No registrado'}</InfoItem>
                        <InfoItem label="Dirección" icon={LocationMarkerIcon}>{profileData.address || 'No registrada'}</InfoItem>
                        {profileData.homeLocationLink && (
                             <InfoItem label="Enlace de Ubicación" icon={ExternalLinkIcon}>
                                <a href={profileData.homeLocationLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">
                                    Ver en mapa
                                </a>
                            </InfoItem>
                        )}
                    </div>
                </div>
    
                {/* Right Column: Related Contacts */}
                <div className="lg:col-span-3 bg-white p-4 rounded-lg border">
                     <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        Familiares y Contactos
                        {profileData.relatedContacts && profileData.relatedContacts.length > 0 && (
                            <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                                {profileData.relatedContacts.length}
                            </span>
                        )}
                    </h3>
                    {profileData.relatedContacts && profileData.relatedContacts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relación</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {profileData.relatedContacts.map(contact => (
                                        <tr key={contact.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{contact.relation}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{contact.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{contact.occupation || '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-3">
                                                    {contact.phone && <a href={`tel:${contact.phone}`} title={contact.phone} className="text-gray-500 hover:text-primary-600"><PhoneIcon className="h-5 w-5" /></a>}
                                                    {contact.email && <a href={`mailto:${contact.email}`} title={contact.email} className="text-gray-500 hover:text-primary-600"><EmailIcon className="h-5 w-5" /></a>}
                                                    <button title="Chat" className="text-gray-400 cursor-not-allowed"><ChatBubbleIcon className="h-5 w-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No hay contactos relacionados.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderDeceTab = () => (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-700">Historial de Intervenciones</h3>
                {isEditable && <button onClick={() => handleOpenInterventionForm(null)} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm"><PlusIcon className="h-4 w-4" />Registrar Intervención</button>}
            </div>
            
            {profileData.interventions.length > 0 ? (
                <ul className="space-y-6">
                    {profileData.interventions.map(item => (
                        <li key={item.id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="font-bold text-primary-700">{item.type}</p>
                                </div>
                                {isEditable && (
                                    <div className="flex items-center gap-1">
                                         {item.agreements && (
                                            <button onClick={() => setPrintingIntervention(item)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Imprimir Acuerdo">
                                                <PrinterIcon className="h-5 w-5" />
                                            </button>
                                         )}
                                        <button onClick={() => handleOpenInterventionForm(item)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Editar">
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{item.summary}</p>
                            
                            {item.participants && item.participants.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <UsersIcon className="h-4 w-4" />
                                        Participantes
                                    </h5>
                                    <ul className="list-disc pl-6 mt-1 text-sm text-gray-600">
                                        {item.participants.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                            )}

                             {item.agreements && (
                                <div className="mt-3">
                                    <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <ClipboardListIcon className="h-4 w-4" />
                                        Acuerdos
                                    </h5>
                                    <div className="prose prose-sm mt-1 text-gray-600 whitespace-pre-wrap max-h-24 overflow-y-auto bg-white border rounded p-2">{item.agreements}</div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 italic mt-3 text-right">
                                Registrado por: {staffMap.get(item.deceProfessionalId) || 'Profesional'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-center text-sm text-gray-500 py-4">No hay intervenciones registradas.</p>}
         </div>
    );

    const renderVicerrectorateTab = () => (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-700">Historial de Intervenciones (Vicerrectorado)</h3>
                {isEditable && <button onClick={() => handleOpenViccInterventionForm(null)} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm"><PlusIcon className="h-4 w-4" />Registrar Intervención</button>}
            </div>
            
            {profileData.viccInterventions.length > 0 ? (
                <ul className="space-y-6">
                    {profileData.viccInterventions.map(item => (
                        <li key={item.id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="font-bold text-primary-700">{item.type}</p>
                                </div>
                                {isEditable && (
                                    <div className="flex items-center gap-1">
                                         {item.agreements && (
                                            <button onClick={() => setPrintingViccIntervention(item)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Imprimir Acuerdo">
                                                <PrinterIcon className="h-5 w-5" />
                                            </button>
                                         )}
                                        <button onClick={() => handleOpenViccInterventionForm(item)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Editar">
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{item.summary}</p>
                            
                            {item.participants && item.participants.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <UsersIcon className="h-4 w-4" />
                                        Participantes
                                    </h5>
                                    <ul className="list-disc pl-6 mt-1 text-sm text-gray-600">
                                        {item.participants.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                            )}

                             {item.agreements && (
                                <div className="mt-3">
                                    <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                        <ClipboardListIcon className="h-4 w-4" />
                                        Acuerdos
                                    </h5>
                                    <div className="prose prose-sm mt-1 text-gray-600 whitespace-pre-wrap max-h-24 overflow-y-auto bg-white border rounded p-2">{item.agreements}</div>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 italic mt-3 text-right">
                                Registrado por: {staffMap.get(item.vicerrectorId) || 'Profesional'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-center text-sm text-gray-500 py-4">No hay intervenciones registradas.</p>}
         </div>
    );

    const renderHealthTab = () => (
        <div className="space-y-6">
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-700">Ficha Médica</h3>
                    {isEditable && (
                        <button 
                            onClick={() => setIsHealthFormOpen(true)} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm"
                        >
                            <EditIcon className="h-4 w-4" />
                            {profileData.healthRecord ? 'Editar' : 'Crear'} Ficha
                        </button>
                    )}
                </div>
                <div className="space-y-4 text-sm bg-gray-50 border rounded-lg p-4">
                    {profileData.healthRecord ? (
                        <>
                            <div>
                                <h4 className="font-semibold text-gray-600">Alergias</h4>
                                <p className="text-gray-800">{profileData.healthRecord.allergies.join(', ') || 'Ninguna registrada'}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-600">Condiciones Médicas</h4>
                                <p className="text-gray-800">{profileData.healthRecord.conditions.join(', ') || 'Ninguna registrada'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-600">Contacto de Emergencia</h4>
                                <p className="text-gray-800">{profileData.healthRecord.emergencyContact.name} ({profileData.healthRecord.emergencyContact.relation}) - <a href={`tel:${profileData.healthRecord.emergencyContact.phone}`} className="text-primary-600 hover:underline">{profileData.healthRecord.emergencyContact.phone}</a></p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-600">Medicación Actual</h4>
                                <ul className="list-disc pl-5 text-gray-800">
                                   {profileData.healthRecord.medications.length > 0 ? profileData.healthRecord.medications.map((m, i) => <li key={i}>{m.name} ({m.dosage}) - {m.notes}</li>) : <li>Ninguna registrada</li>}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-600">Último Chequeo Médico</h4>
                                <p className="text-gray-800">{new Date(profileData.healthRecord.lastCheckup).toLocaleDateString()}</p>
                            </div>
                        </>
                    ) : <p className="text-gray-500 text-center py-4">No hay ficha médica para este estudiante.</p>}
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-700">Historial de Visitas Médicas</h3>
                    {isEditable && (
                        <button 
                            onClick={() => setIsVisitFormOpen(true)} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Registrar Visita
                        </button>
                    )}
                </div>
                {profileData.medicalVisits.length > 0 ? (
                     <div className="space-y-4">
                        {profileData.medicalVisits.map(visit => (
                            <div key={visit.id} className="p-4 bg-gray-50 rounded-lg border text-sm group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-primary-700">{new Date(visit.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-gray-600">{visit.motive}</p>
                                    </div>
                                    <div className="flex items-center">
                                      {visit.isReferred && <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">Referido</span>}
                                      {isEditable && (
                                          <button 
                                              onClick={() => setPrintingVisit(visit)} 
                                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity" 
                                              title="Imprimir Certificado">
                                              <PrinterIcon className="h-5 w-5" />
                                          </button>
                                      )}
                                    </div>
                                </div>
                                <div className="mt-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <p><strong>Temp:</strong> {visit.vitalSigns.temperature}</p>
                                    <p><strong>Pulso:</strong> {visit.vitalSigns.pulse}</p>
                                    <p><strong>FR:</strong> {visit.vitalSigns.respiratoryRate}</p>
                                    <p><strong>PA:</strong> {visit.vitalSigns.bloodPressure}</p>
                                </div>
                                <details className="mt-3 text-xs">
                                    <summary className="cursor-pointer font-semibold text-gray-600">Ver Detalles</summary>
                                    <div className="pt-2 pl-2 border-l-2 mt-2 space-y-2">
                                        <div>
                                            <h5 className="font-semibold">Diagnósticos:</h5>
                                            <ul className="list-disc pl-5">
                                                {visit.diagnoses.map(d => <li key={d.code}>{d.description} ({d.code}) - <strong>{d.type}</strong></li>)}
                                            </ul>
                                        </div>
                                         <div>
                                            <h5 className="font-semibold">Plan de Tratamiento:</h5>
                                            <p><strong>Diagnóstico:</strong> {visit.treatmentPlan.diagnostic}</p>
                                            <p><strong>Terapéutico:</strong> {visit.treatmentPlan.therapeutic}</p>
                                            <p><strong>Educacional:</strong> {visit.treatmentPlan.educational}</p>
                                        </div>
                                        {visit.isReferred && visit.referralDetails && (
                                            <div>
                                                <h5 className="font-semibold">Detalles de Referencia:</h5>
                                                <p>{visit.referralDetails}</p>
                                            </div>
                                        )}
                                    </div>
                                </details>
                                 <p className="text-xs text-gray-400 italic mt-3 text-right">
                                    Registrado por: {staffMap.get(visit.healthProfessionalId) || 'Profesional de Salud'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-sm text-gray-500 py-4">No hay visitas médicas registradas.</p>}
            </div>
        </div>
    );

    const renderScheduleTab = () => {
        if (!profileData || !schedule || !subjects || !timeSlots || !rooms || !timetables || !allUsers || !allClasses) {
            return <p>Faltan datos para mostrar el horario.</p>;
        }
        
        const studentClass = allClasses.find(c => c.id === profileData.classId);
        if (!studentClass || !studentClass.timetableId) {
            return <p>El alumno no tiene un horario asignado.</p>;
        }

        const relevantTimeSlots = timeSlots.filter(ts => ts.timetableId === studentClass.timetableId);
        const classScheduleEntries = schedule.filter(e => e.classId === studentClass.id);

        return (
            <ScheduleView
                title={`Horario Semanal - ${studentClass.name}`}
                scheduleEntries={classScheduleEntries}
                timeSlots={relevantTimeSlots}
                subjects={subjects}
                classes={allClasses}
                rooms={rooms}
                users={allUsers}
                viewType="student"
            />
        );
    };

    const content = (
        <div className={isModal ? "bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" : "" } onClick={isModal ? e => e.stopPropagation() : undefined}>
            <header className="flex items-start justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <img src={studentData.photoUrl || `https://placehold.co/200x200/60a5fa/white?text=${studentData.name.charAt(0)}`} alt="Foto" className="h-12 w-12 rounded-full object-cover" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{studentData.name}</h2>
                        <p className="text-sm text-gray-500">{profileData.className}</p>
                    </div>
                </div>
                {isModal && (
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </header>

            <nav className="p-2 border-b">
                 <div className="flex flex-wrap items-center gap-1 border border-gray-200 rounded-lg p-1 w-min">
                    <TabButton tab="info" label="Ficha" icon={<GraduationCapIcon className="h-5 w-5"/>} />
                    <TabButton tab="schedule" label="Horario" icon={<CalendarIcon className="h-5 w-5"/>} />
                    <TabButton tab="dece" label="DECE" icon={<DeceIcon className="h-5 w-5"/>} />
                    <TabButton tab="health" label="Salud" icon={<StethoscopeIcon className="h-5 w-5"/>} />
                    <TabButton tab="vicerrectorate" label="Vicerrectorado" icon={<VicerrectoradoIcon className="h-5 w-5"/>} />
                </div>
            </nav>

            <main className={isModal ? "p-6 overflow-y-auto bg-gray-50" : "p-0 pt-6"}>
                {activeTab === 'info' && renderInfoTab()}
                {activeTab === 'schedule' && renderScheduleTab()}
                {activeTab === 'dece' && renderDeceTab()}
                {activeTab === 'health' && renderHealthTab()}
                {activeTab === 'vicerrectorate' && renderVicerrectorateTab()}
            </main>
        </div>
    );
    
    const modalWrapper = (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            {content}
        </div>
    );

    return (
        <>
            {isModal ? modalWrapper : <div className="max-w-5xl mx-auto">{content}</div>}
            
            {isInterventionModalOpen && (
                <InterventionForm 
                    isOpen={isInterventionModalOpen}
                    onClose={() => setIsInterventionModalOpen(false)}
                    onSave={handleSaveIntervention}
                    interventionToEdit={editingIntervention}
                    studentName={studentData.name}
                />
            )}
            {isViccInterventionModalOpen && (
                <ViccInterventionForm 
                    isOpen={isViccInterventionModalOpen}
                    onClose={() => setIsViccInterventionModalOpen(false)}
                    onSave={handleSaveViccIntervention}
                    interventionToEdit={editingViccIntervention}
                    studentName={studentData.name}
                />
            )}
            {printingIntervention && studentData && institution && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div id="intervention-agreement-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa del Acta de Acuerdo</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingIntervention(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <InterventionAgreementPrint
                                intervention={printingIntervention}
                                student={studentData}
                            />
                        </div>
                    </div>
                </div>
            )}
            {printingViccIntervention && studentData && institution && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div id="vicc-agreement-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa del Acta de Acuerdo</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingViccIntervention(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <ViccAgreementPrint
                                intervention={printingViccIntervention}
                                student={studentData}
                            />
                        </div>
                    </div>
                </div>
            )}
             {isHealthFormOpen && (
                <HealthRecordForm
                    isOpen={isHealthFormOpen}
                    onClose={() => setIsHealthFormOpen(false)}
                    onSave={handleSaveHealthRecord}
                    recordToEdit={profileData.healthRecord}
                    studentId={studentId}
                    institutionId={profileData.institutionId}
                />
            )}
            {isVisitFormOpen && user && (
                <MedicalVisitForm
                    isOpen={isVisitFormOpen}
                    onClose={() => setIsVisitFormOpen(false)}
                    onSave={handleSaveMedicalVisit}
                    studentId={studentId}
                    institutionId={profileData.institutionId}
                    healthProfessionalId={user.id}
                />
            )}
            {printingVisit && studentData && institution && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div id="medical-certificate-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa del Certificado</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingVisit(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <MedicalVisitCertificate
                                visit={printingVisit}
                                student={studentData}
                                healthProfessionalName={staffMap.get(printingVisit.healthProfessionalId) || 'Profesional de Salud'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StudentProfileCard;