<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Icon icon="mdi:clock-outline" width="28" height="28" class="text-blue-600" />
        Gestión de Horarios
      </h2>
      <p class="text-gray-600 text-sm mt-1">Asigna horarios semanales con selección visual de bloques</p>
    </div>

    <!-- Paso 1: Buscar Persona y Seleccionar Periodo -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
        Configuración Inicial
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Buscador de Persona -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Persona</label>
          <div class="relative">
            <Icon icon="mdi:magnify" width="20" height="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="busquedaPersona"
              type="text"
              placeholder="DNI, código o nombre..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="buscarPersonas"
            />
          </div>

          <!-- Resultados de búsqueda -->
          <div v-if="personasBuscadas.length > 0" class="mt-2 space-y-2 max-h-48 overflow-y-auto">
            <button
              v-for="persona in personasBuscadas"
              :key="persona.id"
              @click="seleccionarPersona(persona)"
              :class="[
                'w-full p-3 rounded-lg border-2 transition-all text-left text-sm',
                personaSeleccionada?.id === persona.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              ]"
            >
              <p class="font-bold text-gray-800">{{ persona.paterno }} {{ persona.materno }}, {{ persona.nombres }}</p>
              <p class="text-xs text-gray-600">DNI: {{ persona.dni }}</p>
            </button>
          </div>

          <!-- Persona seleccionada -->
          <div v-if="personaSeleccionada && personasBuscadas.length === 0" class="mt-2 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
            <p class="font-bold text-green-800">{{ personaSeleccionada.paterno }} {{ personaSeleccionada.materno }}, {{ personaSeleccionada.nombres }}</p>
            <p class="text-xs text-green-600">DNI: {{ personaSeleccionada.dni }}</p>
          </div>
        </div>

        <!-- Selector de Periodo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Periodo Académico <span class="text-red-500">*</span>
          </label>
          <select
            v-model="periodoSeleccionado"
            @change="onPeriodoChange"
            class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar periodo...</option>
            <option v-for="periodo in periodos" :key="periodo.id" :value="periodo.id">
              {{ periodo.nombre }}
            </option>
          </select>

          <!-- Info del periodo -->
          <div v-if="periodoActual" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-xs text-blue-800 font-medium">{{ periodoActual.nombre }}</p>
            <p class="text-xs text-blue-600 mt-1">
              📅 {{ formatearFecha(periodoActual.fecha_inicio) }} - {{ formatearFecha(periodoActual.fecha_fin) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Horarios Existentes -->
    <div v-if="personaSeleccionada && periodoSeleccionado && horariosGuardados.length > 0" class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Icon icon="mdi:calendar-multiple" width="24" height="24" class="text-blue-600" />
        Horarios Registrados en este Periodo
      </h3>

      <div class="space-y-3">
        <div 
          v-for="(horario, index) in horariosGuardados" 
          :key="index"
          class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                Horario {{ index + 1 }}
              </span>
              <span class="text-sm text-gray-600">
                📅 {{ formatearFecha(horario.fecha_inicio) }} - {{ formatearFecha(horario.fecha_fin) }}
              </span>
            </div>
            
            <div class="flex gap-2">
              <button
                @click="editarHorario(horario, index)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Icon icon="mdi:pencil" width="20" height="20" />
              </button>
              <button
                @click="eliminarHorario(index)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Icon icon="mdi:delete" width="20" height="20" />
              </button>
            </div>
          </div>

          <!-- Estadísticas de Horas -->
          <div class="grid grid-cols-2 gap-3 mb-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 mb-1">
                <Icon icon="mdi:clock-outline" width="16" height="16" class="text-green-600" />
                <span class="text-xs font-medium text-gray-600">Horas/Semana</span>
              </div>
              <p class="text-2xl font-bold text-green-700">{{ calcularHorasSemanales(horario) }}</p>
              <p class="text-xs text-gray-500">horas</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 mb-1">
                <Icon icon="mdi:calendar-clock" width="16" height="16" class="text-blue-600" />
                <span class="text-xs font-medium text-gray-600">Total Periodo</span>
              </div>
              <p class="text-2xl font-bold text-blue-700">{{ calcularHorasTotales(horario) }}</p>
              <p class="text-xs text-gray-500">horas aprox.</p>
            </div>
          </div>
          
          <!-- Detalle de Horarios por Día -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            <div v-for="dia in diasSemana.filter(d => horario.dias[d.valor])" :key="dia.valor">
              <span class="font-semibold text-gray-700">{{ dia.nombre }}:</span>
              <div v-for="(bloque, idx) in horario.dias[dia.valor]" :key="idx" class="text-gray-600 ml-2">
                {{ bloque.inicio }} - {{ bloque.fin }}
                <span class="text-gray-400">({{ calcularDuracionBloque(bloque) }}h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="nuevoHorario"
        class="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <Icon icon="mdi:plus-circle" width="20" height="20" />
        <span class="font-medium">Agregar Nuevo Horario</span>
      </button>
    </div>

    <!-- Paso 2: Tabla de Horarios (solo si hay persona y periodo seleccionados) -->
    <div v-if="personaSeleccionada && periodoSeleccionado && modoEdicion" class="bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
          {{ horarioEditando !== null ? 'Editar Horario' : 'Nuevo Horario' }}
        </h3>
        <button
          @click="cancelarEdicion"
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <Icon icon="mdi:close" width="16" height="16" class="inline mr-1" />
          Cancelar
        </button>
      </div>

      <!-- Campos de Fecha -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Inicio <span class="text-red-500">*</span>
          </label>
          <input
            v-model="fechaInicio"
            type="date"
            :min="periodoActual?.fecha_inicio"
            :max="fechaFin || periodoActual?.fecha_fin"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-600 mt-1">Desde cuándo aplica este horario</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Fin <span class="text-red-500">*</span>
          </label>
          <input
            v-model="fechaFin"
            type="date"
            :min="fechaInicio || periodoActual?.fecha_inicio"
            :max="periodoActual?.fecha_fin"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-600 mt-1">Hasta cuándo aplica este horario</p>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h4 class="text-md font-semibold text-gray-700">Seleccionar Horarios (Click y arrastra)</h4>
        <button
          @click="limpiarSeleccion"
          class="px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
        >
          <Icon icon="mdi:eraser" width="16" height="16" class="inline mr-1" />
          Limpiar
        </button>
      </div>

      <!-- Leyenda -->
      <div class="flex gap-4 mb-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Disponible</span>
        </div>
      </div>

      <!-- Tabla de Horarios -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse select-none">
          <thead>
            <tr>
              <th class="border border-gray-300 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-700 sticky left-0 z-10">Hora</th>
              <th 
                v-for="dia in diasSemana" 
                :key="dia.valor"
                class="border border-gray-300 bg-gray-50 px-2 py-2 text-xs font-bold text-gray-700 min-w-[80px]"
              >
                {{ dia.nombre }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hora in horasDisponibles" :key="hora">
              <td class="border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 sticky left-0 z-10 whitespace-nowrap">
                {{ hora }}
              </td>
              <td 
                v-for="dia in diasSemana" 
                :key="`${dia.valor}-${hora}`"
                @mousedown="iniciarSeleccion(dia.valor, hora)"
                @mouseenter="continuarSeleccion(dia.valor, hora)"
                @mouseup="finalizarSeleccion"
                :class="[
                  'border border-gray-300 px-2 py-3 cursor-pointer transition-colors',
                  estaSeleccionado(dia.valor, hora) 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white hover:bg-blue-50'
                ]"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Botón Guardar -->
      <div class="mt-6 flex justify-between items-center">
        <!-- Resumen rápido -->
        <div v-if="tieneSeleccion" class="text-sm text-gray-600">
          <Icon icon="mdi:information" width="16" height="16" class="inline text-blue-600" />
          {{ contarDiasSeleccionados() }} días con horarios seleccionados
        </div>
        <div v-else class="text-sm text-gray-500 italic">
          Selecciona al menos un bloque de horario
        </div>

        <button
          @click="guardarHorarioActual"
          :disabled="guardando || !tieneSeleccion || !fechaInicio || !fechaFin"
          class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="guardando" icon="mdi:loading" width="20" height="20" class="animate-spin" />
          <Icon v-else icon="mdi:content-save" width="20" height="20" />
          <span>{{ guardando ? 'Guardando...' : horarioEditando !== null ? 'Actualizar' : 'Guardar Horario' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
  fecha_inicio: string;
  fecha_fin: string;
}

const busquedaPersona = ref('');
const personasBuscadas = ref<Persona[]>([]);
const personaSeleccionada = ref<Persona | null>(null);
const periodos = ref<Periodo[]>([]);
const periodoSeleccionado = ref('');
const periodoActual = ref<Periodo | null>(null);
const guardando = ref(false);

// Múltiples horarios
const horariosGuardados = ref<any[]>([]);
const modoEdicion = ref(false);
const horarioEditando = ref<number | null>(null);
const fechaInicio = ref('');
const fechaFin = ref('');

// Días de la semana (sin domingo)
const diasSemana = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 0, nombre: 'Domingo' }
];

// Generar horas de 7:00 AM a 10:00 PM en intervalos de 15 minutos
const horasDisponibles = computed(() => {
  const horas: string[] = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      horas.push(hora);
    }
  }
  return horas;
});

// Estructura para almacenar selecciones: { dia: { hora: boolean } }
const selecciones = ref<Record<number, Record<string, boolean>>>({});

// Variables para el arrastre
const seleccionando = ref(false);
const modoSeleccion = ref<'seleccionar' | 'deseleccionar'>('seleccionar');

const tieneSeleccion = computed(() => {
  return Object.values(selecciones.value).some(dia => 
    Object.values(dia).some(seleccionado => seleccionado)
  );
});

const estaSeleccionado = (dia: number, hora: string) => {
  return selecciones.value[dia]?.[hora] || false;
};

const iniciarSeleccion = (dia: number, hora: string) => {
  seleccionando.value = true;
  const yaSeleccionado = estaSeleccionado(dia, hora);
  modoSeleccion.value = yaSeleccionado ? 'deseleccionar' : 'seleccionar';
  toggleSeleccion(dia, hora);
};

const continuarSeleccion = (dia: number, hora: string) => {
  if (!seleccionando.value) return;
  
  if (modoSeleccion.value === 'seleccionar') {
    if (!selecciones.value[dia]) selecciones.value[dia] = {};
    selecciones.value[dia][hora] = true;
  } else {
    if (selecciones.value[dia]) {
      selecciones.value[dia][hora] = false;
    }
  }
};

const finalizarSeleccion = () => {
  seleccionando.value = false;
};

const toggleSeleccion = (dia: number, hora: string) => {
  if (!selecciones.value[dia]) {
    selecciones.value[dia] = {};
  }
  selecciones.value[dia][hora] = !selecciones.value[dia][hora];
};

const limpiarSeleccion = () => {
  selecciones.value = {};
};

const contarDiasSeleccionados = () => {
  return Object.values(selecciones.value).filter(dia => 
    Object.values(dia).some(seleccionado => seleccionado)
  ).length;
};

const nuevoHorario = () => {
  modoEdicion.value = true;
  horarioEditando.value = null;
  limpiarSeleccion();
  fechaInicio.value = periodoActual.value?.fecha_inicio || '';
  fechaFin.value = periodoActual.value?.fecha_fin || '';
};

const cancelarEdicion = () => {
  modoEdicion.value = false;
  horarioEditando.value = null;
  limpiarSeleccion();
  fechaInicio.value = '';
  fechaFin.value = '';
};

const editarHorario = (horario: any, index: number) => {
  horarioEditando.value = index;
  modoEdicion.value = true;
  fechaInicio.value = horario.fecha_inicio;
  fechaFin.value = horario.fecha_fin;
  
  // Cargar selecciones del horario
  limpiarSeleccion();
  Object.entries(horario.dias).forEach(([dia, bloques]: [string, any]) => {
    const diaNum = parseInt(dia);
    (bloques as any[]).forEach((bloque: any) => {
      const [hInicio, mInicio] = bloque.inicio.split(':').map(Number);
      const [hFin, mFin] = bloque.fin.split(':').map(Number);
      const minutosInicio = hInicio * 60 + mInicio;
      const minutosFin = hFin * 60 + mFin;

      for (let m = minutosInicio; m < minutosFin; m += 15) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const hora = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        if (!selecciones.value[diaNum]) selecciones.value[diaNum] = {};
        selecciones.value[diaNum][hora] = true;
      }
    });
  });
};

const eliminarHorario = async (index: number) => {
  if (!confirm('¿Estás seguro de eliminar este horario?')) return;

  guardando.value = true;
  try {
    const horario = horariosGuardados.value[index];
    
    // Eliminar de la base de datos
    const { error } = await supabase
      .from('horarios')
      .delete()
      .eq('persona_id', personaSeleccionada.value!.id)
      .eq('periodo_id', periodoSeleccionado.value)
      .eq('fecha_inicio', horario.fecha_inicio)
      .eq('fecha_fin', horario.fecha_fin);

    if (error) throw error;

    // Eliminar del array local
    horariosGuardados.value.splice(index, 1);
    
    alert('✅ Horario eliminado exitosamente');
  } catch (error: any) {
    console.error('Error al eliminar horario:', error);
    alert('❌ Error al eliminar: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const obtenerHorariosDia = (dia: number) => {
  if (!selecciones.value[dia]) return [];
  
  const horasSeleccionadas = Object.entries(selecciones.value[dia])
    .filter(([_, seleccionado]) => seleccionado)
    .map(([hora]) => hora)
    .sort();

  // Agrupar horas consecutivas
  const horarios: { inicio: string; fin: string }[] = [];
  let inicio: string | null = null;
  let anterior: string | null = null;

  horasSeleccionadas.forEach((hora, index) => {
    if (inicio === null) {
      inicio = hora;
    }
    
    const siguienteEsConsecutivo = index < horasSeleccionadas.length - 1 && 
      esConsecutivo(hora, horasSeleccionadas[index + 1]);

    if (!siguienteEsConsecutivo) {
      const fin = sumarMinutos(hora, 15);
      horarios.push({ inicio: inicio!, fin });
      inicio = null;
    }
    
    anterior = hora;
  });

  return horarios;
};

const esConsecutivo = (hora1: string, hora2: string) => {
  const [h1, m1] = hora1.split(':').map(Number);
  const [h2, m2] = hora2.split(':').map(Number);
  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;
  return minutos2 - minutos1 === 15;
};

const sumarMinutos = (hora: string, minutos: number) => {
  const [h, m] = hora.split(':').map(Number);
  const totalMinutos = h * 60 + m + minutos;
  const nuevaHora = Math.floor(totalMinutos / 60);
  const nuevosMinutos = totalMinutos % 60;
  return `${nuevaHora.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const calcularDuracionBloque = (bloque: { inicio: string; fin: string }) => {
  const [hInicio, mInicio] = bloque.inicio.split(':').map(Number);
  const [hFin, mFin] = bloque.fin.split(':').map(Number);
  const minutosInicio = hInicio * 60 + mInicio;
  const minutosFin = hFin * 60 + mFin;
  const duracionMinutos = minutosFin - minutosInicio;
  const horas = duracionMinutos / 60;
  return horas.toFixed(2);
};

const calcularHorasSemanales = (horario: any) => {
  let totalMinutos = 0;
  
  Object.values(horario.dias).forEach((bloques: any) => {
    bloques.forEach((bloque: any) => {
      const [hInicio, mInicio] = bloque.inicio.split(':').map(Number);
      const [hFin, mFin] = bloque.fin.split(':').map(Number);
      const minutosInicio = hInicio * 60 + mInicio;
      const minutosFin = hFin * 60 + mFin;
      totalMinutos += (minutosFin - minutosInicio);
    });
  });
  
  const horas = totalMinutos / 60;
  return horas.toFixed(2);
};

const calcularHorasTotales = (horario: any) => {
  const horasSemanales = parseFloat(calcularHorasSemanales(horario));
  
  // Calcular número de semanas entre fecha_inicio y fecha_fin
  const fechaInicio = new Date(horario.fecha_inicio + 'T00:00:00');
  const fechaFin = new Date(horario.fecha_fin + 'T00:00:00');
  const diferenciaMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
  const diferenciaDias = diferenciaMilisegundos / (1000 * 60 * 60 * 24);
  const semanas = diferenciaDias / 7;
  
  const horasTotales = horasSemanales * semanas;
  return horasTotales.toFixed(0);
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
  busquedaPersona.value = '';
  limpiarSeleccion();
  modoEdicion.value = false;
  horarioEditando.value = null;
  horariosGuardados.value = [];
  
  // Cargar horarios existentes si hay periodo seleccionado
  if (periodoSeleccionado.value) {
    await cargarHorariosExistentes();
  }
};

const onPeriodoChange = async () => {
  const periodo = periodos.value.find(p => p.id === periodoSeleccionado.value);
  periodoActual.value = periodo || null;
  limpiarSeleccion();
  modoEdicion.value = false;
  horarioEditando.value = null;
  horariosGuardados.value = [];
  
  if (personaSeleccionada.value) {
    await cargarHorariosExistentes();
    // Si no hay horarios, abrir automáticamente el modo edición
    if (horariosGuardados.value.length === 0) {
      nuevoHorario();
    }
  }
};

const cargarHorariosExistentes = async () => {
  if (!personaSeleccionada.value || !periodoSeleccionado.value) return;

  try {
    const { data, error } = await supabase
      .from('horarios')
      .select('dia_semana, hora_entrada_prog, hora_salida_prog, fecha_inicio, fecha_fin')
      .eq('persona_id', personaSeleccionada.value.id)
      .eq('periodo_id', periodoSeleccionado.value)
      .eq('estado', true)
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;

    // Agrupar por fecha_inicio y fecha_fin
    const horariosAgrupados: Record<string, any> = {};
    
    data?.forEach(horario => {
      const key = `${horario.fecha_inicio}_${horario.fecha_fin}`;
      if (!horariosAgrupados[key]) {
        horariosAgrupados[key] = {
          fecha_inicio: horario.fecha_inicio,
          fecha_fin: horario.fecha_fin,
          dias: {}
        };
      }

      const dia = horario.dia_semana;
      if (!horariosAgrupados[key].dias[dia]) {
        horariosAgrupados[key].dias[dia] = [];
      }

      horariosAgrupados[key].dias[dia].push({
        inicio: horario.hora_entrada_prog,
        fin: horario.hora_salida_prog
      });
    });

    horariosGuardados.value = Object.values(horariosAgrupados);
  } catch (error: any) {
    console.error('Error al cargar horarios:', error);
  }
};

const guardarHorarioActual = async () => {
  if (!personaSeleccionada.value || !periodoSeleccionado.value || !fechaInicio.value || !fechaFin.value) return;

  guardando.value = true;
  try {
    // Si estamos editando, eliminar el horario anterior
    if (horarioEditando.value !== null) {
      const horarioAnterior = horariosGuardados.value[horarioEditando.value];
      await supabase
        .from('horarios')
        .delete()
        .eq('persona_id', personaSeleccionada.value.id)
        .eq('periodo_id', periodoSeleccionado.value)
        .eq('fecha_inicio', horarioAnterior.fecha_inicio)
        .eq('fecha_fin', horarioAnterior.fecha_fin);
    }

    // Preparar nuevos horarios
    const horariosParaGuardar: any[] = [];
    
    diasSemana.forEach(dia => {
      const horariosDia = obtenerHorariosDia(dia.valor);
      horariosDia.forEach(horario => {
        horariosParaGuardar.push({
          persona_id: personaSeleccionada.value!.id,
          periodo_id: periodoSeleccionado.value,
          dia_semana: dia.valor,
          hora_entrada_prog: horario.inicio,
          hora_salida_prog: horario.fin,
          fecha_inicio: fechaInicio.value,
          fecha_fin: fechaFin.value,
          estado: true
        });
      });
    });

    if (horariosParaGuardar.length > 0) {
      const { error } = await supabase
        .from('horarios')
        .insert(horariosParaGuardar);

      if (error) throw error;
    }

    alert('✅ Horario guardado exitosamente');
    
    // Recargar horarios y cerrar modo edición
    await cargarHorariosExistentes();
    cancelarEdicion();
  } catch (error: any) {
    console.error('Error al guardar horario:', error);
    alert('❌ Error al guardar: ' + error.message);
  } finally {
    guardando.value = false;
  }
};

const cargarPeriodos = async () => {
  try {
    const { data, error } = await supabase
      .from('periodos')
      .select('id, nombre, fecha_inicio, fecha_fin')
      .eq('estado', true);

    if (error) throw error;
    periodos.value = data || [];
  } catch (error: any) {
    console.error('Error al cargar periodos:', error);
  }
};

onMounted(() => {
  cargarPeriodos();
  
  // Prevenir selección de texto al arrastrar
  document.addEventListener('mouseup', finalizarSeleccion);
});

onUnmounted(() => {
  document.removeEventListener('mouseup', finalizarSeleccion);
});
</script>

<style scoped>
/* Prevenir selección de texto al arrastrar */
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
