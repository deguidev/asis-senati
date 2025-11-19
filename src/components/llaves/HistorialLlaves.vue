<template>
  <div class="mt-6">
    <h3 class="mb-4 text-lg font-semibold text-gray-700 flex items-center gap-2">
      <Icon icon="mdi:key" width="20" height="20" />
      Historial de Llaves Hoy
    </h3>
    
    <div v-if="cargando" class="p-5 text-center text-gray-500 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
      <Icon icon="mdi:loading" class="animate-spin" width="18" height="18" />
      Cargando historial...
    </div>

    <div v-else-if="registros.length === 0" class="p-5 text-center text-gray-500 bg-gray-100 rounded-lg">
      No hay movimientos de llaves hoy
    </div>

    <div v-else class="flex flex-col gap-2">
      <div 
        v-for="(grupo, index) in registrosAgrupados" 
        :key="index"
        class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow transition-shadow"
      >
        <!-- Retiro -->
        <div v-if="grupo.retiro" class="flex items-center justify-between py-1.5 border-l-4 border-l-orange-500 pl-3">
          <div class="flex items-center gap-3 flex-1">
            <Icon icon="mdi:key-remove" class="text-orange-500" width="22" height="22" />
            <div class="flex flex-col flex-1">
              <span class="text-xs text-gray-500">{{ grupo.nombre }}</span>
              <span class="text-sm font-bold text-gray-800">{{ formatearHoraCompleta(grupo.retiro.hora_salida) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 text-xs font-semibold bg-orange-50 text-orange-700 rounded-full border border-orange-200">
              RETIRO
            </span>
            <!-- Botón de entrega directa -->
            <button 
              v-if="grupo.retiro.estado"
              @click="entregarLlave(grupo.retiro)"
              :disabled="procesando"
              class="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
            >
              <Icon icon="mdi:key-plus" width="22" height="22" class="animate-pulse" />
              Entregar Llave
            </button>
          </div>
        </div>

        <!-- Línea separadora si hay retiro y devolución -->
        <div v-if="grupo.retiro && grupo.devolucion" class="my-2 border-t border-gray-200 border-dashed"></div>

        <!-- Devolución -->
        <div v-if="grupo.devolucion" class="flex items-center justify-between py-1.5 border-l-4 border-l-blue-500 pl-3">
          <div class="flex items-center gap-3">
            <Icon icon="mdi:key-plus" class="text-blue-500" width="22" height="22" />
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">{{ grupo.nombre }}</span>
              <span class="text-sm font-bold text-gray-800">{{ formatearHoraCompleta(grupo.devolucion.hora_retorno) }}</span>
            </div>
          </div>
          <span class="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            DEVOLUCIÓN
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

const props = defineProps({
  personaId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['llave-entregada']);

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

    // Obtener registros del día actual únicamente con información de la llave (más recientes primero)
    const { data, error } = await supabase
      .from('registro_llaves')
      .select(`
        *,
        llaves (
          nombre,
          nivel,
          pabellon
        )
      `)
      .eq('persona_id', props.personaId)
      .eq('periodo_id', periodoActivo.id)
      .eq('fecha', hoy)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filtrar nuevamente por fecha para asegurar que solo sean del día actual
    const registrosHoy = (data || []).filter(reg => reg.fecha === hoy);
    registros.value = registrosHoy;

    // Agrupar retiro y devolución juntas
    const grupos: any[] = [];
    registrosHoy.forEach(reg => {
      grupos.push({
        nombre: reg.llaves?.nombre,
        retiro: {
          id: reg.id,
          llave_id: reg.llave_id,
          hora_salida: reg.hora_salida,
          estado: reg.estado,
          llaves: reg.llaves
        },
        devolucion: reg.hora_retorno ? {
          hora_retorno: reg.hora_retorno
        } : null
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
  return hora.substring(0, 5); // HH:MM
};

const formatearHoraCompleta = (hora: string) => {
  if (!hora) return '';
  
  const ahora = new Date();
  const fechaStr = ahora.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  const horaFormateada = hora.substring(0, 8);
  
  return `${fechaStr} - ${horaFormateada}`;
};

const entregarLlave = async (registro: any) => {
  if (procesando.value) return;
  
  procesando.value = true;
  try {
    const ahora = new Date();
    const horaRetorno = ahora.toTimeString().split(' ')[0];
    
    const { error } = await supabase
      .from('registro_llaves')
      .update({
        hora_retorno: horaRetorno,
        estado: false
      })
      .eq('id', registro.id);
    
    if (error) throw error;
    
    // Actualizar estado de la llave a disponible
    await supabase
      .from('llaves')
      .update({ estado: true })
      .eq('id', registro.llave_id);
    
    // Recargar historial
    await cargarHistorial();
    
    // Emitir evento para actualizar otros componentes
    emit('llave-entregada');
  } catch (error) {
    console.error('Error al entregar llave:', error);
    alert('Error al registrar la entrega de la llave');
  } finally {
    procesando.value = false;
  }
};
</script>

