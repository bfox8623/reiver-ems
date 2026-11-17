import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { BOOTSTRAP_ADMINS } from '../config/bootstrap';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }
      const email = user.email;
      const ref = doc(db, 'users', email);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserProfile({ id: snap.id, ...snap.data() });
      } else if (BOOTSTRAP_ADMINS.includes(email)) {
        const profile = {
          uid: user.uid,
          fullName: user.displayName || email.split('@')[0],
          email,
          role: 'ADMIN',
          division: 'Manajerial',
          position: 'Administrator',
          accountStatus: 'Active',
          createdAt: serverTimestamp(),
        };
        await setDoc(ref, profile);
        setUserProfile({ id: email, ...profile });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const requestAccess = async ({ fullName, division, position }) => {
    if (!firebaseUser) return;
    const email = firebaseUser.email;
    const ref = doc(db, 'users', email);
    const profile = {
      uid: firebaseUser.uid,
      fullName: fullName || firebaseUser.displayName || email.split('@')[0],
      email,
      role: 'STAFF',
      division,
      position: position || 'Staff',
      accountStatus: 'Pending',
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    setUserProfile({ id: email, ...profile });
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, login, logout, requestAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
