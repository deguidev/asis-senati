<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Icon icon="mdi:clock-outline" width="28" height="28" class="text-blue-600" />
        Gestión de Horarios
      </h2>
      <p class="text-gray-600 text-sm mt-1">Asigna horarios semanales a docentes y personal</p>
    </div>

    <!-- Paso 1: Buscar Persona -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
        Seleccionar Persona
      </h3>
      
      <div class="relative mb-4">
        <Icon icon="mdi:magnify" width="20" height="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="busquedaPersona"
          type="text"
          placeholder="Buscar por DNI, código o nombre..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="buscarPersonas"
        />
      </div>

      <!-- Resultados de búsqueda -->
      <div v-if="personasBuscadas.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
        <button
          v-for="persona in personasBuscadas"
          :key="persona.id"
          @click="seleccionarPersona(persona)"
          :class="[
            'w-full p-4 rounded-lg border-2 transition-all text-left',
            personaSeleccionada?.id === persona.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-bold text-gray-800">{{ persona.paterno }} {{ persona.materno }}, {{ persona.nombres }}</p>
              <p class="text-sm text-gray-600">DNI: {{ persona.dni }} | Código: {{ persona.codigo }}</p>
            </div>
            <Icon v-if="personaSeleccionada?.id === persona.id" icon="mdi:check-circle" width="24" height="24" class="text-blue-600" />
          </div>
        </button>
      </div>
    </div>

    <!-- Paso 2: Agregar Horarios (solo si hay persona seleccionada) -->
    <div v-if="personaSeleccionada" class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
        Agregar Horario
      </h3>

      <form @submit.prevent="agregarHorario" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Periodo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Periodo <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formularioHorario.periodo_id"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option v-for="periodo in periodos" :key="periodo.id" :value="periodo.id">
              {{ periodo.nombre }}
            </option>
          </select>
        </div>

        <!-- Día de la semana -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Día <span class="text-red-500">*</span>
          </label>
          <select
            v-model.number="formularioHorario.dia_semana"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option :value="1">Lunes</option>
            <option :value="2">Martes</option>
            <option :value="3">Miércoles</option>
            <option :value="4">Jueves</option>
            <option :value="5">Viernes</option>
            <option :value="6">Sábado</option>
            <option :value="0">Domingo</option>
          </select>
        </div>

        <!-- Hora Entrada -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Hora Entrada <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formularioHorario.hora_entrada_prog"
            type="time"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Hora Salida -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Hora Salida <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formularioHorario.hora_salida_prog"
            type="time"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Fecha Inicio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formularioHorario.fecha_inicio"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Fecha Fin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            v-model="formularioHorario.fecha_fin"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Botón Agregar -->
        <div class="md:col-span-2 lg:col-span-3 flex justify-end">
          <button
            type="submit"
            class="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Icon icon="mdi:plus" width="20" height="20" />
            <span>Agregar Horario</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Paso 3: Vista Previa del Horario (Tabla Semanal) -->
    <div v-if="personaSeleccionada && horariosPersona.length > 0" class="bg-white rounded-xl shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
          Horario de {{ personaSeleccionada.nombres }} {{ personaSeleccionada.paterno }}
        </h3>
        <button
          @click="guardarHorarios"
          :disabled="guardando"
          class="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Icon v-if="guardando" icon="mdi:loading" width="20" height="20" class="animate-spin" />
          <Icon v-else icon="mdi:content-save" width="20" height="20" />
          <span>{{ guardando ? 'Guardando...' : 'Guardar Horarios' }}</span>
        </button>
      </div>

      <!-- Tabla de Horarios -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700">Día</th>
              <th class="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700">Hora Entrada</th>
              <th class="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700">Hora Salida</th>
              <th class="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700">Periodo</th>
              <th class="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700">Vigencia</th>
              <th class="border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(horario, index) in horariosOrdenados" :key="index" class="hover:bg-gray-50">
              <td class="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800">
                {{ obtenerNombreDia(horario.dia_semana) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                {{ horario.hora_entrada_prog }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                {{ horario.hora_salida_prog }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                {{ obtenerNombrePeriodo(horario.periodo_id) }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-xs text-gray-600">
                {{ horario.fecha_inicio }} {{ horario.fecha_fin ? `- ${horario.fecha_fin}` : '' }}
              </td>
              <td class="border border-gray-300 px-4 py-2 text-center">
                <button
                  @click="eliminarHorario(index)"
                  class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Icon icon="mdi:delete" width="18" height="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
}

interface Periodo {
  id: string;
  nombre: string;
}

interface Horario {
  periodo_id: string;
  dia_semana: number;
  hora_entrada_prog: string;
  hora_salida_prog: string;
  fecha_inicio: string;
  fecha_fin: string;
}

const busquedaPersona = ref('');
const personasBuscadas = ref<Persona[]>([]);
const personaSeleccionada = ref<Persona | null>(null);
const periodos = ref<Periodo[]>([]);
const horariosPersona = ref<Horario[]>([]);
const guardando = ref(false);

const formularioHorario = ref({
  periodo_id: '',
  dia_semana: '' as number | '',
  hora_entrada_prog: '',
  hora_salida_prog: '',
  fecha_inicio: '',
  fecha_fin: ''
});

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const horariosOrdenados = computed(() => {
  return [...horariosPersona.value].sort((a, b) => a.dia_semana - b.dia_semana);
});

const obtenerNombreDia = (dia: number) => diasSemana[dia];

const obtenerNombrePeriodo = (periodoId: string) => {
  const periodo = periodos.value.find(p => p.id === periodoId);
  return periodo?.nombre || '';
};

const buscarPersonas = async () => {
  if (busquedaPersona.value.length < 2) {
    personasBuscadas.value = [];
    return;
  }

  try {
    const termino = busquedaPersona.value.toLowerCase();
    const { data, error } = await supabase
      .from('personas')
      .select('id, codigo, dni, paterno, materno, nombres')
      .or(`dni.ilike.%${termino}%,codigo.ilike.%${termino}%,nombres.ilike.%${termino}%,paterno.ilike.%${termino}%`)
      .eq('estado', true)
      .limit(10);

    if (error) throw error;
    personasBuscadas.value = data || [];
  } catch (error: any) {
    console.error('Error al buscar personas:', error);
  }
};

const seleccionarPersona = async (persona: Persona) => {
  personaSeleccionada.value = persona;
  personasBuscadas.value = [];
  busquedaPersona.value = `${persona.paterno} ${persona.materno}, ${persona.nombres}`;
  horariosPersona.value = [];
  
  // Cargar horarios existentes
  await cargarHorariosExistentes(persona.id);
};

const cargarHorariosExistentes = async (personaId: string) => {
  try {
    const { data, error } = await supabase
      .from('horarios')
      .select('periodo_id, dia_semana, hora_entrada_prog, hora_salida_prog, fecha_inicio, fecha_fin')
      .eq('persona_id', personaId)
      .eq('estado', true);

    if (error) throw error;
    horariosPersona.value = data || [];
  } catch (error: any) {
    console.error('Error al cargar horarios:', error);
  }
};

const agregarHorario = () => {
  if (!formularioHorario.value.periodo_id || formularioHorario.value.dia_semana === '') {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  horariosPersona.value.push({
    periodo_id: formularioHorario.value.periodo_id,
    dia_semana: formularioHorario.value.dia_semana as number,
    hora_entrada_prog: formularioHorario.value.hora_entrada_prog,
    hora_salida_prog: formularioHorario.value.hora_salida_prog,
    fecha_inicio: formularioHorario.value.fecha_inicio,
    fecha_fin: formularioHorario.value.fecha_fin
  });

  // Limpiar formulario
  formularioHorario.value = {
    periodo_id: formularioHorario.value.periodo_id,
    dia_semana: '' as number | '',
    hora_entrada_prog: '',
    hora_salida_prog: '',
    fecha_inicio: formularioHorario.value.fecha_inicio,
    fecha_fin: formularioHorario.value.fecha_fin
  };
};

const eliminarHorario = (index: number) => {
  horariosPersona.value.splice(index, 1);
};

const guardarHorarios = async () => {
  if (!personaSeleccionada.value) return;

  guardando.value = true;
  try {
    // Eliminar horarios existentes
    await supabase
      .from('horarios')
      .delete()
      .eq('persona_id', personaSeleccionada.value.id);

    // Insertar nuevos horarios
    const horariosParaGuardar = horariosPersona.value.map(h => ({
      persona_id: personaSeleccionada.value!.id,
      periodo_id: h.periodo_id,
      dia_semana: h.dia_semana,
      hora_entrada_prog: h.hora_entrada_prog,
      hora_salida_prog: h.hora_salida_prog,
      fecha_inicio: h.fecha_inicio,
      fecha_fin: h.fecha_fin || null,
      estado: true
    }));

    const { error } = await supabase
      .from('horarios')
      .insert(horariosParaGuardar);

    if (error) throw error;

    alert('Horarios guardados exitosamente');
  } catch (error: any) {
    console.error('Error al guardar horarios:', error);
    alert('Error al guardar: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const cargarPeriodos = async () => {
  try {
    const { data, error } = await supabase
      .from('periodos')
      .select('id, nombre')
      .eq('estado', true);

    if (error) throw error;
    periodos.value = data || [];
  } catch (error: any) {
    console.error('Error al cargar periodos:', error);
  }
};

onMounted(() => {
  cargarPeriodos();
});
</script>
