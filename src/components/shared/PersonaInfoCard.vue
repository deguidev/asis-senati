<template>
  <div class="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl shadow-xl p-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Información de la Persona -->
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
          <Icon icon="mdi:account-circle" width="40" height="40" class="text-white" />
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-2">{{ persona.nombres }} {{ persona.paterno }} {{ persona.materno }}</h3>
          <div class="flex flex-wrap gap-3 text-sm opacity-95">
            <span class="flex items-center gap-1">
              <Icon icon="mdi:card-account-details" width="16" height="16" />
              <strong>DNI:</strong> {{ persona.dni }}
            </span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi:barcode" width="16" height="16" />
              <strong>Código:</strong> {{ persona.codigo }}
            </span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi:account-badge" width="16" height="16" />
              <strong>Tipo:</strong> {{ persona.tipo_persona }}
            </span>
          </div>
        </div>
      </div>

      <!-- Fecha y Hora Actual -->
      <div class="flex items-center justify-end gap-6 border-l border-white/20 pl-6">
        <div class="flex items-center gap-3">
          <Icon icon="mdi:calendar-today" width="32" height="32" class="text-white/90" />
          <div>
            <div class="text-xs opacity-80 font-medium">Fecha Actual</div>
            <div class="text-lg font-bold">{{ fechaActual }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Icon icon="mdi:clock-outline" width="32" height="32" class="text-white/90" />
          <div>
            <div class="text-xs opacity-80 font-medium">Hora Actual</div>
            <div class="text-2xl font-bold font-mono">{{ horaActual }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

defineProps({
  persona: {
    type: Object,
    required: true
  }
});

// Fecha y Hora actual
const fechaActual = ref('');
const horaActual = ref('');
let intervalo: number | null = null;

const actualizarFechaHora = () => {
  const ahora = new Date();
  
  // Formatear fecha: 18/11/2025
  fechaActual.value = ahora.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Formatear hora con segundos: 20:58:45
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const segundos = ahora.getSeconds().toString().padStart(2, '0');
  horaActual.value = `${horas}:${minutos}:${segundos}`;
};

onMounted(() => {
  actualizarFechaHora();
  intervalo = window.setInterval(actualizarFechaHora, 1000);
});

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo);
  }
});
</script>
