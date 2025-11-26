/**
 * @description Provides authentication context and admin route protection without strict Firebase/JSX types.
 * @returns AuthProvider component and AdminRoute guard.
 * @author GPT-Mentor
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase'; // adjust path if needed

type AuthContextType = {
  user: any; // relaxed typing to avoid importing Firebase User
  isAdmin: boolean | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        setIsAdmin(Boolean(snap.data()?.isAdmin));
      } catch (error) {
        alert('Error checking admin status: ' + error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading || isAdmin === null) {
    return <div className="p-6 text-center">Checking admin permissions...</div>;
    // You can swap this for a spinner component later.
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
