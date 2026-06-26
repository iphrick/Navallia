import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import type { User, UserCredential } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  inviteId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register new user.
 * If inviteId is provided, it consumes the invite and links to the existing barbershop.
 * Otherwise, does NOT set barbershopId — that is done during /onboarding.
 */
export const registerUser = async (data: RegisterData): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);

  // Update display name
  await updateProfile(credential.user, { displayName: data.name });

  let barbershopId = "";

  // Process Invite if provided
  if (data.inviteId) {
    const inviteRef = doc(db, "invites", data.inviteId);
    const inviteSnap = await getDoc(inviteRef);
    
    if (inviteSnap.exists() && inviteSnap.data().status === "pending") {
      barbershopId = inviteSnap.data().barbershopId;

      // Update Barbershop Owner
      await updateDoc(doc(db, "barbershops", barbershopId), {
        ownerId: credential.user.uid
      });

      // Mark invite as used
      await updateDoc(inviteRef, {
        status: "used",
        usedBy: credential.user.uid,
        usedAt: serverTimestamp()
      });
    }
  }

  // Create user document in Firestore
  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name: data.name,
    email: data.email,
    role: "owner",
    barbershopId: barbershopId, // Set if invite used, else empty
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential;
};

/** Login user */
export const loginUser = async (data: LoginData): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, data.email, data.password);
};

/** Logout user */
export const logoutUser = async (): Promise<void> => {
  return signOut(auth);
};

/** Send password reset email */
export const sendPasswordReset = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

/** Subscribe to auth state changes */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/** Get user document from Firestore */
export const getUserDocument = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

/** Update user document in Firestore */
export const updateUserDocument = async (uid: string, data: Partial<Record<string, unknown>>) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};
