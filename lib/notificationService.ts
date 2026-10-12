import type { Notification as AppNotification, User, AbsenceRequest, Class, Subject } from '../types';
import { Role } from '../types';
import { saveDocument } from './firebase';

/**
 * Request browser permission for Push / Web Notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.info('Las notificaciones Push no están soportadas en este navegador o entorno.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error al solicitar permiso de notificaciones:', e);
      return 'denied';
    }
  }

  return Notification.permission;
}

/**
 * Play a gentle notification sound using Web Audio API
 */
export function playNotificationSound() {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Triggers a browser native Push Notification
 */
export function sendBrowserPushNotification(title: string, options?: { body?: string; icon?: string; tag?: string }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  playNotificationSound();

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || '',
        icon: options?.icon || '/favicon.ico',
        tag: options?.tag || `notif-${Date.now()}`,
      });

      // Auto close after 7 seconds
      setTimeout(() => {
        try {
          notif.close();
        } catch {
          // ignore
        }
      }, 7000);
    } catch (err) {
      console.warn('No se pudo instanciar la notificación nativa del navegador:', err);
    }
  }
}

/**
 * Helper to build and persist an in-app and push notification
 */
export async function sendSystemNotification(
  params: {
    userId: string;
    institutionId: string;
    title: string;
    message: string;
  },
  currentNotifications: AppNotification[],
  onUpdateNotifications?: (notifs: AppNotification[]) => void
): Promise<AppNotification> {
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    institutionId: params.institutionId || '',
    userId: params.userId,
    title: params.title,
    message: params.message,
    date: new Date().toISOString(),
    read: false,
  };

  // Trigger browser push notification
  sendBrowserPushNotification(params.title, { body: params.message });

  // Persist in Firestore
  await saveDocument('notifications', newNotif.id, newNotif);

  // Update in-memory state
  if (onUpdateNotifications) {
    onUpdateNotifications([newNotif, ...(currentNotifications || [])]);
  }

  return newNotif;
}

/**
 * Notify all Inspection staff when a teacher reports an absence/substitution request
 */
export async function notifyInspeccionOnAbsenceRequest(params: {
  absenceRequest: AbsenceRequest;
  docenteTitular?: User;
  subject?: Subject;
  classObj?: Class;
  users: User[];
  currentNotifications: AppNotification[];
  onUpdateNotifications?: (notifs: AppNotification[]) => void;
}) {
  const { absenceRequest, docenteTitular, subject, classObj, users, currentNotifications, onUpdateNotifications } = params;

  // Filter inspection, rector, admin, or superadmin users for the institution
  const inspectors = users.filter(u => 
    (u.role === Role.InspectorGeneral || u.role === Role.SuperAdmin || u.role === Role.InstitutionAdmin || u.role === Role.Rector || u.role === Role.Vicerrector) &&
    (u.institutionId === absenceRequest.institutionId || u.institutionId === 'none' || !u.institutionId)
  );

  const titularName = docenteTitular?.name || 'Docente Titular';
  const subName = subject?.name || 'Asignatura';
  const clsName = classObj?.name || 'Curso';

  const title = `🚨 Nueva Solicitud de Sustitución - ${clsName}`;
  const message = `${titularName} ha reportado ausencia para el ${absenceRequest.fecha} (Periodo ${absenceRequest.periodo}) en ${subName}. Tareas/Instrucciones: "${absenceRequest.instrucciones}". Requiere asignación de reemplazo.`;

  // Send push notification
  sendBrowserPushNotification(title, { body: message });

  const createdNotifications: AppNotification[] = [];
  for (const inspector of inspectors) {
    const notif: AppNotification = {
      id: `notif-abs-${Date.now()}-${inspector.id.substring(0, 5)}`,
      institutionId: absenceRequest.institutionId,
      userId: inspector.id,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    await saveDocument('notifications', notif.id, notif);
    createdNotifications.push(notif);
  }

  if (onUpdateNotifications && createdNotifications.length > 0) {
    onUpdateNotifications([...createdNotifications, ...(currentNotifications || [])]);
  }
}

/**
 * Notify both the requester (docente titular) and the replacement (docente reemplazante)
 * when Inspection assigns a substitution. Also informs inspection.
 */
export async function notifyOnReplacementAssigned(params: {
  absenceRequest: AbsenceRequest;
  docenteTitular?: User;
  docenteReemplazante?: User;
  subject?: Subject;
  classObj?: Class;
  users: User[];
  currentNotifications: AppNotification[];
  onUpdateNotifications?: (notifs: AppNotification[]) => void;
}) {
  const { 
    absenceRequest, 
    docenteTitular, 
    docenteReemplazante, 
    subject, 
    classObj, 
    users, 
    currentNotifications, 
    onUpdateNotifications 
  } = params;

  const titularName = docenteTitular?.name || 'Docente Titular';
  const reemplazanteName = docenteReemplazante?.name || absenceRequest.docenteReemplazanteNombre || 'Docente Asignado';
  const subName = subject?.name || 'Asignatura';
  const clsName = classObj?.name || 'Paralelo';

  const createdNotifications: AppNotification[] = [];

  // 1. Notificación al SOLICITANTE (Docente Titular)
  if (absenceRequest.docenteTitularId) {
    const titularTitle = `✅ Reemplazo Asignado: ${clsName} - ${subName}`;
    const titularMessage = `Se ha asignado a ${reemplazanteName} como su reemplazo para la clase del ${absenceRequest.fecha} (Periodo ${absenceRequest.periodo}). Las instrucciones y planificación fueron entregadas exitosamente.`;
    
    sendBrowserPushNotification(titularTitle, { body: titularMessage });

    const notifTitular: AppNotification = {
      id: `notif-tit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: absenceRequest.institutionId,
      userId: absenceRequest.docenteTitularId,
      title: titularTitle,
      message: titularMessage,
      date: new Date().toISOString(),
      read: false,
    };
    await saveDocument('notifications', notifTitular.id, notifTitular);
    createdNotifications.push(notifTitular);
  }

  // 2. Notificación al REEMPLAZANTE (Docente que cubre la clase)
  if (absenceRequest.docenteReemplazanteId) {
    const reemplazoTitle = `📋 Sustitución Asignada: ${subName} en ${clsName}`;
    const infoExtra = absenceRequest.planificacionUrl ? ` | Material: ${absenceRequest.planificacionUrl}` : '';
    const reemplazoMessage = `Ha sido asignado como reemplazo de ${titularName} para el ${absenceRequest.fecha} (Periodo ${absenceRequest.periodo}). Instrucciones: "${absenceRequest.instrucciones}"${infoExtra}. Recuerde impartir la clase y registrarla en el Leccionario.`;

    sendBrowserPushNotification(reemplazoTitle, { body: reemplazoMessage });

    const notifReemplazante: AppNotification = {
      id: `notif-rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: absenceRequest.institutionId,
      userId: absenceRequest.docenteReemplazanteId,
      title: reemplazoTitle,
      message: reemplazoMessage,
      date: new Date().toISOString(),
      read: false,
    };
    await saveDocument('notifications', notifReemplazante.id, notifReemplazante);
    createdNotifications.push(notifReemplazante);
  }

  // 3. Notificación a Inspección (Confirmación de Cobertura)
  const inspectors = users.filter(u => 
    (u.role === Role.InspectorGeneral || u.role === Role.SuperAdmin || u.role === Role.InstitutionAdmin || u.role === Role.Rector || u.role === Role.Vicerrector) &&
    (u.institutionId === absenceRequest.institutionId || u.institutionId === 'none' || !u.institutionId)
  );

  for (const inspector of inspectors) {
    const notifInsp: AppNotification = {
      id: `notif-inspconf-${Date.now()}-${inspector.id.substring(0, 5)}`,
      institutionId: absenceRequest.institutionId,
      userId: inspector.id,
      title: `🔔 Cobertura Confirmada - ${clsName}`,
      message: `${reemplazanteName} ha sido asignado para cubrir la ausencia de ${titularName} en ${subName} el ${absenceRequest.fecha} (Periodo ${absenceRequest.periodo}).`,
      date: new Date().toISOString(),
      read: false,
    };
    await saveDocument('notifications', notifInsp.id, notifInsp);
    createdNotifications.push(notifInsp);
  }

  if (onUpdateNotifications && createdNotifications.length > 0) {
    onUpdateNotifications([...createdNotifications, ...(currentNotifications || [])]);
  }
}

/**
 * Notify when replacement details are recorded into Leccionario
 */
export async function notifyOnLeccionarioRegistered(params: {
  absenceRequest: AbsenceRequest;
  docenteReemplazante?: User;
  docenteTitular?: User;
  subject?: Subject;
  classObj?: Class;
  users: User[];
  currentNotifications: AppNotification[];
  onUpdateNotifications?: (notifs: AppNotification[]) => void;
}) {
  const { 
    absenceRequest, 
    docenteReemplazante, 
    docenteTitular, 
    subject, 
    classObj, 
    users, 
    currentNotifications, 
    onUpdateNotifications 
  } = params;

  const titularName = docenteTitular?.name || 'Docente Titular';
  const reemplazanteName = docenteReemplazante?.name || absenceRequest.docenteReemplazanteNombre || 'Docente Reemplazante';
  const subName = subject?.name || 'Asignatura';
  const clsName = classObj?.name || 'Paralelo';

  const title = `📖 Leccionario Registrado: Reemplazo en ${clsName}`;
  const message = `${reemplazanteName} ha registrado satisfactoriamente la clase de reemplazo de ${subName} del ${absenceRequest.fecha} (Periodo ${absenceRequest.periodo}) en el Leccionario Oficial.`;

  sendBrowserPushNotification(title, { body: message });

  const createdNotifications: AppNotification[] = [];

  // Notify titular teacher
  if (absenceRequest.docenteTitularId) {
    const notif: AppNotification = {
      id: `notif-lecrep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: absenceRequest.institutionId,
      userId: absenceRequest.docenteTitularId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    await saveDocument('notifications', notif.id, notif);
    createdNotifications.push(notif);
  }

  // Notify inspectors
  const inspectors = users.filter(u => 
    (u.role === Role.InspectorGeneral || u.role === Role.SuperAdmin || u.role === Role.InstitutionAdmin || u.role === Role.Rector || u.role === Role.Vicerrector) &&
    (u.institutionId === absenceRequest.institutionId || u.institutionId === 'none' || !u.institutionId)
  );

  for (const inspector of inspectors) {
    const notif: AppNotification = {
      id: `notif-lecinsp-${Date.now()}-${inspector.id.substring(0, 5)}`,
      institutionId: absenceRequest.institutionId,
      userId: inspector.id,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    await saveDocument('notifications', notif.id, notif);
    createdNotifications.push(notif);
  }

  if (onUpdateNotifications && createdNotifications.length > 0) {
    onUpdateNotifications([...createdNotifications, ...(currentNotifications || [])]);
  }
}
