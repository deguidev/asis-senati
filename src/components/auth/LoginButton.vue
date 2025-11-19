<template>
  <div class="mt-8">
    <p class="text-center text-sm font-semibold text-gray-700 mb-4">
      <Icon icon="mdi:shield-account" width="20" height="20" class="inline mr-1" />
      Solo Personal Autorizado
    </p>
    
    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <!-- Botón Google -->
      <button
        @click="iniciarSesion('google')"
        :disabled="cargando"
        class="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        <Icon 
          :icon="cargando === 'google' ? 'mdi:loading' : 'mdi:google'" 
          width="24" 
          height="24"
          :class="{ 'animate-spin': cargando === 'google' }"
          class="text-red-500"
        />
        <span>{{ cargando === 'google' ? 'Iniciando...' : 'Iniciar con Google' }}</span>
      </button>

      <!-- Botón Microsoft -->
      <button
        @click="iniciarSesion('azure')"
        :disabled="cargando"
        class="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        <Icon 
          :icon="cargando === 'azure' ? 'mdi:loading' : 'mdi:microsoft'" 
          width="24" 
          height="24"
          :class="{ 'animate-spin': cargando === 'azure' }"
          class="text-blue-600"
        />
        <span>{{ cargando === 'azure' ? 'Iniciando...' : 'Iniciar con Microsoft' }}</span>
      </button>
    </div>
  </div>
  
  <p class="text-center text-xs text-gray-500 mt-4">
    <Icon icon="mdi:lock" width="14" height="14" class="inline mr-1" />
    Acceso restringido solo para personal autorizado de SENATI
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { supabase } from '@/lib/supabaseClient';

const emit = defineEmits(['login-success']);

const cargando = ref<string | false>(false);

const iniciarSesion = async (provider: 'google' | 'azure') => {
  cargando.value = provider;
  
  try {
    // URL de redirección después de autenticarse
    const redirectUrl = `${window.location.origin}/`;
    
    // Configurar scopes específicos para Azure
    const options: any = {
      redirectTo: redirectUrl
    };
    
    // Para Azure, agregar scopes explícitos
    if (provider === 'azure') {
      options.scopes = 'openid email profile';
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: options
    });

    if (error) throw error;
    
    // El usuario será redirigido al proveedor para autenticarse
    // Cuando regrese, el estado de autenticación se actualizará automáticamente
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    alert(`Error al iniciar sesión: ${error.message}`);
    cargando.value = false;
  }
};
</script>
