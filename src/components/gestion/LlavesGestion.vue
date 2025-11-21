<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:key" width="28" height="28" class="text-blue-600" />
          Gestión de Llaves
        </h2>
        <p class="text-gray-600 text-sm mt-1">Administra las llaves de aulas y ambientes</p>
      </div>
      
      <button
        @click="abrirModalNuevo"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        <Icon icon="mdi:plus" width="20" height="20" />
        <span class="font-medium">Nueva Llave</span>
      </button>
    </div>

    <!-- Tabs de Pabellones -->
    <div class="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
      <button
        v-for="pabellon in pabellones"
        :key="pabellon"
        @click="pabellonSeleccionado = pabellon"
        :class="[
          'px-4 py-2.5 font-semibold transition-all relative whitespace-nowrap',
          pabellonSeleccionado === pabellon 
            ? 'text-indigo-600 border-b-2 border-indigo-600' 
            : 'text-gray-600 hover:text-indigo-500'
        ]"
      >
        <Icon icon="mdi:office-building" width="18" height="18" class="inline mr-1.5" />
        Pabellón {{ pabellon }}
      </button>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <div class="relative">
        <Icon icon="mdi:magnify" width="20" height="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre, nivel o pabellón..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Tablero de Llaves por Niveles -->
    <div v-if="cargando" class="p-5 text-center text-gray-500 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
      <Icon icon="mdi:loading" class="animate-spin" width="18" height="18" />
      Cargando llaves...
    </div>

    <div v-else-if="llavesFiltradas.length === 0" class="p-5 text-center text-gray-500 bg-gray-100 rounded-lg">
      <Icon icon="mdi:key-off" class="text-gray-400 mb-2" width="48" height="48" />
      <p>No se encontraron llaves</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="nivel in nivelesOrdenados" :key="nivel" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <!-- Título del Nivel -->
        <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Icon icon="mdi:floor-plan" width="16" height="16" />
          Nivel {{ nivel }}
        </h4>
        
        <!-- Grid de Llaves por Nivel -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div
            v-for="llave in llavesPorNivel(nivel)"
            :key="llave.id"
            :class="[
              'relative p-3 rounded-lg transition-all text-center border-2 flex flex-col items-center justify-between gap-2 min-h-[140px] group',
              llave.disponible === false 
                ? 'bg-red-50 border-red-300 hover:border-red-400 hover:shadow-lg'
                : 'bg-white border-gray-300 hover:border-indigo-400 hover:shadow-md'
            ]"
          >
            <!-- Badge de Disponibilidad -->
            <div 
              :class="[
                'absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md z-10',
                llave.disponible === false
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              ]"
            >
              {{ llave.disponible === false ? 'EN USO' : 'DISPONIBLE' }}
            </div>

            <!-- Icono de Llave -->
            <Icon 
              :icon="llave.disponible === false ? 'mdi:key-remove' : 'mdi:key-variant'" 
              :class="llave.disponible === false ? 'text-red-500' : 'text-indigo-500'"
              width="28" 
              height="28" 
            />
            
            <!-- Nombre de la Llave -->
            <span class="text-sm font-bold text-gray-800">{{ llave.nombre }}</span>
            
            <!-- Información de Uso -->
            <div v-if="llave.disponible === false && llave.persona_usando" class="text-center w-full px-1">
              <div class="text-[9px] text-gray-600 font-medium mb-0.5">En uso por:</div>
              <div class="text-[9px] font-bold text-red-700 leading-tight">
                {{ llave.persona_usando.nombres }} {{ llave.persona_usando.paterno }} {{ llave.persona_usando.materno }}
              </div>
              <div class="text-[8px] text-gray-500 mt-0.5">
                Desde: {{ llave.hora_prestamo }}
              </div>
            </div>

            <!-- Estado Activo/Inactivo -->
            <span 
              :class="[
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                llave.estado
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ llave.estado ? 'Activo' : 'Inactivo' }}
            </span>

            <!-- Botones de Acción -->
            <div class="flex gap-1 mt-1">
              <button
                v-if="llave.disponible === false"
                @click="mostrarInfoPersona(llave)"
                class="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                title="Ver información"
              >
                <Icon icon="mdi:information" width="16" height="16" />
              </button>
              <button
                @click="abrirModalEditar(llave)"
                class="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                title="Editar"
              >
                <Icon icon="mdi:pencil" width="16" height="16" />
              </button>
              <button
                @click="eliminarLlave(llave.id)"
                class="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                title="Eliminar"
              >
                <Icon icon="mdi:delete" width="16" height="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Información de Persona -->
    <ModalInfoDocente 
      :mostrar="mostrarModalInfo"
      :info-llave="infoLlaveOcupada"
      :docente="personaConLlave"
      :registro="registroLlave"
      @cerrar="cerrarModalInfo"
    />

    <!-- Modal Formulario -->
    <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h3 class="text-xl font-bold text-gray-800">
            {{ modoEdicion ? 'Editar Llave' : 'Nueva Llave' }}
          </h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>

        <form @submit.prevent="guardarLlave" class="p-6 space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.nombre"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 203B, 204A"
            />
          </div>

          <!-- Nivel -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nivel <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formulario.nivel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar nivel...</option>
              <option value="1">1° Piso</option>
              <option value="2">2° Piso</option>
              <option value="3">3° Piso</option>
              <option value="4">4° Piso</option>
              <option value="5">5° Piso</option>
            </select>
          </div>

          <!-- Pabellón -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Pabellón <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formulario.pabellon"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar pabellón...</option>
              <option value="A">Pabellón A</option>
              <option value="B">Pabellón B</option>
              <option value="C">Pabellón C</option>
              <option value="D">Pabellón D</option>
              <option value="E">Pabellón E</option>
              <option value="F">Pabellón F</option>
            </select>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              v-model="formulario.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Aula o ambiente asociado..."
            ></textarea>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div class="flex items-center gap-2 mt-2">
              <input
                v-model="formulario.estado"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">Disponible</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="cerrarModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="guardando" icon="mdi:loading" width="20" height="20" class="animate-spin" />
              <span>{{ guardando ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { supabase } from '@/lib/supabaseClient';
import ModalInfoDocente from '@/components/llaves/ModalInfoDocente.vue';

interface Llave {
  id: string;
  nombre: string;
  nivel: string;
  pabellon: string;
  descripcion: string | null;
  estado: boolean;
  disponible?: boolean;
  persona_usando?: {
    nombres: string;
    paterno: string;
    materno: string;
  } | null;
  fecha_prestamo?: string | null;
  hora_prestamo?: string | null;
  registro_id?: string | null;
}

const llaves = ref<Llave[]>([]);
const busqueda = ref('');
const cargando = ref(false);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);
const pabellonSeleccionado = ref('');
const mostrarModalInfo = ref(false);
const personaConLlave = ref<any>(null);
const registroLlave = ref<any>(null);
const infoLlaveOcupada = ref<any>(null);

const formulario = ref({
  id: '',
  nombre: '',
  nivel: '',
  pabellon: '',
  descripcion: '',
  estado: true
});

// Obtener pabellones únicos
const pabellones = computed(() => {
  const pabellonesUnicos = [...new Set(llaves.value.map(l => l.pabellon))];
  return pabellonesUnicos.sort();
});

// Filtrar por pabellón y búsqueda
const llavesFiltradas = computed(() => {
  let resultado = llaves.value;

  // Filtrar por pabellón
  if (pabellonSeleccionado.value) {
    resultado = resultado.filter(l => l.pabellon === pabellonSeleccionado.value);
  }

  // Filtrar por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    resultado = resultado.filter(l => 
      l.nombre.toLowerCase().includes(termino) ||
      l.nivel.toLowerCase().includes(termino) ||
      (l.descripcion && l.descripcion.toLowerCase().includes(termino))
    );
  }

  return resultado;
});

// Obtener niveles ordenados
const nivelesOrdenados = computed(() => {
  const niveles = [...new Set(llavesFiltradas.value.map(l => l.nivel))];
  return niveles.sort();
});

// Obtener llaves por nivel
const llavesPorNivel = (nivel: string) => {
  return llavesFiltradas.value
    .filter(l => l.nivel === nivel)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

const cargarLlaves = async () => {
  cargando.value = true;
  try {
    // Cargar llaves
    const { data: llavesData, error: llavesError } = await supabase
      .from('llaves')
      .select('*')
      .order('pabellon')
      .order('nombre', { ascending: true });

    if (llavesError) throw llavesError;

    // Cargar registros activos (llaves no devueltas) - igual que TableroDeLlaves
    const hoy = new Date().toISOString().split('T')[0];
    const { data: registrosData, error: registrosError } = await supabase
      .from('registro_llaves')
      .select(`
        *,
        personas (
          nombres,
          paterno,
          materno
        )
      `)
      .eq('fecha', hoy)
      .eq('estado', true)
      .is('hora_retorno', null);

    if (registrosError) throw registrosError;

    // Mapear registros por llave_id
    const registrosMap = new Map();
    if (registrosData) {
      registrosData.forEach(registro => {
        registrosMap.set(registro.llave_id, {
          persona_usando: registro.personas,
          fecha_prestamo: registro.fecha,
          hora_prestamo: registro.hora_salida || registro.hora_entrada || 'N/A',
          registro_id: registro.id
        });
      });
    }

    // Combinar llaves con información de registros
    llaves.value = (llavesData || []).map(llave => {
      const registro = registrosMap.get(llave.id);
      return {
        ...llave,
        disponible: !registro,
        persona_usando: registro?.persona_usando || null,
        fecha_prestamo: registro?.fecha_prestamo || null,
        hora_prestamo: registro?.hora_prestamo || null,
        registro_id: registro?.registro_id || null
      };
    });

    // Seleccionar el primer pabellón por defecto
    if (llavesData && llavesData.length > 0 && !pabellonSeleccionado.value) {
      const pabellonesUnicos = [...new Set(llavesData.map(l => l.pabellon))];
      if (pabellonesUnicos.length > 0) {
        pabellonSeleccionado.value = pabellonesUnicos[0];
      }
    }
  } catch (error: any) {
    console.error('Error al cargar llaves:', error);
    alert('Error al cargar llaves: ' + error.message);
  } finally {
    cargando.value = false;
  }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  formulario.value = {
    id: '',
    nombre: '',
    nivel: '',
    pabellon: '',
    descripcion: '',
    estado: true
  };
  modalAbierto.value = true;
};

const abrirModalEditar = (llave: Llave) => {
  modoEdicion.value = true;
  formulario.value = {
    id: llave.id,
    nombre: llave.nombre,
    nivel: llave.nivel,
    pabellon: llave.pabellon,
    descripcion: llave.descripcion || '',
    estado: llave.estado
  };
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
};

const guardarLlave = async () => {
  guardando.value = true;
  try {
    const datos = {
      nombre: formulario.value.nombre,
      nivel: formulario.value.nivel,
      pabellon: formulario.value.pabellon,
      descripcion: formulario.value.descripcion || null,
      estado: formulario.value.estado
    };

    if (modoEdicion.value) {
      const { error } = await supabase
        .from('llaves')
        .update(datos)
        .eq('id', formulario.value.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('llaves')
        .insert([datos]);

      if (error) throw error;
    }

    await cargarLlaves();
    cerrarModal();
  } catch (error: any) {
    console.error('Error al guardar llave:', error);
    alert('Error al guardar: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const eliminarLlave = async (id: string) => {
  const llave = llaves.value.find(l => l.id === id);
  if (!llave || !confirm(`¿Estás seguro de eliminar la llave ${llave.nombre}?`)) return;

  try {
    const { error } = await supabase
      .from('llaves')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await cargarLlaves();
    alert('✅ Llave eliminada exitosamente');
  } catch (error: any) {
    console.error('Error al eliminar llave:', error);
    alert('❌ Error al eliminar: ' + error.message);
  }
};

const mostrarInfoPersona = async (llave: Llave) => {
  mostrarModalInfo.value = true;
  personaConLlave.value = null;
  registroLlave.value = null;
  infoLlaveOcupada.value = llave;
  
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Obtener el registro de la llave ocupada con información de la persona (igual que TableroDeLlaves.vue)
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
      .eq('llave_id', llave.id)
      .eq('fecha', hoy)
      .eq('estado', true)
      .is('hora_retorno', null)
      .single();

    if (errorRegistro) throw errorRegistro;

    registroLlave.value = registro;
    personaConLlave.value = registro?.personas;
  } catch (error) {
    console.error('Error al obtener información de la persona:', error);
  }
};

const cerrarModalInfo = () => {
  mostrarModalInfo.value = false;
  personaConLlave.value = null;
  registroLlave.value = null;
  infoLlaveOcupada.value = null;
};

onMounted(() => {
  cargarLlaves();
});
</script>
