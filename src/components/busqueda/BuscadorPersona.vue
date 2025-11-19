<template>
  <div class="relative">
    <div class="flex gap-2 md:gap-3">
      <input v-model="busqueda" type="text" placeholder="Ingresa DNI o Código..." @input="buscarPersona"
        @keyup.enter="seleccionarPrimero"
        class="flex-1 px-3 md:px-5 py-3 text-base md:text-lg border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-green-500" />
      <button @click="buscarPersona"
        class="flex items-center justify-center gap-2 px-3 md:px-5 py-3 text-lg font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap">
        <Icon icon="mdi:search" width="24" height="24" />
        <span class="hidden sm:inline">Buscar</span>
      </button>
    </div>

    <!-- Resultados de búsqueda -->
    <div v-if="resultados.length > 0"
      class="absolute top-full left-0 right-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg max-h-80 overflow-y-auto z-50 shadow-lg">
      <div v-for="persona in resultados" :key="persona.id" @click="seleccionarPersona(persona)"
        class="px-5 py-4 cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors last:border-b-0">
        <div class="flex flex-col gap-1">
          <strong class="text-gray-900">{{ persona.nombres }} {{ persona.paterno }} {{ persona.materno }}</strong>
          <span class="text-sm text-gray-600">DNI: {{ persona.dni }} | Código: {{ persona.codigo }}</span>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-if="busqueda && resultados.length === 0 && !cargando && busqueda.length >= 3 && !personaSeleccionada"
      class="mt-3 p-3 text-center text-gray-600 bg-gray-100 rounded-lg">
      ❌ No se encontró ningún docente con ese DNI o código
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="mt-3 p-3 text-center text-gray-600 bg-gray-100 rounded-lg">
      Buscando...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue'

const emit = defineEmits(['persona-seleccionada']);

const busqueda = ref('');
const resultados = ref([]);
const cargando = ref(false);
const personaSeleccionada = ref(false);

const buscarPersona = async () => {
  // Resetear el estado de persona seleccionada cuando se empieza a buscar
  personaSeleccionada.value = false;

  if (!busqueda.value || busqueda.value.length < 3) {
    resultados.value = [];
    return;
  }

  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .or(`dni.ilike.%${busqueda.value}%,codigo.ilike.%${busqueda.value}%`)
      .eq('estado', true)
      .limit(5);

    if (error) throw error;
    resultados.value = data || [];
  } catch (error) {
    console.error('Error al buscar persona:', error);
    resultados.value = [];
  } finally {
    cargando.value = false;
  }
};

const seleccionarPersona = (persona: any) => {
  emit('persona-seleccionada', persona);
  busqueda.value = `${persona.nombres} ${persona.paterno}`;
  resultados.value = [];
  personaSeleccionada.value = true;
};

const seleccionarPrimero = () => {
  if (resultados.value.length > 0) {
    seleccionarPersona(resultados.value[0]);
  }
};
</script>
