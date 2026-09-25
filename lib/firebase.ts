import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, getDoc,
  deleteDoc, onSnapshot, writeBatch, Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  MOCK_INSTITUTIONS, MOCK_USERS, MOCK_CLASSES, MOCK_STUDENTS, 
  MOCK_SUBJECTS, MOCK_ROOMS, MOCK_TIMETABLES, MOCK_NOTIFICATIONS,
  MOCK_FORMAL_REQUESTS, MOCK_STAFF_ATTENDANCE, MOCK_INSTITUTIONAL_DOCUMENTS,
  MOCK_MEETING_RECORDS
} from '../constants';
import { Institution, User } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
export const FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data`;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sanitize payload removing undefined properties (Firestore rejects undefined)
function cleanPayload<T>(obj: T): any {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Persist or update a document in Firestore
 */
export async function saveDocument(collectionName: string, id: string, data: any): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    const sanitized = cleanPayload(data);
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error al guardar en Firestore (${collectionName}/${id}):`, error);
    return false;
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(collectionName: string, id: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error al eliminar en Firestore (${collectionName}/${id}):`, error);
    return false;
  }
}

/**
 * Subscribe to real-time changes in a collection
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string, 
  onUpdate: (items: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items: T[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data() as any;
        return {
          ...data,
          id: docSnap.id,
        } as T;
      });
      onUpdate(items);
    }
  }, (err) => {
    console.warn(`Firestore listener warning (${collectionName}):`, err.message);
  });
}

// Connectivity test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await setDoc(doc(db, 'test', 'connection'), {
      status: 'active',
      app: 'Amauta',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: client is offline.");
    } else {
      console.log("Firestore test connection check executed:", error);
    }
    return false;
  }
}

// Seed initial data to Firestore so the user sees all collections in Firebase Console
export async function seedInitialFirestoreData(): Promise<{ institutionsCount: number; usersCount: number }> {
  let instCount = 0;
  let userCount = 0;

  try {
    // 1. Seed Test Connection
    await setDoc(doc(db, 'test', 'connection'), {
      status: 'connected',
      app: 'Amauta School Management',
      databaseId: FIRESTORE_DATABASE_ID,
      seededAt: new Date().toISOString(),
    }, { merge: true });

    // 2. Seed Institutions with complete data
    for (const inst of MOCK_INSTITUTIONS) {
      await saveDocument('institutions', inst.id, inst);
      instCount++;
    }

    // 3. Seed Users
    for (const u of MOCK_USERS) {
      await saveDocument('users', u.id, u);
      userCount++;
    }

    // 4. Seed Classes
    for (const c of MOCK_CLASSES) {
      await saveDocument('classes', c.id, c);
    }

    // 5. Seed Students
    for (const s of MOCK_STUDENTS) {
      await saveDocument('students', s.id, s);
    }

    // 6. Seed Subjects
    for (const sub of MOCK_SUBJECTS) {
      await saveDocument('subjects', sub.id, sub);
    }

    // 7. Seed Rooms
    for (const r of MOCK_ROOMS) {
      await saveDocument('rooms', r.id, r);
    }

    // 8. Seed Timetables
    for (const t of MOCK_TIMETABLES) {
      await saveDocument('timetables', t.id, t);
    }

    // 9. Seed Notifications
    for (const n of MOCK_NOTIFICATIONS) {
      await saveDocument('notifications', n.id, n);
    }

    // 10. Seed Documents
    for (const d of MOCK_INSTITUTIONAL_DOCUMENTS) {
      await saveDocument('institutional_documents', d.id, d);
    }

    // 11. Seed Meetings
    for (const m of MOCK_MEETING_RECORDS) {
      await saveDocument('meeting_records', m.id, m);
    }

    // 12. Seed Formal Requests
    for (const f of MOCK_FORMAL_REQUESTS) {
      await saveDocument('formal_requests', f.id, f);
    }

    console.log(`Firestore seeded successfully with all initial collections.`);
    return { institutionsCount: instCount, usersCount: userCount };
  } catch (error) {
    console.error("Error seeding initial Firestore data:", error);
    return { institutionsCount: instCount, usersCount: userCount };
  }
}

// Automatically test connection and check if seeding is needed
testConnection().then(async (connected) => {
  if (connected) {
    try {
      const snap = await getDocs(collection(db, 'institutions'));
      if (snap.empty) {
        console.log("Firestore está vacío, sembrando colecciones iniciales...");
        await seedInitialFirestoreData();
      }
    } catch (e) {
      console.warn("Auto-seed check failed or rules denied:", e);
    }
  }
});
