<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:calendar-range" width="28" height="28" class="text-blue-600" />
          Gestión de Periodos
        </h2>
        <p class="text-gray-600 text-sm mt-1">Configura los periodos académicos del sistema</p>
      </div>
      
      <button
        @click="abrirModalNuevo"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        <Icon icon="mdi:plus" width="20" height="20" />
        <span class="font-medium">Nuevo Periodo</span>
      </button>
    </div>

    <!-- Lista de Periodos -->
    <div v-if="cargando" class="text-center py-12">
      <Icon icon="mdi:loading" width="48" height="48" class="animate-spin text-blue-600 mx-auto" />
      <p class="text-gray-600 mt-4">Cargando periodos...</p>
    </div>

    <div v-else-if="periodos.length === 0" class="text-center py-12">
      <Icon icon="mdi:calendar-blank" width="64" height="64" class="text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">No hay periodos registrados</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="periodo in periodos"
        :key="periodo.id"
        :class="[
          'p-6 rounded-xl border-2 transition-all',
          periodo.estado 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        ]"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-800">{{ periodo.nombre }}</h3>
            <p class="text-sm text-gray-600">Año {{ periodo.anio }}</p>
          </div>
          <span
            v-if="periodo.estado"
            class="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full"
          >
            ACTIVO
          </span>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <Icon icon="mdi:calendar-start" width="16" height="16" class="text-green-600" />
            <span>Inicio: {{ formatearFecha(periodo.fecha_inicio) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <Icon icon="mdi:calendar-end" width="16" height="16" class="text-red-600" />
            <span>Fin: {{ formatearFecha(periodo.fecha_fin) }}</span>
          </div>
        </div>

        <div v-if="periodo.observacion" class="mb-4">
          <p class="text-sm text-gray-600 italic">{{ periodo.observacion }}</p>
        </div>

        <div class="flex gap-2">
          <button
            @click="abrirModalEditar(periodo)"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Icon icon="mdi:pencil" width="16" height="16" />
            <span>Editar</span>
          </button>
          <button
            v-if="!periodo.estado"
            @click="activarPeriodo(periodo)"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Icon icon="mdi:check-circle" width="16" height="16" />
            <span>Activar</span>
          </button>
          <button
            @click="confirmarEliminar(periodo)"
            class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Icon icon="mdi:delete" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h3 class="text-xl font-bold text-gray-800">
            {{ modoEdicion ? 'Editar Periodo' : 'Nuevo Periodo' }}
          </h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>

        <form @submit.prevent="guardarPeriodo" class="p-6 space-y-4">
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
              placeholder="Ej: Periodo 2025-I"
            />
          </div>

          <!-- Año -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Año <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formulario.anio"
              type="number"
              required
              min="2020"
              max="2100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Fecha Inicio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.fecha_inicio"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Fecha Fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.fecha_fin"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Observación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              v-model="formulario.observacion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales..."
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
              <span class="text-sm text-gray-700">Periodo Activo</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Solo puede haber un periodo activo a la vez</p>
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
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { supabase } from '@/lib/supabaseClient';

interface Periodo {
  id: string;
  nombre: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: boolean;
  observacion: string | null;
}

const periodos = ref<Periodo[]>([]);
const cargando = ref(false);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);

const formulario = ref({
  id: '',
  nombre: '',
  anio: new Date().getFullYear(),
  fecha_inicio: '',
  fecha_fin: '',
  estado: false,
  observacion: ''
});

const formatearFecha = (fecha: string) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const cargarPeriodos = async () => {
  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .order('anio', { ascending: false })
      .order('fecha_inicio', { ascending: false });

    if (error) throw error;
    periodos.value = data || [];
  } catch (error: any) {
    console.error('Error al cargar periodos:', error);
    alert('Error al cargar periodos: ' + error.message);
  } finally {
    cargando.value = false;
  }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  formulario.value = {
    id: '',
    nombre: '',
    anio: new Date().getFullYear(),
    fecha_inicio: '',
    fecha_fin: '',
    estado: false,
    observacion: ''
  };
  modalAbierto.value = true;
};

const abrirModalEditar = (periodo: Periodo) => {
  modoEdicion.value = true;
  formulario.value = {
    id: periodo.id,
    nombre: periodo.nombre,
    anio: periodo.anio,
    fecha_inicio: periodo.fecha_inicio,
    fecha_fin: periodo.fecha_fin,
    estado: periodo.estado,
    observacion: periodo.observacion || ''
  };
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
};

const guardarPeriodo = async () => {
  guardando.value = true;
  try {
    const datos = {
      nombre: formulario.value.nombre,
      anio: formulario.value.anio,
      fecha_inicio: formulario.value.fecha_inicio,
      fecha_fin: formulario.value.fecha_fin,
      estado: formulario.value.estado,
      observacion: formulario.value.observacion || null
    };

    // Si se está activando este periodo, desactivar todos los demás
    if (datos.estado) {
      await supabase
        .from('periodos')
        .update({ estado: false })
        .neq('id', formulario.value.id || '00000000-0000-0000-0000-000000000000');
    }

    if (modoEdicion.value) {
      const { error } = await supabase
        .from('periodos')
        .update(datos)
        .eq('id', formulario.value.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('periodos')
        .insert([datos]);

      if (error) throw error;
    }

    await cargarPeriodos();
    cerrarModal();
  } catch (error: any) {
    console.error('Error al guardar periodo:', error);
    alert('Error al guardar: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const activarPeriodo = async (periodo: Periodo) => {
  if (!confirm(`¿Activar el periodo ${periodo.nombre}? Esto desactivará el periodo actual.`)) return;

  try {
    // Desactivar todos
    await supabase
      .from('periodos')
      .update({ estado: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Activar el seleccionado
    const { error } = await supabase
      .from('periodos')
      .update({ estado: true })
      .eq('id', periodo.id);

    if (error) throw error;
    await cargarPeriodos();
  } catch (error: any) {
    console.error('Error al activar periodo:', error);
    alert('Error al activar: ' + error.message);
  }
};

const confirmarEliminar = async (periodo: Periodo) => {
  if (periodo.estado) {
    alert('No puedes eliminar el periodo activo');
    return;
  }

  if (!confirm(`¿Estás seguro de eliminar el periodo ${periodo.nombre}?`)) return;

  try {
    const { error } = await supabase
      .from('periodos')
      .delete()
      .eq('id', periodo.id);

    if (error) throw error;
    await cargarPeriodos();
  } catch (error: any) {
    console.error('Error al eliminar periodo:', error);
    alert('Error al eliminar: ' + error.message);
  }
};

onMounted(() => {
  cargarPeriodos();
});
</script>
