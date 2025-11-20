<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3">
          <Icon icon="mdi:cog-outline" width="32" height="32" class="text-blue-600" />
          <h2 class="text-2xl font-bold text-gray-800">Configuración de Asistencia</h2>
        </div>
        <button
          @click="abrirModalNuevo"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Icon icon="mdi:plus" width="20" height="20" />
          Nueva Configuración
        </button>
      </div>
      <p class="text-sm text-gray-600">Gestiona las configuraciones de asistencia por periodo</p>
    </div>

    <!-- Filtros -->
    <div class="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Filtro por Periodo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Periodo</label>
          <select
            v-model="periodoFiltro"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los periodos</option>
            <option v-for="periodo in periodos" :key="periodo.id" :value="periodo.id">
              {{ periodo.nombre }}
            </option>
          </select>
        </div>

        <!-- Filtro por Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="estadoFiltro"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="flex justify-center items-center py-12">
      <Icon icon="mdi:loading" class="animate-spin text-blue-600" width="48" height="48" />
    </div>

    <!-- Lista de Configuraciones -->
    <div v-else-if="configuracionesFiltradas.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <Icon icon="mdi:cog-off-outline" width="64" height="64" class="mx-auto text-gray-400 mb-3" />
      <p class="text-gray-600">No hay configuraciones registradas</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="config in configuracionesFiltradas"
        :key="config.id"
        class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow"
      >
        <!-- Header de la tarjeta -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:calendar-range" width="20" height="20" class="text-blue-600" />
              <h3 class="text-lg font-bold text-gray-800">{{ obtenerNombrePeriodo(config.periodo_id) }}</h3>
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  config.estado
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                ]"
              >
                {{ config.estado ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <p v-if="config.observacion" class="text-sm text-gray-600">{{ config.observacion }}</p>
          </div>

          <!-- Botones de acción -->
          <div class="flex items-center gap-2">
            <button
              @click="duplicarConfiguracion(config)"
              class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Duplicar configuración"
            >
              <Icon icon="mdi:content-copy" width="20" height="20" />
            </button>
            <button
              @click="abrirModalEditar(config)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Icon icon="mdi:pencil" width="20" height="20" />
            </button>
            <button
              @click="eliminarConfiguracion(config.id)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Icon icon="mdi:delete" width="20" height="20" />
            </button>
          </div>
        </div>

        <!-- Configuraciones en Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Tolerancias -->
          <div class="bg-green-50 rounded-lg p-3 border border-green-200">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:clock-check" width="18" height="18" class="text-green-600" />
              <h4 class="text-sm font-semibold text-green-800">Tolerancias</h4>
            </div>
            <div class="space-y-1 text-xs text-gray-700">
              <p><span class="font-medium">Presente:</span> {{ config.tolerancia_presente_min }} min</p>
              <p><span class="font-medium">Tarde:</span> {{ config.tolerancia_tarde_min }} min</p>
              <p><span class="font-medium">Falta:</span> {{ config.tolerancia_falta_min }} min</p>
            </div>
          </div>

          <!-- Control de Horario -->
          <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:calendar-clock" width="18" height="18" class="text-blue-600" />
              <h4 class="text-sm font-semibold text-blue-800">Control de Horario</h4>
            </div>
            <div class="space-y-1 text-xs text-gray-700">
              <p>
                <Icon :icon="config.aplica_control_horario ? 'mdi:check-circle' : 'mdi:close-circle'" width="14" height="14" :class="config.aplica_control_horario ? 'text-green-600' : 'text-red-600'" class="inline" />
                Control de horario
              </p>
              <p>
                <Icon :icon="config.permitir_multiple_fichaje ? 'mdi:check-circle' : 'mdi:close-circle'" width="14" height="14" :class="config.permitir_multiple_fichaje ? 'text-green-600' : 'text-red-600'" class="inline" />
                Múltiple fichaje
              </p>
              <p>
                <Icon :icon="config.requiere_justificacion_tarde ? 'mdi:check-circle' : 'mdi:close-circle'" width="14" height="14" :class="config.requiere_justificacion_tarde ? 'text-green-600' : 'text-red-600'" class="inline" />
                Justificación tarde
              </p>
            </div>
          </div>

          <!-- Geolocalización -->
          <div class="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:map-marker-radius" width="18" height="18" class="text-purple-600" />
              <h4 class="text-sm font-semibold text-purple-800">Geolocalización</h4>
            </div>
            <div class="space-y-1 text-xs text-gray-700">
              <p>
                <Icon :icon="config.aplica_poligono ? 'mdi:check-circle' : 'mdi:close-circle'" width="14" height="14" :class="config.aplica_poligono ? 'text-green-600' : 'text-red-600'" class="inline" />
                Validar ubicación
              </p>
              <p><span class="font-medium">Radio:</span> {{ config.radio_metros }} metros</p>
              <p>
                <Icon :icon="config.permite_registro_externo ? 'mdi:check-circle' : 'mdi:close-circle'" width="14" height="14" :class="config.permite_registro_externo ? 'text-green-600' : 'text-red-600'" class="inline" />
                Registro externo
              </p>
            </div>
          </div>

          <!-- Otros -->
          <div class="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div class="flex items-center gap-2 mb-2">
              <Icon icon="mdi:cog" width="18" height="18" class="text-orange-600" />
              <h4 class="text-sm font-semibold text-orange-800">Otros</h4>
            </div>
            <div class="space-y-1 text-xs text-gray-700">
              <p>
                <Icon :icon="config.requiere_registro_llave ? 'mdi:check-circle' : 'mdi:close-circle'" width="14" height="14" :class="config.requiere_registro_llave ? 'text-green-600' : 'text-red-600'" class="inline" />
                Registro de llave
              </p>
              <p><span class="font-medium">Hora máx:</span> {{ config.hora_max_registro || 'Sin límite' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Formulario -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header del Modal -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-800">
            {{ modoEdicion ? 'Editar Configuración' : 'Nueva Configuración' }}
          </h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarConfiguracion" class="p-6 space-y-6">
          <!-- Periodo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Periodo <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formulario.periodo_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar periodo...</option>
              <option v-for="periodo in periodos" :key="periodo.id" :value="periodo.id">
                {{ periodo.nombre }}
              </option>
            </select>
          </div>

          <!-- Tolerancias -->
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 class="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
              <Icon icon="mdi:clock-check" width="20" height="20" />
              Tolerancias (minutos)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Presente</label>
                <input
                  v-model.number="formulario.tolerancia_presente_min"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tarde</label>
                <input
                  v-model.number="formulario.tolerancia_tarde_min"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Falta</label>
                <input
                  v-model.number="formulario.tolerancia_falta_min"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="120"
                />
              </div>
            </div>
          </div>

          <!-- Control de Horario -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 class="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Icon icon="mdi:calendar-clock" width="20" height="20" />
              Control de Horario
            </h4>
            <div class="space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.aplica_control_horario"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Aplicar control de horario programado</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.permitir_multiple_fichaje"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Permitir múltiples fichajes por día</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.requiere_justificacion_tarde"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Requerir justificación para tardanzas</span>
              </label>
            </div>
          </div>

          <!-- Geolocalización -->
          <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 class="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
              <Icon icon="mdi:map-marker-radius" width="20" height="20" />
              Geolocalización
            </h4>
            <div class="space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.aplica_poligono"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span class="text-sm text-gray-700">Validar ubicación del usuario</span>
              </label>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Radio permitido (metros)</label>
                <input
                  v-model.number="formulario.radio_metros"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.permite_registro_externo"
                  type="checkbox"
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span class="text-sm text-gray-700">Permitir registro desde fuera del área</span>
              </label>
            </div>
          </div>

          <!-- Otros -->
          <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 class="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
              <Icon icon="mdi:cog" width="20" height="20" />
              Configuraciones Adicionales
            </h4>
            <div class="space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.requiere_registro_llave"
                  type="checkbox"
                  class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span class="text-sm text-gray-700">Requerir registro de llave</span>
              </label>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora máxima de registro</label>
                <input
                  v-model="formulario.hora_max_registro"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Observación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              v-model="formulario.observacion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales sobre esta configuración..."
            ></textarea>
          </div>

          <!-- Estado -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formulario.estado"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">Configuración activa</span>
            </label>
          </div>

          <!-- Botones -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="cerrarModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="guardando" icon="mdi:loading" class="animate-spin" width="20" height="20" />
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';

interface Configuracion {
  id: number;
  periodo_id: string;
  tolerancia_presente_min: number;
  tolerancia_tarde_min: number;
  tolerancia_falta_min: number;
  aplica_control_horario: boolean;
  permitir_multiple_fichaje: boolean;
  requiere_justificacion_tarde: boolean;
  requiere_registro_llave: boolean;
  aplica_poligono: boolean;
  poligono: any;
  radio_metros: number;
  permite_registro_externo: boolean;
  hora_max_registro: string;
  observacion: string;
  estado: boolean;
}

const configuraciones = ref<Configuracion[]>([]);
const periodos = ref<any[]>([]);
const cargando = ref(false);
const guardando = ref(false);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const periodoFiltro = ref('');
const estadoFiltro = ref('');

const formulario = ref({
  id: null as number | null,
  periodo_id: '',
  tolerancia_presente_min: 10,
  tolerancia_tarde_min: 20,
  tolerancia_falta_min: 120,
  aplica_control_horario: false,
  permitir_multiple_fichaje: false,
  requiere_justificacion_tarde: false,
  requiere_registro_llave: false,
  aplica_poligono: false,
  radio_metros: 30,
  permite_registro_externo: false,
  hora_max_registro: '23:59',
  observacion: '',
  estado: true
});

const configuracionesFiltradas = computed(() => {
  let resultado = configuraciones.value;

  if (periodoFiltro.value) {
    resultado = resultado.filter(c => c.periodo_id === periodoFiltro.value);
  }

  if (estadoFiltro.value !== '') {
    const estadoBool = estadoFiltro.value === 'true';
    resultado = resultado.filter(c => c.estado === estadoBool);
  }

  return resultado;
});

onMounted(() => {
  cargarPeriodos();
  cargarConfiguraciones();
});

const cargarPeriodos = async () => {
  try {
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .order('nombre', { ascending: false });

    if (error) throw error;
    periodos.value = data || [];
  } catch (error) {
    console.error('Error al cargar periodos:', error);
  }
};

const cargarConfiguraciones = async () => {
  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('config_asistencia')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    configuraciones.value = data || [];
  } catch (error) {
    console.error('Error al cargar configuraciones:', error);
  } finally {
    cargando.value = false;
  }
};

const obtenerNombrePeriodo = (periodoId: string) => {
  const periodo = periodos.value.find(p => p.id === periodoId);
  return periodo ? periodo.nombre : 'Periodo desconocido';
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  formulario.value = {
    id: null,
    periodo_id: '',
    tolerancia_presente_min: 10,
    tolerancia_tarde_min: 20,
    tolerancia_falta_min: 120,
    aplica_control_horario: false,
    permitir_multiple_fichaje: false,
    requiere_justificacion_tarde: false,
    requiere_registro_llave: false,
    aplica_poligono: false,
    radio_metros: 30,
    permite_registro_externo: false,
    hora_max_registro: '23:59',
    observacion: '',
    estado: true
  };
  modalAbierto.value = true;
};

const abrirModalEditar = (config: Configuracion) => {
  modoEdicion.value = true;
  formulario.value = { ...config };
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
};

const guardarConfiguracion = async () => {
  guardando.value = true;
  try {
    const datos = { ...formulario.value };
    delete datos.id;

    if (modoEdicion.value && formulario.value.id) {
      const { error } = await supabase
        .from('config_asistencia')
        .update(datos)
        .eq('id', formulario.value.id);

      if (error) throw error;
      alert('✅ Configuración actualizada exitosamente');
    } else {
      const { error } = await supabase
        .from('config_asistencia')
        .insert(datos);

      if (error) throw error;
      alert('✅ Configuración creada exitosamente');
    }

    await cargarConfiguraciones();
    cerrarModal();
  } catch (error: any) {
    console.error('Error al guardar:', error);
    alert('❌ Error: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const duplicarConfiguracion = async (config: Configuracion) => {
  // Abrir modal con la configuración actual
  modoEdicion.value = false;
  formulario.value = { ...config };
  formulario.value.id = null; // Quitar ID para crear nuevo
  formulario.value.periodo_id = ''; // Limpiar periodo para que seleccione uno nuevo
  formulario.value.observacion = `Duplicado de: ${obtenerNombrePeriodo(config.periodo_id)}`;
  modalAbierto.value = true;
};

const eliminarConfiguracion = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar esta configuración?')) return;

  try {
    const { error } = await supabase
      .from('config_asistencia')
      .delete()
      .eq('id', id);

    if (error) throw error;
    alert('✅ Configuración eliminada exitosamente');
    await cargarConfiguraciones();
  } catch (error: any) {
    console.error('Error al eliminar:', error);
    alert('❌ Error: ' + error.message);
  }
};
</script>
