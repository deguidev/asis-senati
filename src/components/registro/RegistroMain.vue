<template>
  <!-- Pantalla de inicio centrada (sin persona seleccionada) -->
  <div v-if="!personaSeleccionada" class="min-h-screen bg-white flex items-center justify-center p-5">
    <div class="w-full max-w-2xl">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <img src="/senati.webp" alt="SENATI Logo" class="h-20 w-auto object-contain" />
        </div>
        <p class="text-xl text-blue-700 font-semibold">Sistema de Registro de Asistencia y Llaves</p>
      </div>
      
      <!-- Buscador centrado -->
      <BuscadorPersona @persona-seleccionada="handlePersonaSeleccionada" />
      
      <!-- Fecha y Hora Actual -->
      <div class="flex items-center justify-center gap-6 mt-6 text-gray-700">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:calendar-today" width="24" height="24" class="text-blue-600" />
          <span class="text-lg font-semibold">{{ fechaActual }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon icon="mdi:clock-outline" width="24" height="24" class="text-blue-600" />
          <span class="text-xl font-bold font-mono">{{ horaActual }}</span>
        </div>
      </div>
      
      <!-- Mensaje de ayuda -->
      <p class="text-center text-gray-600 text-sm mt-4">
        <Icon icon="mdi:information-outline" width="18" height="18" class="inline mr-1 text-blue-500" />
        Ingresa el DNI o código del docente para comenzar
      </p>
    </div>
  </div>

  <!-- Vista principal (con persona seleccionada) -->
  <div v-else class="max-w-7xl mx-auto p-5">
    <!-- Header con buscador y botón de cerrar sesión -->
    <div class="mb-5 flex gap-3 items-start">
      <div class="flex-1">
        <BuscadorPersona @persona-seleccionada="handlePersonaSeleccionada" />
      </div>
      <button 
        @click="cerrarSesion"
        class="flex items-center gap-2 px-5 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-lg"
      >
        <Icon icon="mdi:logout" width="24" height="24" />
        <span>Cerrar Sesión</span>
      </button>
    </div>

    <!-- Información de la persona y fecha/hora -->
    <div class="mb-5">
      <PersonaInfoCard :persona="personaSeleccionada" />
    </div>

    <!-- Dos columnas: Asistencia y Llaves -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <!-- COLUMNA IZQUIERDA: ASISTENCIA -->
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <h2 class="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:calendar-clock" width="24" height="24" />
          Registro de Asistencia
        </h2>
        <BotonMarcacion
          ref="botonMarcacionRef" 
          :persona-id="personaSeleccionada.id"
          @marcacion-exitosa="actualizarHistorialAsistencia"
        />
        <HistorialAsistencia 
          :persona-id="personaSeleccionada.id"
          :key="refreshAsistencia"
          @salida-marcada="actualizarHistorialAsistencia"
        />
      </div>

      <!-- COLUMNA DERECHA: LLAVES -->
      <div class="bg-white rounded-xl p-6 shadow-lg">
        <h2 class="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:key" width="24" height="24" />
          Registro de Llaves</h2>
        <TableroDeLlaves 
          :persona-id="personaSeleccionada.id"
          :key="refreshLlaves"
          @llave-seleccionada="handleLlaveSeleccionada"
        />
        <BotonLlave 
          v-if="llaveSeleccionada"
          :persona-id="personaSeleccionada.id"
          :llave-id="llaveSeleccionada.id"
          @marcacion-exitosa="actualizarHistorialLlaves"
        />
        <HistorialLlaves 
          :persona-id="personaSeleccionada.id"
          :key="refreshLlaves"
          @llave-entregada="actualizarHistorialLlaves"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import BuscadorPersona from '@/components/busqueda/BuscadorPersona.vue';
import PersonaInfoCard from '@/components/shared/PersonaInfoCard.vue';
import BotonMarcacion from '@/components/asistencia/BotonMarcacion.vue';
import HistorialAsistencia from '@/components/asistencia/HistorialAsistencia.vue';
import TableroDeLlaves from '@/components/llaves/TableroDeLlaves.vue';
import BotonLlave from '@/components/llaves/BotonLlave.vue';
import HistorialLlaves from '@/components/llaves/HistorialLlaves.vue';

const personaSeleccionada = ref(null);
const llaveSeleccionada = ref(null);
const refreshAsistencia = ref(0);
const refreshLlaves = ref(0);
const botonMarcacionRef = ref(null);

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
  
  // Formatear hora con segundos: 23:01:45
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

const handlePersonaSeleccionada = (persona: any) => {
  personaSeleccionada.value = persona;
  llaveSeleccionada.value = null;
  refreshAsistencia.value++;
  refreshLlaves.value++;
};

const handleLlaveSeleccionada = (llave: any) => {
  llaveSeleccionada.value = llave;
};

const cerrarSesion = () => {
  personaSeleccionada.value = null;
  llaveSeleccionada.value = null;
};

const actualizarHistorialAsistencia = async () => {
  refreshAsistencia.value++;
  // Verificar el estado del botón después de actualizar
  if (botonMarcacionRef.value) {
    await botonMarcacionRef.value.verificarEstadoBoton();
  }
};

const actualizarHistorialLlaves = () => {
  refreshLlaves.value++;
  llaveSeleccionada.value = null;
};
</script>

