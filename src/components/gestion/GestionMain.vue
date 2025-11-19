<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          <Icon icon="mdi:cog" width="32" height="32" class="inline mr-2 text-blue-600" />
          Gestión del Sistema
        </h1>
        <p class="text-gray-600">Administra personas, llaves, periodos y horarios</p>
      </div>

      <!-- Navegación de Módulos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          @click="moduloActivo = 'personas'"
          :class="[
            'p-6 rounded-xl transition-all shadow-md hover:shadow-xl',
            moduloActivo === 'personas' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-blue-50'
          ]"
        >
          <Icon icon="mdi:account-group" width="40" height="40" class="mx-auto mb-3" />
          <h3 class="font-bold text-lg">Personas</h3>
          <p :class="moduloActivo === 'personas' ? 'text-blue-100' : 'text-gray-500'" class="text-sm mt-1">
            Gestionar docentes y personal
          </p>
        </button>

        <button
          @click="moduloActivo = 'llaves'"
          :class="[
            'p-6 rounded-xl transition-all shadow-md hover:shadow-xl',
            moduloActivo === 'llaves' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-blue-50'
          ]"
        >
          <Icon icon="mdi:key" width="40" height="40" class="mx-auto mb-3" />
          <h3 class="font-bold text-lg">Llaves</h3>
          <p :class="moduloActivo === 'llaves' ? 'text-blue-100' : 'text-gray-500'" class="text-sm mt-1">
            Administrar llaves de aulas
          </p>
        </button>

        <button
          @click="moduloActivo = 'periodos'"
          :class="[
            'p-6 rounded-xl transition-all shadow-md hover:shadow-xl',
            moduloActivo === 'periodos' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-blue-50'
          ]"
        >
          <Icon icon="mdi:calendar-range" width="40" height="40" class="mx-auto mb-3" />
          <h3 class="font-bold text-lg">Periodos</h3>
          <p :class="moduloActivo === 'periodos' ? 'text-blue-100' : 'text-gray-500'" class="text-sm mt-1">
            Configurar periodos académicos
          </p>
        </button>

        <button
          @click="moduloActivo = 'horarios'"
          :class="[
            'p-6 rounded-xl transition-all shadow-md hover:shadow-xl',
            moduloActivo === 'horarios' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-blue-50'
          ]"
        >
          <Icon icon="mdi:clock-outline" width="40" height="40" class="mx-auto mb-3" />
          <h3 class="font-bold text-lg">Horarios</h3>
          <p :class="moduloActivo === 'horarios' ? 'text-blue-100' : 'text-gray-500'" class="text-sm mt-1">
            Asignar horarios a docentes
          </p>
        </button>
      </div>

      <!-- Contenido del Módulo Activo -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <PersonasGestion v-if="moduloActivo === 'personas'" />
        <LlavesGestion v-if="moduloActivo === 'llaves'" />
        <PeriodosGestion v-if="moduloActivo === 'periodos'" />
        <HorariosGestion v-if="moduloActivo === 'horarios'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import PersonasGestion from './PersonasGestion.vue';
import LlavesGestion from './LlavesGestion.vue';
import PeriodosGestion from './PeriodosGestion.vue';
import HorariosGestion from './HorariosGestion.vue';

const moduloActivo = ref<'personas' | 'llaves' | 'periodos' | 'horarios'>('personas');
</script>
