<template>
  <!-- Modal de Información del Docente -->
  <div v-if="mostrar" @click="$emit('cerrar')" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div @click.stop class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
      <!-- Header del Modal -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:key-alert" class="text-red-500" width="24" height="24" />
          Llave Ocupada
        </h3>
        <button @click="$emit('cerrar')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon icon="mdi:close" width="24" height="24" />
        </button>
      </div>

      <!-- Información de la Llave -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-3">
          <Icon icon="mdi:key-variant" class="text-red-500" width="32" height="32" />
          <div>
            <p class="text-sm text-gray-600">Llave</p>
            <p class="text-lg font-bold text-gray-800">{{ infoLlave?.nombre }}</p>
          </div>
        </div>
      </div>

      <!-- Información del Docente -->
      <div v-if="docente" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-2">Docente que tiene la llave:</p>
          
          <div class="space-y-3">
            <!-- Nombre -->
            <div class="flex items-start gap-3">
              <Icon icon="mdi:account" class="text-blue-600 mt-1" width="20" height="20" />
              <div class="flex-1">
                <p class="text-xs text-gray-500">Nombre completo</p>
                <p class="font-bold text-gray-800">{{ docente.nombres }} {{ docente.paterno }} {{ docente.materno }}</p>
              </div>
            </div>

            <!-- DNI -->
            <div class="flex items-start gap-3">
              <Icon icon="mdi:card-account-details" class="text-blue-600 mt-1" width="20" height="20" />
              <div class="flex-1">
                <p class="text-xs text-gray-500">DNI</p>
                <p class="font-semibold text-gray-800">{{ docente.dni }}</p>
              </div>
            </div>

            <!-- Celular -->
            <div class="flex items-start gap-3">
              <Icon icon="mdi:cellphone" class="text-green-600 mt-1" width="20" height="20" />
              <div class="flex-1">
                <p class="text-xs text-gray-500">Celular</p>
                <p class="font-semibold text-gray-800">{{ docente.telefono || 'No registrado' }}</p>
              </div>
            </div>

            <!-- Hora de retiro -->
            <div class="flex items-start gap-3">
              <Icon icon="mdi:clock-outline" class="text-orange-600 mt-1" width="20" height="20" />
              <div class="flex-1">
                <p class="text-xs text-gray-500">Hora de retiro</p>
                <p class="font-semibold text-gray-800">{{ formatearHora(registro?.hora_salida) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de llamar -->
        <a v-if="docente.telefono" :href="`tel:${docente.telefono}`" 
           class="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-lg">
          <Icon icon="mdi:phone" width="24" height="24" />
          Llamar al docente
        </a>
      </div>

      <!-- Loading -->
      <div v-else class="flex items-center justify-center py-8">
        <Icon icon="mdi:loading" class="animate-spin text-blue-600" width="32" height="32" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps({
  mostrar: {
    type: Boolean,
    required: true
  },
  infoLlave: {
    type: Object,
    default: null
  },
  docente: {
    type: Object,
    default: null
  },
  registro: {
    type: Object,
    default: null
  }
});

defineEmits(['cerrar']);

const formatearHora = (hora: string) => {
  if (!hora) return '';
  return hora.substring(0, 5); // HH:MM
};
</script>
