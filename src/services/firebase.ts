import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { AppData } from '../types';
import { INITIAL_APP_DATA } from '../constants/initialData';

const firebaseConfig = {
  apiKey: "AIzaSyAnUdWOOAZhOfRtx-GfW89pz1iKrDonz_s",
  authDomain: "birbir-town-khc-bible-sc-82849.firebaseapp.com",
  databaseURL: "https://birbir-town-khc-bible-sc-82849-default-rtdb.firebaseio.com",
  projectId: "birbir-town-khc-bible-sc-82849",
  storageBucket: "birbir-town-khc-bible-sc-82849.firebasestorage.app",
  messagingSenderId: "745550786105",
  appId: "1:745550786105:web:6724bcaecde6d39b1967e8"
};

let dbInstance: any = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  dbInstance = getDatabase(app);
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export const db = dbInstance;

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

  if (!db) {
    onStatusChange('offline');
    return () => {};
  }

  try {
    const dataRef = ref(db, DB_KEY);

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.val();
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
        } else {
          // Initialize remote DB if empty
          set(dataRef, initialLocal)
            .then(() => onStatusChange('connected'))
            .catch(() => onStatusChange('offline'));
        }
      },
      (error) => {
        console.warn('Firebase sync notice (offline mode active):', error);
        onStatusChange('offline');
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firebase listener error, running in local persistence mode:', err);
    onStatusChange('offline');
    return () => {};
  }
};

export const syncAppDataToFirebase = async (data: AppData): Promise<boolean> => {
  saveToLocalStorage(data);
  if (!db) return false;

  try {
    const dataRef = ref(db, DB_KEY);
    await set(dataRef, data);
    return true;
  } catch (error) {
    console.warn('Could not sync to Firebase remote, saved locally:', error);
    return false;
  }
};
