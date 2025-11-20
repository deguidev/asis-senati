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

    <div v-else class="flex flex-col gap-3">
      <div 
        v-for="(grupo, index) in registrosAgrupados" 
        :key="index"
        class="bg-white rounded-lg p-4 border-2 shadow-md hover:shadow-lg transition-all"
        :class="[
          grupo.estado === 'ASISTIO' ? 'border-green-300' : 
          grupo.estado === 'TARDE' ? 'border-yellow-300' : 
          grupo.estado === 'FALTA' ? 'border-red-300' : 'border-gray-200'
        ]"
      >
        <!-- Header con Estado -->
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <Icon icon="mdi:calendar-check" width="20" height="20" class="text-gray-600" />
            <span class="text-sm font-semibold text-gray-700">Registro #{{ index + 1 }}</span>
          </div>
          
          <!-- Badge de Estado -->
          <div v-if="grupo.estado" class="flex items-center gap-2">
            <span 
              :class="[
                'px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5',
                grupo.estado === 'ASISTIO' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                grupo.estado === 'TARDE' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                grupo.estado === 'FALTA' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                grupo.estado === 'JUSTIFICADO' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :
                'bg-purple-100 text-purple-700 border-2 border-purple-300'
              ]"
            >
              <Icon 
                :icon="grupo.estado === 'ASISTIO' ? 'mdi:check-circle' : grupo.estado === 'TARDE' ? 'mdi:clock-alert' : grupo.estado === 'FALTA' ? 'mdi:alert-circle' : grupo.estado === 'JUSTIFICADO' ? 'mdi:file-document-check' : 'mdi:calendar-remove'"
                width="14" 
                height="14" 
              />
              {{ grupo.estado === 'ASISTIO' ? 'PUNTUAL' : grupo.estado }}
            </span>
          </div>
        </div>

        <!-- Entrada -->
        <div v-if="grupo.entrada" class="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-200 mb-2">
          <div class="flex items-center gap-3 flex-1">
            <div class="p-2 bg-green-100 rounded-lg">
              <Icon icon="mdi:login" class="text-green-600" width="24" height="24" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-medium text-green-600">Hora de Entrada</span>
              <span class="text-base font-bold text-gray-800">{{ formatearHora(grupo.entrada) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Botón de Marcar Salida si no hay salida -->
            <button 
              v-if="!grupo.salida"
              @click="marcarSalida(grupo)"
              :disabled="procesando"
              class="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
            >
              <Icon icon="mdi:logout" width="18" height="18" class="animate-pulse" />
              Marcar Salida
            </button>
          </div>
        </div>

        <!-- Salida -->
        <div v-if="grupo.salida" class="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-200">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-100 rounded-lg">
              <Icon icon="mdi:logout" class="text-red-600" width="24" height="24" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-medium text-red-600">Hora de Salida</span>
              <span class="text-base font-bold text-gray-800">{{ formatearHora(grupo.salida) }}</span>
            </div>
          </div>
        </div>

        <!-- Tiempo Total si hay entrada y salida -->
        <div v-if="grupo.entrada && grupo.salida" class="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center gap-2">
          <Icon icon="mdi:clock-outline" width="16" height="16" class="text-blue-600" />
          <span class="text-xs font-semibold text-blue-700">
            Tiempo total: {{ calcularTiempoTotal(grupo.entrada, grupo.salida) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';
import { getFechaActual, getHoraActual } from '@/lib/dateUtils';

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
    const hoy = getFechaActual(); // Usar timezone de Lima
    console.log('Fecha actual (Lima):', hoy);

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
        estado: reg.estado || 'ASISTIO',
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

const formatearHora = (hora: string) => {
  if (!hora) return '';
  // Formatear hora HH:MM:SS
  return hora.substring(0, 8);
};

const calcularTiempoTotal = (entrada: string, salida: string) => {
  if (!entrada || !salida) return '0h 0m';
  
  const [hE, mE, sE] = entrada.split(':').map(Number);
  const [hS, mS, sS] = salida.split(':').map(Number);
  
  const minutosEntrada = hE * 60 + mE;
  const minutosSalida = hS * 60 + mS;
  const diferenciaMinutos = minutosSalida - minutosEntrada;
  
  const horas = Math.floor(diferenciaMinutos / 60);
  const minutos = diferenciaMinutos % 60;
  
  return `${horas}h ${minutos}m`;
};

const marcarSalida = async (grupo: any) => {
  procesando.value = true;
  try {
    const hora = getHoraActual(); // Usar timezone de Lima

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

