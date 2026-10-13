import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AppData } from '../types';
import { INITIAL_APP_DATA } from '../constants/initialData';

export const firebaseConfig = {
  apiKey: "AIzaSyAnUdWOOAZhOfRtx-GfW89pz1iKrDonz_s",
  authDomain: "birbir-town-khc-bible-sc-82849.firebaseapp.com",
  databaseURL: "https://birbir-town-khc-bible-sc-82849-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "birbir-town-khc-bible-sc-82849",
  storageBucket: "birbir-town-khc-bible-sc-82849.firebasestorage.app",
  messagingSenderId: "745550786105",
  appId: "1:745550786105:web:6724bcaecde6d39b1967e8"
};

let appInstance: any = null;
let rtdbInstance: any = null;
let firestoreInstance: any = null;

try {
  appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  try {
    rtdbInstance = getDatabase(appInstance);
  } catch (e) {
    console.warn('Realtime Database init note:', e);
  }
  try {
    firestoreInstance = getFirestore(appInstance);
  } catch (e) {
    console.warn('Firestore init note:', e);
  }
} catch (err) {
  console.warn('Firebase app init note:', err);
}

export const db = rtdbInstance;
export const firestore = firestoreInstance;

const DB_KEY = 'kaleheywet_data';
const LOCAL_STORAGE_KEY = 'birbir_khc_local_data';

export const loadStoredLocalData = (): AppData => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_APP_DATA,
        ...parsed,
        pins: { ...INITIAL_APP_DATA.pins, ...(parsed.pins || {}) },
        teachers: parsed.teachers || INITIAL_APP_DATA.teachers,
        plans: parsed.plans || INITIAL_APP_DATA.plans,
        choirGroups: parsed.choirGroups || INITIAL_APP_DATA.choirGroups,
        spiritualGroups: parsed.spiritualGroups || INITIAL_APP_DATA.spiritualGroups,
        subjects: parsed.subjects || INITIAL_APP_DATA.subjects,
      };
    }
  } catch (e) {
    console.error('Error reading localStorage data', e);
  }
  return INITIAL_APP_DATA;
};

export const saveToLocalStorage = (data: AppData) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

export const subscribeToAppData = (
  onData: (data: AppData) => void,
  onStatusChange: (status: 'connected' | 'saving' | 'offline' | 'error') => void
) => {
  const initialLocal = loadStoredLocalData();
  onData(initialLocal);

  let unsubRtdb: (() => void) | null = null;
  let unsubFirestore: (() => void) | null = null;

  const handleRemoteData = (val: any) => {
    if (val) {
      const mergedData: AppData = {
        ...INITIAL_APP_DATA,
        ...val,
        pins: val.pins || INITIAL_APP_DATA.pins,
        teachers: val.teachers || INITIAL_APP_DATA.teachers,
        subjects: val.subjects || INITIAL_APP_DATA.subjects,
        choirGroups: val.choirGroups || INITIAL_APP_DATA.choirGroups,
        spiritualGroups: val.spiritualGroups || INITIAL_APP_DATA.spiritualGroups,
        plans: val.plans || INITIAL_APP_DATA.plans,
        students: val.students || {},
        attendance: val.attendance || [],
        choirMembers: val.choirMembers || [],
        spiritualMembers: val.spiritualMembers || [],
        years: val.years || INITIAL_APP_DATA.years,
      };
      saveToLocalStorage(mergedData);
      onData(mergedData);
      onStatusChange('connected');
    }
  };

  // 1. Try Realtime Database
  if (db) {
    try {
      const dataRef = ref(db, DB_KEY);
      unsubRtdb = onValue(
        dataRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            handleRemoteData(val);
          } else {
            set(dataRef, initialLocal)
              .then(() => onStatusChange('connected'))
              .catch(() => {});
          }
        },
        (error) => {
          console.warn('RTDB sync notice:', error);
        }
      );
    } catch (err) {
      console.warn('RTDB connection error:', err);
    }
  }

  // 2. Try Firestore
  if (firestore) {
    try {
      const docRef = doc(firestore, 'church_data', DB_KEY);
      unsubFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            handleRemoteData(snap.data());
          }
        },
        (err) => {
          console.warn('Firestore sync notice:', err);
        }
      );
    } catch (err) {
      console.warn('Firestore connection error:', err);
    }
  }

  return () => {
    if (unsubRtdb) unsubRtdb();
    if (unsubFirestore) unsubFirestore();
  };
};

export const syncAppDataToFirebase = async (data: AppData): Promise<boolean> => {
  saveToLocalStorage(data);
  let synced = false;

  if (db) {
    try {
      const dataRef = ref(db, DB_KEY);
      await set(dataRef, data);
      synced = true;
    } catch (error) {
      console.warn('Could not sync to Realtime Database:', error);
    }
  }

  if (firestore) {
    try {
      const docRef = doc(firestore, 'church_data', DB_KEY);
      await setDoc(docRef, data, { merge: true });
      synced = true;
    } catch (error) {
      console.warn('Could not sync to Firestore:', error);
    }
  }

  return synced;
};

