<template>
  <div class="mb-5">
    <button
      v-if="mostrarBoton" 
      @click="registrarMarcacion" 
      :disabled="cargando"
      class="w-full px-6 py-6 text-xl font-bold rounded-xl cursor-pointer flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:-translate-y-1 hover:shadow-xl"
    >
      <Icon 
        v-if="!cargando"
        icon="mdi:login"
        class="text-white animate-pulse"
        width="32" 
        height="32" 
      />
      <Icon 
        v-else
        icon="mdi:loading" 
        class="animate-spin text-white"
        width="32" 
        height="32" 
      />
      <span class="text-xl">
        {{ cargando ? 'Registrando...' : 'Marcar ENTRADA' }}
      </span>
    </button>

    <!-- Mensaje de feedback -->
    <AlertMessage 
      v-if="mensaje"
      :message="mensaje"
      :type="tipoMensaje"
      @close="mensaje = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';
import AlertMessage from '@/components/shared/AlertMessage.vue';

const props = defineProps({
  personaId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['marcacion-exitosa']);

const cargando = ref(false);
const mensaje = ref('');
const tipoMensaje = ref<'success' | 'error'>('success');
const mostrarBoton = ref(true);

onMounted(() => {
  verificarEstadoBoton();
});

watch(() => props.personaId, () => {
  verificarEstadoBoton();
});

const verificarEstadoBoton = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data: periodoActivo } = await supabase
      .from('periodos')
      .select('id')
      .eq('estado', true)
      .single();

    if (!periodoActivo) {
      mostrarBoton.value = true;
      return;
    }

    // Verificar si hay una entrada sin salida
    const { data: entradaPendiente } = await supabase
      .from('asistencia')
      .select('*')
      .eq('persona_id', props.personaId)
      .eq('periodo_id', periodoActivo.id)
      .eq('fecha', hoy)
      .is('hora_salida_real', null)
      .single();

    // Si hay entrada sin salida, ocultar botón
    mostrarBoton.value = !entradaPendiente;
  } catch (error) {
    // Si no hay registros, mostrar botón
    mostrarBoton.value = true;
  }
};

const registrarMarcacion = async () => {
  cargando.value = true;
  mensaje.value = '';

  try {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0];

    // Obtener el período activo
    const { data: periodoActivo } = await supabase
      .from('periodos')
      .select('id')
      .eq('estado', true)
      .single();

    if (!periodoActivo) {
      throw new Error('No hay período activo configurado');
    }

    // Solo registrar entrada
    const { error } = await supabase
      .from('asistencia')
      .insert({
        persona_id: props.personaId,
        periodo_id: periodoActivo.id,
        fecha: fecha,
        hora_entrada_real: hora,
        tipo: 'ENTRADA',
        estado: 'ASISTIO'
      });

    if (error) throw error;
    
    mensaje.value = '✓ Entrada registrada correctamente';
    tipoMensaje.value = 'success';
    
    // Ocultar el botón después de registrar entrada
    mostrarBoton.value = false;

    emit('marcacion-exitosa');
  } catch (error: any) {
    console.error('Error al registrar marcación:', error);
    mensaje.value = `✕ Error: ${error.message}`;
    tipoMensaje.value = 'error';
  } finally {
    cargando.value = false;
  }
};

// Exponer método para que el padre pueda actualizar el estado
defineExpose({
  verificarEstadoBoton
});
</script>

