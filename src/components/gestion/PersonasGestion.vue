<template>
  <div>
    <!-- Header con búsqueda y botón agregar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:account-group" width="28" height="28" class="text-blue-600" />
          Gestión de Personas
        </h2>
        <p class="text-gray-600 text-sm mt-1">Administra docentes y personal del sistema</p>
      </div>
      
      <button
        @click="abrirModalNuevo"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        <Icon icon="mdi:plus" width="20" height="20" />
        <span class="font-medium">Nueva Persona</span>
      </button>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <div class="relative">
        <Icon icon="mdi:magnify" width="20" height="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por DNI, código, nombre o apellido..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Tabla de Personas -->
    <div v-if="cargando" class="text-center py-12">
      <Icon icon="mdi:loading" width="48" height="48" class="animate-spin text-blue-600 mx-auto" />
      <p class="text-gray-600 mt-4">Cargando personas...</p>
    </div>

    <div v-else-if="personasFiltradas.length === 0" class="text-center py-12">
      <Icon icon="mdi:account-off" width="64" height="64" class="text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600">No se encontraron personas</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DNI</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Apellidos y Nombres</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="persona in personasFiltradas" :key="persona.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ persona.codigo }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ persona.dni }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">
              {{ persona.paterno }} {{ persona.materno }}, {{ persona.nombres }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ persona.email || '-' }}</td>
            <td class="px-4 py-3 text-sm">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {{ persona.tipo_persona }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm">
              <span :class="persona.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                    class="px-2 py-1 rounded-full text-xs font-medium">
                {{ persona.estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="abrirModalEditar(persona)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Icon icon="mdi:pencil" width="18" height="18" />
                </button>
                <button
                  @click="confirmarEliminar(persona)"
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
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-800">
            {{ modoEdicion ? 'Editar Persona' : 'Nueva Persona' }}
          </h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>

        <form @submit.prevent="guardarPersona" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Código -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Código <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.codigo"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: DOC001"
              />
            </div>

            <!-- DNI -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                DNI <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.dni"
                type="text"
                required
                maxlength="8"
                pattern="[0-9]{8}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345678"
              />
            </div>

            <!-- Apellido Paterno -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Apellido Paterno <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.paterno"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Apellido Materno -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Apellido Materno <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.materno"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Nombres -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombres <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.nombres"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="formulario.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                v-model="formulario.telefono"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="999999999"
              />
            </div>

            <!-- Tipo Persona -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formulario.tipo_persona"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DOCENTE">Docente</option>
                <option value="ADMIN">Administrador</option>
                <option value="PERSONAL">Personal</option>
              </select>
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
                <span class="text-sm text-gray-700">Activo</span>
              </div>
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

interface Persona {
  id: string;
  codigo: string;
  dni: string;
  paterno: string;
  materno: string;
  nombres: string;
  email: string | null;
  telefono: string | null;
  tipo_persona: string;
  estado: boolean;
}

const personas = ref<Persona[]>([]);
const busqueda = ref('');
const cargando = ref(false);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);

const formulario = ref({
  id: '',
  codigo: '',
  dni: '',
  paterno: '',
  materno: '',
  nombres: '',
  email: '',
  telefono: '',
  tipo_persona: 'DOCENTE',
  estado: true
});

const personasFiltradas = computed(() => {
  if (!busqueda.value) return personas.value;
  
  const termino = busqueda.value.toLowerCase();
  return personas.value.filter(p => 
    p.codigo.toLowerCase().includes(termino) ||
    p.dni.includes(termino) ||
    p.paterno.toLowerCase().includes(termino) ||
    p.materno.toLowerCase().includes(termino) ||
    p.nombres.toLowerCase().includes(termino) ||
    (p.email && p.email.toLowerCase().includes(termino))
  );
});

const cargarPersonas = async () => {
  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('paterno', { ascending: true });

    if (error) throw error;
    personas.value = data || [];
  } catch (error: any) {
    console.error('Error al cargar personas:', error);
    alert('Error al cargar personas: ' + error.message);
  } finally {
    cargando.value = false;
  }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  formulario.value = {
    id: '',
    codigo: '',
    dni: '',
    paterno: '',
    materno: '',
    nombres: '',
    email: '',
    telefono: '',
    tipo_persona: 'DOCENTE',
    estado: true
  };
  modalAbierto.value = true;
};

const abrirModalEditar = (persona: Persona) => {
  modoEdicion.value = true;
  formulario.value = {
    id: persona.id,
    codigo: persona.codigo,
    dni: persona.dni,
    paterno: persona.paterno,
    materno: persona.materno,
    nombres: persona.nombres,
    email: persona.email || '',
    telefono: persona.telefono || '',
    tipo_persona: persona.tipo_persona,
    estado: persona.estado
  };
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
};

const guardarPersona = async () => {
  guardando.value = true;
  try {
    const datos = {
      codigo: formulario.value.codigo,
      dni: formulario.value.dni,
      paterno: formulario.value.paterno,
      materno: formulario.value.materno,
      nombres: formulario.value.nombres,
      email: formulario.value.email || null,
      telefono: formulario.value.telefono || null,
      tipo_persona: formulario.value.tipo_persona,
      estado: formulario.value.estado
    };

    if (modoEdicion.value) {
      const { error } = await supabase
        .from('personas')
        .update(datos)
        .eq('id', formulario.value.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('personas')
        .insert([datos]);

      if (error) throw error;
    }

    await cargarPersonas();
    cerrarModal();
  } catch (error: any) {
    console.error('Error al guardar persona:', error);
    alert('Error al guardar: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = async (persona: Persona) => {
  if (!confirm(`¿Estás seguro de eliminar a ${persona.nombres} ${persona.paterno}?`)) return;

  try {
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', persona.id);

    if (error) throw error;
    await cargarPersonas();
  } catch (error: any) {
    console.error('Error al eliminar persona:', error);
    alert('Error al eliminar: ' + error.message);
  }
};

onMounted(() => {
  cargarPersonas();
});
</script>
