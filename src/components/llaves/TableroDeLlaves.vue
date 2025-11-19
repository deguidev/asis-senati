<template>
  <div class="mb-5">
    <!-- Tabs de Pabellones -->
    <div class="flex gap-1 mb-4 border-b border-gray-200">
      <button
        v-for="pabellon in pabellones"
        :key="pabellon"
        @click="pabellonSeleccionado = pabellon"
        :class="[
          'px-4 py-2.5 font-semibold transition-all relative',
          pabellonSeleccionado === pabellon 
            ? 'text-indigo-600 border-b-2 border-indigo-600' 
            : 'text-gray-600 hover:text-indigo-500'
        ]"
      >
        <Icon icon="mdi:office-building" width="18" height="18" class="inline mr-1.5" />
        Pabellón {{ pabellon }}
      </button>
    </div>

    <!-- Tablero de Llaves -->
    <div v-if="cargando" class="p-5 text-center text-gray-500 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
      <Icon icon="mdi:loading" class="animate-spin" width="18" height="18" />
      Cargando llaves...
    </div>

    <div v-else-if="llavesFiltradas.length === 0" class="p-5 text-center text-gray-500 bg-gray-100 rounded-lg">
      No hay llaves disponibles
    </div>

    <div v-else class="space-y-4">
      <div v-for="nivel in nivelesOrdenados" :key="nivel" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <!-- Título del Nivel -->
        <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Icon icon="mdi:floor-plan" width="16" height="16" />
          Nivel {{ nivel }}
        </h4>
        
        <!-- Grid de Llaves por Nivel -->
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-5">
          <button
            v-for="llave in llavesPorNivel(nivel)"
            :key="llave.id"
            @click="llavesOcupadas.includes(llave.id) ? mostrarInfoDocente(llave.id) : seleccionarLlave(llave)"
            :class="[
              'relative p-3 rounded-lg transition-all text-center border-2 flex flex-col items-center justify-center gap-1.5 min-h-[85px] min-w-[70px]',
              llaveSeleccionada?.id === llave.id 
                ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg scale-105 ring-2 ring-indigo-300' 
                : llavesOcupadas.includes(llave.id)
                  ? 'bg-red-50 border-red-300 text-red-400 cursor-pointer opacity-80 hover:opacity-100 hover:shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:shadow-md hover:scale-105 cursor-pointer'
            ]"
          >
            <!-- Icono de Llave -->
            <Icon 
              :icon="llavesOcupadas.includes(llave.id) ? 'mdi:key-off' : 'mdi:key-variant'" 
              :class="[
                llaveSeleccionada?.id === llave.id ? 'text-white' : llavesOcupadas.includes(llave.id) ? 'text-red-400' : 'text-indigo-500'
              ]"
              width="24" 
              height="24" 
            />
            
            <!-- Nombre de la Llave -->
            <span class="text-xs font-bold">{{ llave.nombre }}</span>
            
            <!-- Estado -->
            <span 
              :class="[
                'text-[10px] px-1.5 py-0.5 rounded-full',
                llaveSeleccionada?.id === llave.id 
                  ? 'bg-white/20 text-white' 
                  : llavesOcupadas.includes(llave.id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
              ]"
            >
              {{ llavesOcupadas.includes(llave.id) ? 'Ocupada' : 'Disponible' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Información del Docente -->
    <ModalInfoDocente 
      :mostrar="mostrarModal"
      :info-llave="infoLlaveOcupada"
      :docente="docenteConLlave"
      :registro="registroLlave"
      @cerrar="cerrarModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';
import ModalInfoDocente from './ModalInfoDocente.vue';

const props = defineProps({
  personaId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['llave-seleccionada']);

const llaves = ref<any[]>([]);
const llavesOcupadas = ref<string[]>([]);
const pabellones = ref<string[]>([]);
const pabellonSeleccionado = ref<string>('');
const llaveSeleccionada = ref<any>(null);
const cargando = ref(false);
const mostrarModal = ref(false);
const docenteConLlave = ref<any>(null);
const registroLlave = ref<any>(null);
const infoLlaveOcupada = ref<any>(null);

onMounted(() => {
  cargarLlaves();
  cargarLlavesOcupadas();
});

const llavesFiltradas = computed(() => {
  if (!pabellonSeleccionado.value) return llaves.value;
  return llaves.value.filter(l => l.pabellon === pabellonSeleccionado.value);
});

const nivelesOrdenados = computed(() => {
  const niveles = [...new Set(llavesFiltradas.value.map(l => l.nivel))];
  return niveles.sort();
});

const llavesPorNivel = (nivel: string) => {
  return llavesFiltradas.value.filter(l => l.nivel === nivel).sort((a, b) => a.nombre.localeCompare(b.nombre));
};

const cargarLlaves = async () => {
  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('llaves')
      .select('*')
      .eq('estado', true)
      .order('pabellon')
      .order('nombre');

    if (error) throw error;

    llaves.value = data || [];

    // Extraer pabellones únicos
    const pabellonesUnicos = [...new Set(data?.map(l => l.pabellon) || [])];
    pabellones.value = pabellonesUnicos;
    
    // Seleccionar el primer pabellón por defecto
    if (pabellonesUnicos.length > 0) {
      pabellonSeleccionado.value = pabellonesUnicos[0];
    }
  } catch (error) {
    console.error('Error al cargar llaves:', error);
  } finally {
    cargando.value = false;
  }
};

const cargarLlavesOcupadas = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Obtener llaves que están actualmente retiradas (sin devolución)
    const { data, error } = await supabase
      .from('registro_llaves')
      .select('llave_id')
      .eq('fecha', hoy)
      .eq('estado', true)
      .is('hora_retorno', null);

    if (error) throw error;

    llavesOcupadas.value = data?.map(r => r.llave_id) || [];
  } catch (error) {
    console.error('Error al cargar llaves ocupadas:', error);
  }
};

const seleccionarLlave = (llave: any) => {
  llaveSeleccionada.value = llave;
  emit('llave-seleccionada', llave);
};

const mostrarInfoDocente = async (llaveId: string) => {
  mostrarModal.value = true;
  docenteConLlave.value = null;
  registroLlave.value = null;
  
  // Obtener información de la llave
  infoLlaveOcupada.value = llaves.value.find(l => l.id === llaveId);
  
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Obtener el registro de la llave ocupada con información del docente
    const { data: registro, error: errorRegistro } = await supabase
      .from('registro_llaves')
      .select(`
        *,
        personas (
          nombres,
          paterno,
          materno,
          dni,
          telefono
        )
      `)
      .eq('llave_id', llaveId)
      .eq('fecha', hoy)
      .eq('estado', true)
      .is('hora_retorno', null)
      .single();

    if (errorRegistro) throw errorRegistro;

    registroLlave.value = registro;
    docenteConLlave.value = registro?.personas;
  } catch (error) {
    console.error('Error al obtener información del docente:', error);
  }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  docenteConLlave.value = null;
  registroLlave.value = null;
  infoLlaveOcupada.value = null;
};
</script>

