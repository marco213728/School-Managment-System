import React, { useState, useMemo, useEffect, useContext } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
// FIX: Add User, Class, and RelatedContact to imports to support new props and features.
import { Student, RelatedContact, OvpAxis, HealthRecord, Intervention, InterventionType, User, Class, Role, MedicalVisit, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, ViccInterventionType } from '../../types';
import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_USERS, MOCK_INTERVENTIONS, MOCK_OVP_ACTIVITIES, MOCK_HEALTH_RECORDS, MOCK_MEDICAL_VISITS, MOCK_VICC_INTERVENTIONS } from '../../constants';
import { CloseIcon, ClipboardListIcon, GraduationCapIcon, PlusIcon, DeceIcon, StethoscopeIcon, EditIcon, UsersIcon, PrinterIcon, PhoneIcon, EmailIcon, LocationMarkerIcon, ExternalLinkIcon, ChatBubbleIcon, CalendarIcon, VicerrectoradoIcon, TrashIcon } from '../icons/Icons';
import InterventionForm from '../dece/InterventionForm';
import InterventionAgreementPrint from '../dece/InterventionAgreementPrint';
import HealthRecordForm from '../health/HealthRecordForm';
import MedicalVisitForm from '../health/MedicalVisitForm';
import MedicalVisitCertificate from '../health/MedicalVisitCertificate';
import ScheduleView from '../schedule/ScheduleView';
import ViccInterventionForm from '../vicerrectorado/ViccInterventionForm';
import ViccAgreementPrint from '../vicerrectorado/ViccAgreementPrint';
import { saveDocument, deleteDocument } from '../../lib/firebase';
import { parseAnyDateToIso, formatDateForDisplay, isExcelSerialDate } from '../../lib/dateUtils';


// FIX: Changed 'vicerrectorate' to support the Vice-Rectorate module.
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
    allInterventions?: Intervention[];
    onUpdateInterventions?: (interventions: Intervention[]) => void;
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

// Form for adding/editing a related contact
interface ContactFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<RelatedContact, 'id'> & { id?: string }) => void;
    contactToEdit: RelatedContact | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        relation: '',
        name: '',
        occupation: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        if (contactToEdit) {
            setFormData({
                id: contactToEdit.id,
                relation: contactToEdit.relation,
                name: contactToEdit.name,
                occupation: contactToEdit.occupation || '',
                phone: contactToEdit.phone || '',
                email: contactToEdit.email || '',
            });
        } else {
            setFormData({ id: undefined, relation: '', name: '', occupation: '', phone: '', email: '' });
        }
    }, [contactToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{contactToEdit ? 'Editar' : 'Añadir'} Contacto</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Relación</label>
                        <input type="text" name="relation" value={formData.relation} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" placeholder="Ej: Padre, Tía, Vecino..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación</label>
                        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface EditStudentGeneralModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    onSave: (updated: Partial<Student>) => void;
}

const EditStudentGeneralModal: React.FC<EditStudentGeneralModalProps> = ({ isOpen, onClose, student, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        nationalId: '',
        birthDate: '',
        gender: '' as 'FEMENINO' | 'MASCULINO' | 'OTRO' | '',
        listNumber: '',
        phone: '',
        address: '',
        homeLocationLink: ''
    });

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                nationalId: student.nationalId || '',
                birthDate: parseAnyDateToIso(student.birthDate) || '',
                gender: student.gender || '',
                listNumber: student.listNumber !== undefined ? String(student.listNumber) : '',
                phone: student.phone || '',
                address: student.address || '',
                homeLocationLink: student.homeLocationLink || ''
            });
        }
    }, [student, isOpen]);

    if (!isOpen || !student) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateMapsUrl = () => {
        if (!formData.address.trim()) {
            alert('Por favor, ingresa primero una dirección.');
            return;
        }
        const generated = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address.trim())}`;
        setFormData(prev => ({ ...prev, homeLocationLink: generated }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: formData.name.trim(),
            nationalId: formData.nationalId.trim() || undefined,
            birthDate: formData.birthDate.trim() || undefined,
            gender: (formData.gender as any) || undefined,
            listNumber: formData.listNumber ? parseInt(formData.listNumber, 10) : undefined,
            phone: formData.phone.trim() || undefined,
            address: formData.address.trim() || undefined,
            homeLocationLink: formData.homeLocationLink.trim() || undefined
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl relative border border-slate-200" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <CloseIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <LocationMarkerIcon className="h-6 w-6 text-primary-600" />
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Editar Datos y Ubicación del Estudiante</h2>
                        <p className="text-xs text-gray-500">Actualiza fecha de nacimiento, cédula, dirección y enlace de Google Maps</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase">Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full p-2 border rounded-lg text-sm bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase">Cédula / Identificación</label>
                            <input
                                type="text"
                                name="nationalId"
                                value={formData.nationalId}
                                onChange={handleChange}
                                placeholder="10 dígitos"
                                className="mt-1 w-full p-2 border rounded-lg text-sm font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded-lg text-sm"
                            />
                            {student.birthDate && isExcelSerialDate(student.birthDate) && (
                                <p className="text-[11px] text-amber-600 mt-0.5">
                                    💡 Se convirtió automáticamente el valor previo de Excel ({student.birthDate})
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase">Género</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded-lg text-sm bg-white"
                            >
                                <option value="">No especificado</option>
                                <option value="FEMENINO">FEMENINO</option>
                                <option value="MASCULINO">MASCULINO</option>
                                <option value="OTRO">OTRO</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase">Nº de Lista</label>
                            <input
                                type="number"
                                name="listNumber"
                                value={formData.listNumber}
                                onChange={handleChange}
                                min="1"
                                className="mt-1 w-full p-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase">Teléfono Alumno</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase">Dirección Domiciliaria</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Ej. Agua Clara Y Las Lagunas"
                            className="mt-1 w-full p-2 border rounded-lg text-sm"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                <span>📍</span> Enlace de Ubicación para Google Maps
                            </label>
                            {formData.address && (
                                <button
                                    type="button"
                                    onClick={handleGenerateMapsUrl}
                                    className="text-[11px] text-primary-700 hover:text-primary-900 font-semibold underline flex items-center gap-1"
                                >
                                    🔍 Generar desde Dirección
                                </button>
                            )}
                        </div>
                        <input
                            type="url"
                            name="homeLocationLink"
                            value={formData.homeLocationLink}
                            onChange={handleChange}
                            placeholder="https://maps.app.goo.gl/... o https://www.google.com/maps/search/?api=1&query=..."
                            className="w-full p-2 border rounded-lg text-xs font-mono bg-white"
                        />
                        <div className="flex justify-between items-center text-[11px] text-slate-500">
                            <span>Pega el enlace compartido desde la app o web de Google Maps.</span>
                            {formData.homeLocationLink && (
                                <a
                                    href={formData.homeLocationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                    <span>↗ Probar enlace</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg hover:bg-primary-700 shadow-sm transition"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ 
    studentId, 
    onClose, 
    isEditable, 
    initialTab = 'info', 
    isModal = true, 
    allStudents, 
    onUpdateStudents, 
    allUsers, 
    onUpdateUsers, 
    allClasses, 
    allHealthRecords, 
    onUpdateHealthRecords, 
    allMedicalVisits, 
    onUpdateMedicalVisits, 
    allInterventions,
    onUpdateInterventions,
    schedule, 
    subjects, 
    timeSlots, 
    rooms, 
    timetables, 
    viccInterventions, 
    onUpdateViccInterventions 
}) => {
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
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<RelatedContact | null>(null);
    const [isEditGeneralOpen, setIsEditGeneralOpen] = useState(false);
    const [isFixingDate, setIsFixingDate] = useState(false);

    const [studentData, setStudentData] = useState<Student | null>(null);
    
    const effectiveInstitutionId = user?.institutionId || studentData?.institutionId || institution?.id || 'uemol';

    // Derived memoized data
    const profileData = useMemo(() => {
      if (!studentData) return null;
      const classInfo = (allClasses || MOCK_CLASSES).find(c => c.id === studentData.classId && (!c.institutionId || c.institutionId === effectiveInstitutionId));
      const parentInfo = (allUsers || MOCK_USERS).find(u => u.id === studentData.parentId && (!u.institutionId || u.institutionId === effectiveInstitutionId));
      
      const interventionsList = (allInterventions && allInterventions.length > 0) ? allInterventions : MOCK_INTERVENTIONS;
      const interventions = interventionsList.filter(i => i.studentId === studentId && (!i.institutionId || i.institutionId === effectiveInstitutionId || !effectiveInstitutionId))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const ovpActivities = MOCK_OVP_ACTIVITIES.filter(a => a.studentId === studentId && (!a.institutionId || a.institutionId === effectiveInstitutionId));
      
      const healthList = (allHealthRecords && allHealthRecords.length > 0) ? allHealthRecords : MOCK_HEALTH_RECORDS;
      const healthRecord = healthList.find(hr => hr.studentId === studentId && (!hr.institutionId || hr.institutionId === effectiveInstitutionId || !effectiveInstitutionId));
      
      const visitsList = (allMedicalVisits && allMedicalVisits.length > 0) ? allMedicalVisits : MOCK_MEDICAL_VISITS;
      const medicalVisits = visitsList.filter(mv => mv.studentId === studentId && (!mv.institutionId || mv.institutionId === effectiveInstitutionId || !effectiveInstitutionId))
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const studentViccInterventions = (viccInterventions || MOCK_VICC_INTERVENTIONS).filter(i => i.studentId === studentId && (!i.institutionId || i.institutionId === effectiveInstitutionId))
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
    }, [studentData, studentId, effectiveInstitutionId, allUsers, allClasses, allHealthRecords, allMedicalVisits, allInterventions, viccInterventions]);

    const isBirthDateExcelSerial = useMemo(() => {
        return isExcelSerialDate(profileData?.birthDate);
    }, [profileData?.birthDate]);

    const formattedBirthDate = useMemo(() => {
        return formatDateForDisplay(profileData?.birthDate);
    }, [profileData?.birthDate]);

    const handleFixStudentBirthDate = async () => {
        if (!studentData) return;
        const normalizedIso = parseAnyDateToIso(studentData.birthDate);
        if (!normalizedIso) return;
        
        setIsFixingDate(true);
        try {
            const updatedStudent: Student = {
                ...studentData,
                birthDate: normalizedIso
            };
            setStudentData(updatedStudent);
            await saveDocument('students', updatedStudent.id, updatedStudent);
            if (onUpdateStudents && allStudents) {
                onUpdateStudents(allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            }
        } finally {
            setIsFixingDate(false);
        }
    };

    const handleAutoGenerateMapsFromAddress = async () => {
        if (!studentData || !studentData.address) return;
        const generatedUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studentData.address)}`;
        const updatedStudent: Student = {
            ...studentData,
            homeLocationLink: generatedUrl
        };
        setStudentData(updatedStudent);
        await saveDocument('students', updatedStudent.id, updatedStudent);
        if (onUpdateStudents && allStudents) {
            onUpdateStudents(allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        }
    };

    const handleSaveGeneralStudent = async (updatedFields: Partial<Student>) => {
        if (!studentData) return;
        const updatedStudent: Student = {
            ...studentData,
            ...updatedFields,
            birthDate: updatedFields.birthDate ? parseAnyDateToIso(updatedFields.birthDate) : studentData.birthDate
        };
        setStudentData(updatedStudent);
        await saveDocument('students', updatedStudent.id, updatedStudent);
        if (onUpdateStudents && allStudents) {
            onUpdateStudents(allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        }
        setIsEditGeneralOpen(false);
    };

    useEffect(() => {
        const student = (allStudents || MOCK_STUDENTS).find(s => s.id === studentId);
        setStudentData(student || null);
    }, [studentId, allStudents]);

    const staffMap = useMemo(() => new Map((allUsers || MOCK_USERS).filter(u => u.role === Role.JefeDECE || u.role === Role.PsicologoEducativo || u.role === Role.TrabajadorSocial || u.role === Role.HealthProfessional || u.role === Role.Vicerrector).map(u => [u.id, u.name])), [allUsers]);

    const handleOpenInterventionForm = (intervention: Intervention | null) => {
        setEditingIntervention(intervention);
        setIsInterventionModalOpen(true);
    };

    const handleSaveIntervention = async (intervention: { id?: string; date: string; type: InterventionType; summary: string; participants: string[]; agreements: string; }) => {
        if (!studentData) return;
        const professionalId = user?.id || 'dece-unknown';
        const targetInstId = studentData.institutionId || effectiveInstitutionId;
        
        const newIntervention: Intervention = {
            ...intervention,
            id: intervention.id || `int-${Date.now()}`,
            institutionId: targetInstId,
            studentId: studentData.id,
            deceProfessionalId: professionalId,
            date: intervention.date || new Date().toISOString().split('T')[0],
            summary: intervention.summary || '',
            participants: intervention.participants || [],
            agreements: intervention.agreements || ''
        };

        await saveDocument('interventions', newIntervention.id, newIntervention);

        if (onUpdateInterventions) {
            const currentList = allInterventions || [];
            const exists = currentList.some(i => i.id === newIntervention.id);
            const updated = exists 
                ? currentList.map(i => i.id === newIntervention.id ? newIntervention : i)
                : [newIntervention, ...currentList];
            onUpdateInterventions(updated);
        }
        setIsInterventionModalOpen(false);
        setEditingIntervention(null);
    };

    const handleDeleteIntervention = async (interventionId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta intervención?')) {
            await deleteDocument('interventions', interventionId);
            if (onUpdateInterventions) {
                onUpdateInterventions((allInterventions || []).filter(i => i.id !== interventionId));
            }
        }
    };

    const handleOpenViccInterventionForm = (intervention: ViccIntervention | null) => {
        setEditingViccIntervention(intervention);
        setIsViccInterventionModalOpen(true);
    };

    const handleSaveViccIntervention = async (intervention: { id?: string; date: string; type: ViccInterventionType; summary: string; participants: string[]; agreements: string; }) => {
        if (!profileData || !onUpdateViccInterventions) return;
        const professionalId = user?.id || 'vicerrector-unknown';
        const targetInstId = profileData.institutionId || effectiveInstitutionId;
        
        let updatedInterventions: ViccIntervention[];
        if (intervention.id) { // Editing existing
            const updatedItem: ViccIntervention = { ...intervention, id: intervention.id, institutionId: targetInstId, studentId: profileData.id, vicerrectorId: professionalId } as ViccIntervention;
            await saveDocument('vicc_interventions', updatedItem.id, updatedItem);
            updatedInterventions = (viccInterventions || []).map(i => i.id === intervention.id ? updatedItem : i);
        } else { // Adding new
            const newIntervention: ViccIntervention = {
                ...intervention,
                id: `vicc-${Date.now()}`,
                institutionId: targetInstId,
                studentId: profileData.id,
                vicerrectorId: professionalId,
            };
            await saveDocument('vicc_interventions', newIntervention.id, newIntervention);
            updatedInterventions = [...(viccInterventions || []), newIntervention];
        }
        onUpdateViccInterventions(updatedInterventions);
        setIsViccInterventionModalOpen(false);
    };

    const handleSaveHealthRecord = async (record: HealthRecord) => {
        const targetInstId = studentData?.institutionId || effectiveInstitutionId;
        const finalRecord: HealthRecord = {
            ...record,
            id: record.id || `hr-${Date.now()}`,
            institutionId: record.institutionId || targetInstId,
            studentId: studentId,
        };

        await saveDocument('health_records', finalRecord.id, finalRecord);

        if (onUpdateHealthRecords) {
            const currentList = allHealthRecords || [];
            const exists = currentList.some(hr => hr.id === finalRecord.id);
            const updated = exists
                ? currentList.map(hr => hr.id === finalRecord.id ? finalRecord : hr)
                : [finalRecord, ...currentList];
            onUpdateHealthRecords(updated);
        }
        setIsHealthFormOpen(false);
    };

    const handleSaveMedicalVisit = async (visit: MedicalVisit) => {
        const targetInstId = studentData?.institutionId || effectiveInstitutionId;
        const finalVisit: MedicalVisit = {
            ...visit,
            id: visit.id || `visit-${Date.now()}`,
            institutionId: visit.institutionId || targetInstId,
            studentId: studentId,
            healthProfessionalId: visit.healthProfessionalId || user?.id || 'prof-salud',
        };

        await saveDocument('medical_visits', finalVisit.id, finalVisit);

        if (onUpdateMedicalVisits) {
            const currentList = allMedicalVisits || [];
            const exists = currentList.some(v => v.id === finalVisit.id);
            const updated = exists
                ? currentList.map(v => v.id === finalVisit.id ? finalVisit : v)
                : [finalVisit, ...currentList];
            onUpdateMedicalVisits(updated);
        }
        setIsVisitFormOpen(false);
    };

    const handleDeleteMedicalVisit = async (visitId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta visita médica?')) {
            await deleteDocument('medical_visits', visitId);
            if (onUpdateMedicalVisits) {
                onUpdateMedicalVisits((allMedicalVisits || []).filter(v => v.id !== visitId));
            }
        }
    };

    const handleOpenContactForm = (contact: RelatedContact | null) => {
        setEditingContact(contact);
        setIsContactFormOpen(true);
    };

    const handleSaveContact = (contactData: Omit<RelatedContact, 'id'> & { id?: string }) => {
        if (!studentData || !allStudents || !onUpdateStudents) return;

        let updatedContacts: RelatedContact[];

        if (contactData.id) { // Editing
            updatedContacts = (studentData.relatedContacts || []).map(c =>
                c.id === contactData.id ? { ...c, ...contactData } as RelatedContact : c
            );
        } else { // Adding
            const newContact: RelatedContact = {
                ...contactData,
                id: `contact-${Date.now()}`,
            };
            updatedContacts = [...(studentData.relatedContacts || []), newContact];
        }

        const updatedStudent = { ...studentData, relatedContacts: updatedContacts };
        
        setStudentData(updatedStudent);
        saveDocument('students', updatedStudent.id, updatedStudent);

        const updatedAllStudents = allStudents.map(s =>
            s.id === studentData.id ? updatedStudent : s
        );
        onUpdateStudents(updatedAllStudents);
        setIsContactFormOpen(false);
    };
    
    const handleDeleteContact = (contactId: string) => {
        if (!studentData || !allStudents || !onUpdateStudents) return;
        if (window.confirm('¿Está seguro de que desea eliminar este contacto?')) {
            const updatedContacts = (studentData.relatedContacts || []).filter(c => c.id !== contactId);
            const updatedStudent = { ...studentData, relatedContacts: updatedContacts };
            setStudentData(updatedStudent);
            saveDocument('students', updatedStudent.id, updatedStudent);

            const updatedAllStudents = allStudents.map(s =>
                s.id === studentData.id ? updatedStudent : s
            );
            onUpdateStudents(updatedAllStudents);
        }
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
        const currentClasses = allClasses || MOCK_CLASSES;
        const currentTimetables = timetables || [];
        const currentUsers = allUsers || MOCK_USERS;

        const studentClass = currentClasses.find(c => c.id === profileData.classId);
        const instTimetables = currentTimetables.filter(t => !t.institutionId || (studentClass?.institutionId && t.institutionId === studentClass.institutionId));
        const classTimetable = studentClass?.timetableId 
            ? currentTimetables.find(t => t.id === studentClass.timetableId)
            : (instTimetables[0] || currentTimetables[0] || null);

        const tutor = studentClass?.tutorId ? currentUsers.find(u => u.id === studentClass.tutorId) : null;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column: Student Details */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-lg border flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{profileData.name}</h3>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {profileData.id}</p>
                        </div>
                        {isEditable && (
                            <button
                                onClick={() => setIsEditGeneralOpen(true)}
                                className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                                title="Editar datos personales, fecha de nacimiento o enlace Google Maps"
                            >
                                <EditIcon className="h-3.5 w-3.5" />
                                <span>Editar Ficha</span>
                            </button>
                        )}
                    </div>
    
                    <div className="bg-white p-4 rounded-lg border space-y-4">
                        <InfoItem label="Grado">{profileData.grade || studentClass?.name || 'No asignado'}</InfoItem>
                        <InfoItem label="No de Lista">{profileData.listNumber || 'N/A'}</InfoItem>
                        <InfoItem label="Cédula">{profileData.nationalId || 'No registrada'}</InfoItem>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-800 font-medium">{formattedBirthDate}</span>
                                </div>
                                {isEditable && (
                                    <button 
                                        onClick={() => setIsEditGeneralOpen(true)} 
                                        className="text-xs text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-slate-100"
                                        title="Editar fecha de nacimiento"
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            {isBirthDateExcelSerial && (
                                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 space-y-1.5">
                                    <div className="flex items-center gap-1 font-semibold text-[11px]">
                                        <span>⚠️</span>
                                        <span>Detectado formato numérico de Excel ({profileData.birthDate})</span>
                                    </div>
                                    <p className="text-[11px] text-amber-800">
                                        Fecha real calculada: <strong>{formattedBirthDate}</strong>
                                    </p>
                                    {isEditable && (
                                        <button
                                            type="button"
                                            onClick={handleFixStudentBirthDate}
                                            disabled={isFixingDate}
                                            className="w-full mt-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shadow-xs transition flex justify-center items-center gap-1"
                                        >
                                            {isFixingDate ? 'Guardando...' : '⚡ Guardar fecha estándar (YYYY-MM-DD)'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <InfoItem label="Género">{profileData.gender || 'No registrado'}</InfoItem>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección Domiciliaria</p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                    <LocationMarkerIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-800 break-words">{profileData.address || 'No registrada'}</span>
                                </div>
                                {isEditable && (
                                    <button 
                                        onClick={() => setIsEditGeneralOpen(true)}
                                        className="text-xs text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-slate-100"
                                        title="Editar dirección"
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Campo de Enlace de Ubicación para Google Maps */}
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Ubicación en Google Maps</span>
                                {profileData.homeLocationLink && (
                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                        Geolocalizado
                                    </span>
                                )}
                            </p>
                            <div className="mt-1.5">
                                {profileData.homeLocationLink ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <a
                                                href={profileData.homeLocationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-xs"
                                            >
                                                <ExternalLinkIcon className="h-4 w-4 text-emerald-600" />
                                                <span>Ver en Google Maps</span>
                                            </a>
                                            {isEditable && (
                                                <button
                                                    onClick={() => setIsEditGeneralOpen(true)}
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 py-1"
                                                >
                                                    <EditIcon className="h-3 w-3" /> Cambiar link
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-mono break-all truncate max-w-full bg-slate-50 p-1.5 rounded border border-slate-100" title={profileData.homeLocationLink}>
                                            {profileData.homeLocationLink}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 italic">
                                            <LocationMarkerIcon className="h-4 w-4 text-gray-300" />
                                            <span>Sin enlace registrado</span>
                                        </div>
                                        {isEditable && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() => setIsEditGeneralOpen(true)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
                                                >
                                                    <PlusIcon className="h-3.5 w-3.5" />
                                                    <span>Añadir enlace Google Maps</span>
                                                </button>
                                                {profileData.address && (
                                                    <button
                                                        onClick={handleAutoGenerateMapsFromAddress}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition"
                                                        title="Generar automáticamente enlace de búsqueda en Google Maps a partir de la dirección"
                                                    >
                                                        <span>🗺️ Buscar por dirección</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Asignación Académica y Horario Oficial */}
                    <div className="bg-white p-4 rounded-lg border border-primary-200 bg-primary-50/20 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4 text-primary-600" />
                                Asignación Académica y Horario
                            </h4>
                            <button 
                                onClick={() => setActiveTab('schedule')}
                                className="text-xs font-bold text-primary-600 hover:underline"
                            >
                                Ver Horario &rarr;
                            </button>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div>
                                <span className="font-semibold text-gray-600">Paralelo / Aula:</span>
                                <p className="font-bold text-gray-800">{studentClass ? studentClass.name : 'Sin paralelo asignado'}</p>
                            </div>
                            {tutor && (
                                <div>
                                    <span className="font-semibold text-gray-600">Docente Tutor:</span>
                                    <p className="text-gray-800">{tutor.name} ({tutor.email})</p>
                                </div>
                            )}
                            <div>
                                <span className="font-semibold text-gray-600">Plantilla de Horario Asignada:</span>
                                <p className="font-bold text-primary-700">
                                    {classTimetable ? `${classTimetable.name} (${classTimetable.shift})` : 'Plantilla Institucional Matutina'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Right Column: Related Contacts */}
                <div className="lg:col-span-3 bg-white p-4 rounded-lg border">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                            Familiares y Contactos
                            {profileData.relatedContacts && profileData.relatedContacts.length > 0 && (
                                <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {profileData.relatedContacts.length}
                                </span>
                            )}
                        </h3>
                        {isEditable && (
                            <button onClick={() => handleOpenContactForm(null)} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                <PlusIcon className="h-4 w-4" />
                                Añadir Contacto
                            </button>
                        )}
                    </div>
                    {profileData.relatedContacts && profileData.relatedContacts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relación</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                        {isEditable && <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {profileData.relatedContacts.map(contact => (
                                        <tr key={contact.id}>
                                            <td className="px-2 py-3 text-sm text-gray-800">{contact.relation}</td>
                                            <td className="px-2 py-3 text-sm text-gray-800 break-words">{contact.name}</td>
                                            <td className="px-2 py-3 text-sm text-gray-500">{contact.occupation || '-'}</td>
                                            <td className="px-2 py-3 text-sm">
                                                <div className="flex items-center flex-wrap gap-3">
                                                    {contact.phone && <a href={`tel:${contact.phone}`} title={contact.phone} className="flex items-center gap-1 text-gray-500 hover:text-primary-600"><PhoneIcon className="h-4 w-4" /> <span className="sr-only">Teléfono</span></a>}
                                                    {contact.email && <a href={`mailto:${contact.email}`} title={contact.email} className="flex items-center gap-1 text-gray-500 hover:text-primary-600"><EmailIcon className="h-4 w-4" /> <span className="sr-only">Email</span></a>}
                                                </div>
                                            </td>
                                            {isEditable && (
                                                <td className="px-2 py-3 text-right">
                                                    <button onClick={() => handleOpenContactForm(contact)} className="p-1 text-gray-500 hover:text-blue-600" title="Editar"><EditIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteContact(contact.id)} className="p-1 text-gray-500 hover:text-red-600" title="Eliminar"><TrashIcon className="h-5 w-5" /></button>
                                                </td>
                                            )}
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
                                        <button onClick={() => handleDeleteIntervention(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100" title="Eliminar Intervención">
                                            <TrashIcon className="h-5 w-5" />
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
                                          <div className="flex items-center gap-1">
                                              <button 
                                                  onClick={() => setPrintingVisit(visit)} 
                                                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                  title="Imprimir Certificado">
                                                  <PrinterIcon className="h-5 w-5" />
                                              </button>
                                              <button 
                                                  onClick={() => handleDeleteMedicalVisit(visit.id)} 
                                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                  title="Eliminar Visita Médica">
                                                  <TrashIcon className="h-5 w-5" />
                                              </button>
                                          </div>
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
        if (!profileData) {
            return <p className="text-gray-500 py-4 text-center">Cargando datos del estudiante...</p>;
        }
        
        const currentClasses = allClasses || MOCK_CLASSES;
        const currentSchedule = schedule || [];
        const currentSubjects = subjects || [];
        const currentTimeSlots = timeSlots || [];
        const currentRooms = rooms || [];
        const currentTimetables = timetables || [];
        const currentUsers = allUsers || MOCK_USERS;

        const studentClass = currentClasses.find(c => c.id === profileData.classId);
        if (!studentClass) {
            return (
                <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
                    <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-base font-semibold text-gray-700">Sin paralelo asignado</p>
                    <p className="text-sm text-gray-500 mt-1">El estudiante no está matriculado en ninguna clase o paralelo actualmente.</p>
                </div>
            );
        }

        const classScheduleEntries = currentSchedule.filter(e => e.classId === studentClass.id);
        const usedSlotIds = new Set(classScheduleEntries.map(e => e.timeSlotId));

        // Find timetable template for this class or fallback to institution's timetable
        const instTimetables = currentTimetables.filter(t => !t.institutionId || (studentClass.institutionId && t.institutionId === studentClass.institutionId));
        const classTimetable = studentClass.timetableId 
            ? currentTimetables.find(t => t.id === studentClass.timetableId)
            : (instTimetables[0] || currentTimetables[0] || null);

        // Gather relevant time slots: matching timetableId, used in schedule, or matching shift
        let candidateSlots = currentTimeSlots.filter(ts => {
            if (classTimetable && ts.timetableId === classTimetable.id) return true;
            if (usedSlotIds.has(ts.id)) return true;
            return false;
        });

        // Fallback: if candidateSlots is empty, try matching by shift of the timetable or all available institution slots
        if (candidateSlots.length === 0) {
            if (classTimetable?.shift) {
                candidateSlots = currentTimeSlots.filter(ts => ts.shift === classTimetable.shift);
            }
            if (candidateSlots.length === 0) {
                candidateSlots = currentTimeSlots;
            }
        }

        // Deduplicate time slots by id and sort chronologically
        const seenSlotIds = new Set<string>();
        const relevantTimeSlots: TimeSlot[] = [];
        candidateSlots.forEach(ts => {
            if (!seenSlotIds.has(ts.id)) {
                seenSlotIds.add(ts.id);
                relevantTimeSlots.push(ts);
            }
        });
        relevantTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (relevantTimeSlots.length === 0) {
            return (
                <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
                    <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-base font-semibold text-gray-700">Horario no configurado</p>
                    <p className="text-sm text-gray-500 mt-1">
                        El paralelo <strong>{studentClass.name}</strong> aún no cuenta con franjas horarias configuradas en la institución.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-gray-200">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Paralelo Asignado:</span>
                        <h4 className="text-sm font-bold text-gray-800">{studentClass.name}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 font-semibold px-2.5 py-1 rounded-full">
                            Plantilla: {classTimetable ? `${classTimetable.name} (${classTimetable.shift})` : 'Plantilla General'}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-full">
                            {classScheduleEntries.length} horas programadas
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-full">
                            {relevantTimeSlots.length} franjas horarias
                        </span>
                    </div>
                </div>

                {classScheduleEntries.length === 0 && (
                    <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>
                            El paralelo está vinculado a la plantilla horaria oficial <strong>{classTimetable ? `${classTimetable.name} (${classTimetable.shift})` : 'Institucional'}</strong>. Aún no se han registrado asignaciones de asignaturas en el distributivo semanal. A continuación se presentan las franjas horarias oficiales de su jornada.
                        </span>
                    </div>
                )}

                <ScheduleView
                    title={`Horario Semanal - ${studentClass.name}`}
                    scheduleEntries={classScheduleEntries}
                    timeSlots={relevantTimeSlots}
                    subjects={currentSubjects}
                    classes={currentClasses}
                    rooms={currentRooms}
                    users={currentUsers}
                    viewType="student"
                />
            </div>
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
                                    <PrinterIcon className="h-5 w-5" /> Imprimir / PDF
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
                                    <PrinterIcon className="h-5 w-5" /> Imprimir / PDF
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
                    institutionId={studentData?.institutionId || effectiveInstitutionId}
                />
            )}
            {isVisitFormOpen && (
                <MedicalVisitForm
                    isOpen={isVisitFormOpen}
                    onClose={() => setIsVisitFormOpen(false)}
                    onSave={handleSaveMedicalVisit}
                    studentId={studentId}
                    institutionId={studentData?.institutionId || effectiveInstitutionId}
                    healthProfessionalId={user?.id || 'prof-salud'}
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
                                    <PrinterIcon className="h-5 w-5" /> Imprimir / PDF
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
            {isContactFormOpen && (
                <ContactForm
                    isOpen={isContactFormOpen}
                    onClose={() => setIsContactFormOpen(false)}
                    onSave={handleSaveContact}
                    contactToEdit={editingContact}
                />
            )}
            {isEditGeneralOpen && (
                <EditStudentGeneralModal
                    isOpen={isEditGeneralOpen}
                    onClose={() => setIsEditGeneralOpen(false)}
                    student={studentData}
                    onSave={handleSaveGeneralStudent}
                />
            )}
        </>
    );
};

export default StudentProfileCard;
