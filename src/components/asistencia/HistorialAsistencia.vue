<template>
  <div class="mt-4">
    <h3 class="mb-3 text-base font-semibold text-gray-700 flex items-center gap-2">
      <Icon icon="mdi:calendar-clock" width="20" height="20" />
      Historial de Asistencia Hoy
    </h3>
    
    <div v-if="cargando" class="p-3 text-center text-sm text-gray-500 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
      <Icon icon="mdi:loading" class="animate-spin" width="18" height="18" />
      Cargando historial...
    </div>

    <div v-else-if="registrosAgrupados.length === 0" class="p-3 text-center text-sm text-gray-500 bg-gray-100 rounded-lg">
      No hay registros de asistencia hoy
    </div>

    <div v-else class="flex flex-col gap-2">
      <div 
        v-for="(grupo, index) in registrosAgrupados" 
        :key="index"
        class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow transition-shadow"
      >
        <!-- Entrada -->
        <div v-if="grupo.entrada" class="flex items-center justify-between py-1.5 border-l-4 border-l-green-500 pl-3">
          <div class="flex items-center gap-3 flex-1">
            <Icon icon="mdi:login" class="text-green-500" width="22" height="22" />
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Entrada</span>
              <span class="text-sm font-bold text-gray-800">{{ formatearHoraCompleta(grupo.entrada) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full border border-green-200">ENTRADA</span>
            <!-- Botón de Marcar Salida si no hay salida -->
            <button 
              v-if="!grupo.salida"
              @click="marcarSalida(grupo)"
              :disabled="procesando"
              class="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
            >
              <Icon icon="mdi:logout" width="20" height="20" class="animate-pulse" />
              Marcar Salida
            </button>
          </div>
        </div>

        <!-- Línea separadora si hay entrada y salida -->
        <div v-if="grupo.entrada && grupo.salida" class="my-2 border-t border-gray-300 border-dashed"></div>

        <!-- Salida -->
        <div v-if="grupo.salida" class="flex items-center justify-between py-1.5 border-l-4 border-l-red-500 pl-3">
          <div class="flex items-center gap-3">
            <Icon icon="mdi:logout" class="text-red-500" width="22" height="22" />
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Salida</span>
              <span class="text-sm font-bold text-gray-800">{{ formatearHoraCompleta(grupo.salida) }}</span>
            </div>
          </div>
          <span class="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-200">SALIDA</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';

const props = defineProps({
  personaId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['salida-marcada']);

const registros = ref<any[]>([]);
const registrosAgrupados = ref<any[]>([]);
const cargando = ref(false);
const procesando = ref(false);

onMounted(() => {
  cargarHistorial();
});

watch(() => props.personaId, () => {
  cargarHistorial();
});

const cargarHistorial = async () => {
  cargando.value = true;
  try {
    // Obtener fecha actual en cada carga para asegurar que siempre sea del día de hoy
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];

    // Obtener el período activo
    const { data: periodoActivo } = await supabase
      .from('periodos')
      .select('id')
      .eq('estado', true)
      .single();

    if (!periodoActivo) {
      registros.value = [];
      registrosAgrupados.value = [];
      return;
    }

    // Obtener registros del día actual únicamente (más recientes primero)
    const { data, error } = await supabase
      .from('asistencia')
      .select('*')
      .eq('persona_id', props.personaId)
      .eq('periodo_id', periodoActivo.id)
      .eq('fecha', hoy)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filtrar nuevamente por fecha para asegurar que solo sean del día actual
    const registrosHoy = (data || []).filter(reg => reg.fecha === hoy);
    registros.value = registrosHoy;

    // Agrupar entrada y salida juntas
    const grupos: any[] = [];
    registrosHoy.forEach(reg => {
      grupos.push({
        id: reg.id,
        entrada: reg.hora_entrada_real,
        salida: reg.hora_salida_real,
        fecha: reg.fecha,
        periodo_id: reg.periodo_id
      });
    });

    registrosAgrupados.value = grupos;
  } catch (error) {
    console.error('Error al cargar historial:', error);
    registros.value = [];
    registrosAgrupados.value = [];
  } finally {
    cargando.value = false;
  }
};

const formatearHoraCompleta = (hora: string) => {
  if (!hora) return '';
  
  // Obtener fecha actual
  const ahora = new Date();
  const fechaStr = ahora.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  // Formatear hora HH:MM:SS
  const horaFormateada = hora.substring(0, 8);
  
  return `${fechaStr} - ${horaFormateada}`;
};

const marcarSalida = async (grupo: any) => {
  procesando.value = true;
  try {
    const ahora = new Date();
    const hora = ahora.toTimeString().split(' ')[0];

    const { error } = await supabase
      .from('asistencia')
      .update({
        hora_salida_real: hora
      })
      .eq('id', grupo.id);

    if (error) throw error;

    // Recargar historial
    await cargarHistorial();
    emit('salida-marcada');
  } catch (error: any) {
    console.error('Error al marcar salida:', error);
    alert(`Error: ${error.message}`);
  } finally {
    procesando.value = false;
  }
};
</script>

