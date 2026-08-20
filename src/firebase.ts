import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  where,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ActivityItem, Comment, Notification, Task, User } from './types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  COMMENTS: 'comments',
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
};

// ----------------- AUTHENTICATION HELPERS -----------------

export const loginWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const registerWithEmail = async (
  name: string,
  email: string,
  password: string,
  role: string,
  avatar: string
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const fbUser = credential.user;

  await updateProfile(fbUser, {
    displayName: name,
    photoURL: avatar,
  });

  const newUser: User = {
    id: fbUser.uid,
    name: name.trim(),
    email: email.trim(),
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: role || 'Software Engineer',
  };

  // Persist user profile to Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, fbUser.uid), newUser);
  return newUser;
};

export const loginWithGoogle = async (): Promise<User> => {
  const credential = await signInWithPopup(auth, googleProvider);
  const fbUser = credential.user;

  const userProfile: User = {
    id: fbUser.uid,
    name: fbUser.displayName || 'Developer',
    email: fbUser.email || '',
    avatar:
      fbUser.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Software Engineer',
  };

  // Upsert profile in Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, fbUser.uid), userProfile, { merge: true });
  return userProfile;
};

export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ----------------- FIRESTORE TASK ACTIONS -----------------

export const createTaskInFirestore = async (task: Task) => {
  const ref = doc(db, COLLECTIONS.TASKS, task.id);
  await setDoc(ref, task);
};

export const updateTaskInFirestore = async (taskId: string, updates: Partial<Task>) => {
  const ref = doc(db, COLLECTIONS.TASKS, taskId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTaskInFirestore = async (taskId: string) => {
  const ref = doc(db, COLLECTIONS.TASKS, taskId);
  await deleteDoc(ref);
};

export const bulkUpdateTasksInFirestore = async (
  taskIds: string[],
  updates: Partial<Task>
) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  taskIds.forEach((id) => {
    const ref = doc(db, COLLECTIONS.TASKS, id);
    batch.update(ref, { ...updates, updatedAt: now });
  });
  await batch.commit();
};

export const bulkDeleteTasksInFirestore = async (taskIds: string[]) => {
  const batch = writeBatch(db);
  taskIds.forEach((id) => {
    const ref = doc(db, COLLECTIONS.TASKS, id);
    batch.delete(ref);
  });
  await batch.commit();
};

// ----------------- FIRESTORE COMMENTS -----------------

export const addCommentToFirestore = async (comment: Comment) => {
  const ref = doc(db, COLLECTIONS.COMMENTS, comment.id);
  await setDoc(ref, comment);
};

export const updateCommentInFirestore = async (
  commentId: string,
  content: string
) => {
  const ref = doc(db, COLLECTIONS.COMMENTS, commentId);
  await updateDoc(ref, {
    content,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCommentInFirestore = async (commentId: string) => {
  const ref = doc(db, COLLECTIONS.COMMENTS, commentId);
  await deleteDoc(ref);
};

// ----------------- FIRESTORE AUDIT LOGS / ACTIVITIES -----------------

export const addActivityToFirestore = async (activity: ActivityItem) => {
  const ref = doc(db, COLLECTIONS.ACTIVITIES, activity.id);
  await setDoc(ref, activity);
};

// ----------------- FIRESTORE NOTIFICATIONS -----------------

export const addNotificationToFirestore = async (notif: Notification) => {
  const ref = doc(db, COLLECTIONS.NOTIFICATIONS, notif.id);
  await setDoc(ref, notif);
};

export const markNotificationReadInFirestore = async (notifId: string) => {
  const ref = doc(db, COLLECTIONS.NOTIFICATIONS, notifId);
  await updateDoc(ref, { read: true });
};

export const markAllNotificationsReadInFirestore = async (userId: string) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('recipientId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
};

// ----------------- FIRESTORE USER PROFILES -----------------

export const upsertUserProfileInFirestore = async (user: User) => {
  const ref = doc(db, COLLECTIONS.USERS, user.id);
  await setDoc(ref, user, { merge: true });
};

// ----------------- REAL-TIME SUBSCRIPTIONS -----------------

export const subscribeToUsers = (
  callback: (users: User[]) => void,
  onError?: (err: Error) => void
) => {
  const q = collection(db, COLLECTIONS.USERS);
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((d) => d.data() as User);
      callback(users);
    },
    onError
  );
};

export const subscribeToTasks = (
  callback: (tasks: Task[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTIONS.TASKS), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => d.data() as Task);
      callback(tasks);
    },
    onError
  );
};

export const subscribeToComments = (
  callback: (comments: Comment[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTIONS.COMMENTS), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((d) => d.data() as Comment);
      callback(comments);
    },
    onError
  );
};

export const subscribeToActivities = (
  callback: (activities: ActivityItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTIONS.ACTIVITIES), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const activities = snapshot.docs.map((d) => d.data() as ActivityItem);
      callback(activities);
    },
    onError
  );
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifs: Notification[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const notifs = snapshot.docs
        .map((d) => d.data() as Notification)
        .filter((n) => !userId || n.recipientId === userId);
      callback(notifs);
    },
    onError
  );
};
