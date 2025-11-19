import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(true);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user ?? null;
      isAuthenticated.value = !!session?.user;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      loading.value = false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      user.value = null;
      isAuthenticated.value = false;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Escuchar cambios en el estado de autenticación
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
      isAuthenticated.value = !!session?.user;
      loading.value = false;
    });
  };

  onMounted(() => {
    checkAuth();
    setupAuthListener();
  });

  return {
    user,
    isAuthenticated,
    loading,
    signOut,
    checkAuth
  };
}
