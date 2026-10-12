import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { AppData } from '../types';
import { INITIAL_APP_DATA } from '../constants/initialData';

const firebaseConfig = {
  apiKey: "AIzaSyBx7ZJxRNzjNb8Lx79R2vXjWq-MsZBPTfA",
  authDomain: "birbir-town-khc-child-page.firebaseapp.com",
  databaseURL: "https://birbir-town-khc-child-page-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "birbir-town-khc-child-page",
  storageBucket: "birbir-town-khc-child-page.firebasestorage.app",
  messagingSenderId: "1007927588446",
  appId: "1:1007927588446:web:b85df399e7b1b89c1d26cf"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);

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
  const dataRef = ref(db, DB_KEY);

  let initialLocal = loadStoredLocalData();
  onData(initialLocal);

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
      console.warn('Firebase sync warning:', error);
      onStatusChange('offline');
    }
  );

  return unsubscribe;
};

export const syncAppDataToFirebase = async (data: AppData): Promise<boolean> => {
  saveToLocalStorage(data);
  try {
    const dataRef = ref(db, DB_KEY);
    await set(dataRef, data);
    return true;
  } catch (error) {
    console.error('Failed to sync to Firebase, saved locally', error);
    return false;
  }
};
