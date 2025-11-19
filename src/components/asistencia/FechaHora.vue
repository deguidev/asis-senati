<template>
  <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="text-5xl">📅</div>
        <div>
          <div class="text-sm opacity-90 font-medium">Fecha Actual</div>
          <div class="text-2xl font-bold">{{ fechaActual }}</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-5xl">🕐</div>
        <div>
          <div class="text-sm opacity-90 font-medium">Hora Actual</div>
          <div class="text-3xl font-bold font-mono">{{ horaActual }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Fecha y Hora actual
const fechaActual = ref('');
const horaActual = ref('');
let intervalo: number | null = null;

const actualizarFechaHora = () => {
  const ahora = new Date();
  
  // Formatear fecha: Lunes, 18 de Noviembre de 2025
  const opciones: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  fechaActual.value = ahora.toLocaleDateString('es-ES', opciones);
  
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
