import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, getDoc,
  query, where, onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { MOCK_INSTITUTIONS, MOCK_USERS } from '../constants';
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

// Connectivity test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    // Write and read test document so the collection immediately appears in the Firebase Console
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

// Seed initial data to Firestore so the user sees the collections in Firebase Console
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

    // 2. Seed Institutions
    for (const inst of MOCK_INSTITUTIONS) {
      const instRef = doc(db, 'institutions', inst.id);
      await setDoc(instRef, {
        id: inst.id,
        name: inst.name,
        code: inst.codeAMIE || '',
        address: inst.contact?.address || '',
        phone: inst.contact?.phone || '',
        email: inst.contact?.email || '',
        logoUrl: inst.logoUrl || ''
      }, { merge: true });
      instCount++;
    }

    // 3. Seed Users
    for (const u of MOCK_USERS) {
      const userRef = doc(db, 'users', u.id);
      await setDoc(userRef, {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        institutionId: u.institutionId || '',
        cedula: u.cedula || ''
      }, { merge: true });
      userCount++;
    }

    console.log(`Firestore seeded successfully with ${instCount} institutions and ${userCount} users.`);
    return { institutionsCount: instCount, usersCount: userCount };
  } catch (error) {
    console.error("Error seeding initial Firestore data:", error);
    return { institutionsCount: instCount, usersCount: userCount };
  }
}

// Automatically test connection and seed on boot
testConnection().then(() => {
  seedInitialFirestoreData();
});
