import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchPlayerData(session.user.id);
      } else {
        setPlayerData(null);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      await fetchPlayerData(session.user.id);
    }
    setLoading(false);
  }

  async function fetchPlayerData(userId) {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setPlayerData(data);
    }
  }

  async function signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: insertError } = await supabase.from('players').insert({
        user_id: data.user.id,
        username,
        balance: 10000,
      });
      if (insertError) throw insertError;
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPlayerData(null);
  }

  return (
    <AuthContext.Provider value={{ user, playerData, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
}
