<template>
  <div>
    <!-- Header con búsqueda y botón agregar -->
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

    <!-- Tabla de Llaves -->
    <div v-if="cargando" class="text-center py-12">
      <Icon icon="mdi:loading" width="48" height="48" class="animate-spin text-blue-600 mx-auto" />
      <p class="text-gray-600 mt-4">Cargando llaves...</p>
    </div>

    <div v-else-if="llavesFiltradas.length === 0" class="text-center py-12">
      <Icon icon="mdi:key-off" width="64" height="64" class="text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">No se encontraron llaves</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nivel</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pabellón</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="llave in llavesFiltradas" :key="llave.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ llave.nombre }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ llave.nivel }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ llave.pabellon }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ llave.descripcion || '-' }}</td>
            <td class="px-4 py-3 text-sm">
              <span :class="llave.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                    class="px-2 py-1 rounded-full text-xs font-medium">
                {{ llave.estado ? 'Disponible' : 'Fuera de uso' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="abrirModalEditar(llave)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Icon icon="mdi:pencil" width="18" height="18" />
                </button>
                <button
                  @click="confirmarEliminar(llave)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Icon icon="mdi:delete" width="18" height="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
            <input
              v-model="formulario.nivel"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 2° Piso, 1° Piso"
            />
          </div>

          <!-- Pabellón -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Pabellón <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.pabellon"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Pabellón A, Pabellón B"
            />
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

interface Llave {
  id: string;
  nombre: string;
  nivel: string;
  pabellon: string;
  descripcion: string | null;
  estado: boolean;
}

const llaves = ref<Llave[]>([]);
const busqueda = ref('');
const cargando = ref(false);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);

const formulario = ref({
  id: '',
  nombre: '',
  nivel: '',
  pabellon: '',
  descripcion: '',
  estado: true
});

const llavesFiltradas = computed(() => {
  if (!busqueda.value) return llaves.value;
  
  const termino = busqueda.value.toLowerCase();
  return llaves.value.filter(l => 
    l.nombre.toLowerCase().includes(termino) ||
    l.nivel.toLowerCase().includes(termino) ||
    l.pabellon.toLowerCase().includes(termino) ||
    (l.descripcion && l.descripcion.toLowerCase().includes(termino))
  );
});

const cargarLlaves = async () => {
  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('llaves')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    llaves.value = data || [];
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

const confirmarEliminar = async (llave: Llave) => {
  if (!confirm(`¿Estás seguro de eliminar la llave ${llave.nombre}?`)) return;

  try {
    const { error } = await supabase
      .from('llaves')
      .delete()
      .eq('id', llave.id);

    if (error) throw error;
    await cargarLlaves();
  } catch (error: any) {
    console.error('Error al eliminar llave:', error);
    alert('Error al eliminar: ' + error.message);
  }
};

onMounted(() => {
  cargarLlaves();
});
</script>
