<template>
  <div class="mb-5">
    <button 
      @click="registrarMovimiento" 
      :disabled="cargando"
      :class="[
        'w-full px-6 py-6 text-xl font-bold rounded-xl cursor-pointer flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed',
        tipoMovimiento === 'RETIRO' ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:-translate-y-1 hover:shadow-xl' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:-translate-y-1 hover:shadow-xl'
      ]"
    >
      <Icon 
        v-if="!cargando"
        :icon="tipoMovimiento === 'RETIRO' ? 'mdi:key-remove' : 'mdi:key-plus'" 
        :class="['text-white', tipoMovimiento === 'RETIRO' ? 'animate-pulse' : '']"
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
        {{ cargando ? 'Registrando...' : (tipoMovimiento === 'RETIRO' ? 'Retirar Llave' : 'Devolver Llave') }}
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
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';
import AlertMessage from '@/components/shared/AlertMessage.vue';

const props = defineProps({
  personaId: {
    type: String,
    required: true
  },
  llaveId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['marcacion-exitosa']);

const tipoMovimiento = ref<'RETIRO' | 'DEVOLUCION'>('RETIRO');
const cargando = ref(false);
const mensaje = ref('');
const tipoMensaje = ref<'success' | 'error'>('success');

onMounted(async () => {
  await determinarTipoMovimiento();
});

const determinarTipoMovimiento = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Buscar si hay un retiro pendiente de devolución
    const { data: retiroPendiente } = await supabase
      .from('registro_llaves')
      .select('*')
      .eq('persona_id', props.personaId)
      .eq('llave_id', props.llaveId)
      .eq('fecha', hoy)
      .eq('estado', true)
      .is('hora_retorno', null)
      .single();

    // Si hay retiro pendiente, el siguiente movimiento es DEVOLUCIÓN
    if (retiroPendiente) {
      tipoMovimiento.value = 'DEVOLUCION';
    } else {
      tipoMovimiento.value = 'RETIRO';
    }
  } catch (error) {
    // Si no hay registro, es un RETIRO
    tipoMovimiento.value = 'RETIRO';
  }
};

const registrarMovimiento = async () => {
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

    if (tipoMovimiento.value === 'RETIRO') {
      // Registrar retiro de llave
      const { error } = await supabase
        .from('registro_llaves')
        .insert({
          persona_id: props.personaId,
          llave_id: props.llaveId,
          periodo_id: periodoActivo.id,
          fecha: fecha,
          hora_salida: hora,
          tipo: 'RETIRO',
          estado: true
        });

      if (error) throw error;

      mensaje.value = '✓ Llave retirada correctamente';
      tipoMensaje.value = 'success';
      tipoMovimiento.value = 'DEVOLUCION';
    } else {
      // Registrar devolución de llave
      const { error } = await supabase
        .from('registro_llaves')
        .update({
          hora_retorno: hora,
          estado: false // Marcar como devuelta
        })
        .eq('persona_id', props.personaId)
        .eq('llave_id', props.llaveId)
        .eq('fecha', fecha)
        .eq('estado', true)
        .is('hora_retorno', null);

      if (error) throw error;

      mensaje.value = '✓ Llave devuelta correctamente';
      tipoMensaje.value = 'success';
      tipoMovimiento.value = 'RETIRO';
    }

    emit('marcacion-exitosa');
  } catch (error: any) {
    console.error('Error al registrar movimiento:', error);
    mensaje.value = `✕ Error: ${error.message}`;
    tipoMensaje.value = 'error';
  } finally {
    cargando.value = false;
  }
};
</script>

