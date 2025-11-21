<template>
  <div class="max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Icon icon="mdi:chart-box" width="28" height="28" class="text-blue-600" />
        Reporte de Asistencia
      </h2>
      <p class="text-gray-600 text-sm mt-1">Visualiza el registro de asistencia mensual por persona</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
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
        </div>

        <!-- Selector de Mes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mes</label>
          <select
            v-model="mesSeleccionado"
            @change="cargarReporte"
            class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar mes...</option>
            <option v-for="mes in meses" :key="mes.valor" :value="mes.valor">
              {{ mes.nombre }}
            </option>
          </select>
        </div>
      </div>

      <!-- Botón Generar Reporte -->
      <div class="mt-4 flex justify-end">
        <button
          @click="cargarReporte"
          :disabled="!personaSeleccionada || !periodoSeleccionado || !mesSeleccionado || cargando"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="cargando" icon="mdi:loading" class="animate-spin" width="20" height="20" />
          <Icon v-else icon="mdi:file-chart" width="20" height="20" />
          <span>{{ cargando ? 'Generando...' : 'Generar Reporte' }}</span>
        </button>
      </div>
    </div>

    <!-- Contenido del Reporte -->
    <div v-if="reporteGenerado" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Columna Pequeña: Horario -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-md p-5 border border-gray-200 sticky top-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon icon="mdi:clock-outline" width="22" height="22" class="text-blue-600" />
            Horario Registrado
          </h3>

          <div v-if="horariosAgrupados.length === 0" class="text-sm text-gray-500 text-center py-4">
            Sin horario registrado
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="(grupo, index) in horariosAgrupados" 
              :key="index"
              class="border-2 border-blue-200 rounded-lg overflow-hidden"
            >
              <!-- Header del Grupo -->
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2">
                <div class="flex items-center gap-2 mb-1">
                  <Icon icon="mdi:calendar-range" width="16" height="16" class="text-white" />
                  <span class="text-xs font-bold text-white">Horario {{ index + 1 }}</span>
                </div>
                <div class="text-[10px] text-blue-100">
                  {{ formatearFecha(grupo.fecha_inicio) }} - {{ formatearFecha(grupo.fecha_fin) }}
                </div>
              </div>

              <!-- Días del Grupo -->
              <div class="p-3 space-y-2 bg-blue-50">
                <div 
                  v-for="dia in grupo.dias" 
                  :key="dia.dia_semana"
                  class="bg-white rounded-lg p-2 border border-blue-200"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <Icon icon="mdi:calendar" width="14" height="14" class="text-blue-600" />
                    <span class="text-xs font-bold text-blue-800">{{ obtenerNombreDia(dia.dia_semana) }}</span>
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 text-[10px] text-gray-700">
                      <Icon icon="mdi:login" width="12" height="12" class="text-green-600" />
                      <span class="font-medium">Entrada:</span>
                      <span class="font-bold">{{ dia.hora_entrada_prog }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-gray-700">
                      <Icon icon="mdi:logout" width="12" height="12" class="text-red-600" />
                      <span class="font-medium">Salida:</span>
                      <span class="font-bold">{{ dia.hora_salida_prog }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div v-if="reporteGenerado" class="mt-4 pt-4 border-t border-gray-200">
            <h4 class="text-sm font-bold text-gray-700 mb-2">Resumen del Mes</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-gray-600">Días laborables:</span>
                <span class="font-bold text-gray-800">{{ resumen.diasLaborables }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-green-600">Asistencias:</span>
                <span class="font-bold text-green-700">{{ resumen.asistencias }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-yellow-600">Tardanzas:</span>
                <span class="font-bold text-yellow-700">{{ resumen.tardanzas }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-red-600">Faltas:</span>
                <span class="font-bold text-red-700">{{ resumen.faltas }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Grande: Tabla de Asistencia -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Icon icon="mdi:calendar-month" width="22" height="22" class="text-blue-600" />
              Registro de {{ obtenerNombreMes(mesSeleccionado) }}
            </h3>
          </div>

          <!-- Tabla de Asistencia Dinámica -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 sticky left-0 bg-gray-100 z-10" rowspan="2">Día</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700" rowspan="2">Fecha</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700" rowspan="2">Horarios</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700" colspan="2">Entrada</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700" colspan="2">Salida</th>
                </tr>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-2 py-1 text-center font-bold text-gray-600 text-[10px]">Prog.</th>
                  <th class="border border-gray-300 px-2 py-1 text-center font-bold text-gray-600 text-[10px]">Real</th>
                  <th class="border border-gray-300 px-2 py-1 text-center font-bold text-gray-600 text-[10px]">Prog.</th>
                  <th class="border border-gray-300 px-2 py-1 text-center font-bold text-gray-600 text-[10px]">Real</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="dia in diasDelMes" :key="dia.fecha">
                  <!-- Si tiene múltiples horarios, crear una fila por cada horario -->
                  <template v-if="dia.horarios && dia.horarios.length > 0">
                    <tr 
                      v-for="(horario, index) in dia.horarios" 
                      :key="`${dia.fecha}-${index}`"
                      :class="[
                        'hover:bg-gray-50 transition-colors',
                        dia.diaSemana === 0 ? 'bg-gray-100' : '',
                        index > 0 ? 'border-t-0' : ''
                      ]"
                    >
                      <!-- Día (solo en la primera fila) -->
                      <td 
                        v-if="index === 0"
                        :rowspan="dia.horarios.length"
                        class="border border-gray-300 px-2 py-2 text-center font-medium sticky left-0 bg-white z-10"
                      >
                        <div class="flex flex-col items-center">
                          <span class="text-xs font-bold text-gray-700">{{ dia.diaNombre }}</span>
                          <span class="text-[10px] text-gray-500">{{ dia.diaNumero }}</span>
                        </div>
                      </td>

                      <!-- Fecha (solo en la primera fila) -->
                      <td 
                        v-if="index === 0"
                        :rowspan="dia.horarios.length"
                        class="border border-gray-300 px-2 py-2 text-center text-gray-600"
                      >
                        {{ dia.fechaFormateada }}
                      </td>

                      <!-- Número de Horario -->
                      <td class="border border-gray-300 px-2 py-2 text-center">
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                          H{{ index + 1 }}
                        </span>
                      </td>

                      <!-- Entrada Programada -->
                      <td class="border border-gray-300 px-2 py-2 text-center text-gray-600 font-medium">
                        {{ horario.hora_entrada_prog }}
                      </td>

                      <!-- Entrada Real -->
                      <td 
                        class="border border-gray-300 px-2 py-2 text-center"
                        :class="[
                          calcularEstadoEntrada(horario, dia.fecha).color
                        ]"
                      >
                        <div class="flex flex-col items-center gap-1">
                          <span class="font-bold text-sm">{{ horario.asistencia?.hora_entrada_real || '-' }}</span>
                          <span 
                            :class="[
                              'px-2 py-0.5 rounded-full text-[9px] font-bold',
                              calcularEstadoEntrada(horario, dia.fecha).clase
                            ]"
                          >
                            {{ calcularEstadoEntrada(horario, dia.fecha).texto }}
                          </span>
                        </div>
                      </td>

                      <!-- Salida Programada -->
                      <td class="border border-gray-300 px-2 py-2 text-center text-gray-600 font-medium">
                        {{ horario.hora_salida_prog }}
                      </td>

                      <!-- Salida Real -->
                      <td 
                        class="border border-gray-300 px-2 py-2 text-center"
                        :class="[
                          calcularEstadoSalida(horario, dia.fecha).color
                        ]"
                      >
                        <div class="flex flex-col items-center gap-1">
                          <span class="font-bold text-sm">{{ horario.asistencia?.hora_salida_real || '-' }}</span>
                          <span 
                            v-if="horario.asistencia?.hora_salida_real || esFechaAnteriorAHoy(dia.fecha)"
                            :class="[
                              'px-2 py-0.5 rounded-full text-[9px] font-bold',
                              calcularEstadoSalida(horario, dia.fecha).clase
                            ]"
                          >
                            {{ calcularEstadoSalida(horario, dia.fecha).texto }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <!-- Si no tiene horarios (fin de semana o sin horario) -->
                  <tr 
                    v-else
                    :class="[
                      'hover:bg-gray-50 transition-colors',
                      dia.diaSemana === 0 ? 'bg-gray-100' : ''
                    ]"
                  >
                    <td class="border border-gray-300 px-2 py-2 text-center font-medium sticky left-0 bg-white z-10">
                      <div class="flex flex-col items-center">
                        <span class="text-xs font-bold text-gray-700">{{ dia.diaNombre }}</span>
                        <span class="text-[10px] text-gray-500">{{ dia.diaNumero }}</span>
                      </div>
                    </td>
                    <td class="border border-gray-300 px-2 py-2 text-center text-gray-600">
                      {{ dia.fechaFormateada }}
                    </td>
                    <td class="border border-gray-300 px-2 py-2 text-center text-gray-400 text-[10px]" colspan="5">
                      {{ dia.diaSemana === 0 ? 'Fin de semana' : 'Sin horario asignado' }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay reporte -->
    <div v-else class="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
      <Icon icon="mdi:file-chart-outline" width="64" height="64" class="mx-auto text-gray-400 mb-3" />
      <p class="text-gray-600">Selecciona una persona, periodo y mes para generar el reporte</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';

interface Persona {
  id: string;
  codigo: string;
  dni: string;
  paterno: string;
  materno: string;
  nombres: string;
}

const busquedaPersona = ref('');
const personasBuscadas = ref<Persona[]>([]);
const personaSeleccionada = ref<Persona | null>(null);
const periodos = ref<any[]>([]);
const periodoSeleccionado = ref('');
const periodoActual = ref<any>(null);
const mesSeleccionado = ref('');
const cargando = ref(false);
const reporteGenerado = ref(false);
const horarios = ref<any[]>([]);
const asistencias = ref<any[]>([]);
const diasDelMes = ref<any[]>([]);

const todosMeses = [
  { valor: '01', nombre: 'Enero' },
  { valor: '02', nombre: 'Febrero' },
  { valor: '03', nombre: 'Marzo' },
  { valor: '04', nombre: 'Abril' },
  { valor: '05', nombre: 'Mayo' },
  { valor: '06', nombre: 'Junio' },
  { valor: '07', nombre: 'Julio' },
  { valor: '08', nombre: 'Agosto' },
  { valor: '09', nombre: 'Septiembre' },
  { valor: '10', nombre: 'Octubre' },
  { valor: '11', nombre: 'Noviembre' },
  { valor: '12', nombre: 'Diciembre' }
];

// Meses filtrados según el periodo seleccionado
const meses = computed(() => {
  if (!periodoActual.value) return [];
  
  const fechaInicio = new Date(periodoActual.value.fecha_inicio);
  const fechaFin = new Date(periodoActual.value.fecha_fin);
  
  const mesInicio = fechaInicio.getMonth() + 1; // 1-12
  const mesFin = fechaFin.getMonth() + 1; // 1-12
  
  return todosMeses.filter(mes => {
    const mesNum = parseInt(mes.valor);
    return mesNum >= mesInicio && mesNum <= mesFin;
  });
});

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Agrupar horarios por fecha_inicio y fecha_fin
const horariosAgrupados = computed(() => {
  if (horarios.value.length === 0) return [];
  
  const grupos: Record<string, any> = {};
  
  horarios.value.forEach(horario => {
    const key = `${horario.fecha_inicio}_${horario.fecha_fin}`;
    
    if (!grupos[key]) {
      grupos[key] = {
        fecha_inicio: horario.fecha_inicio,
        fecha_fin: horario.fecha_fin,
        dias: []
      };
    }
    
    grupos[key].dias.push({
      dia_semana: horario.dia_semana,
      hora_entrada_prog: horario.hora_entrada_prog,
      hora_salida_prog: horario.hora_salida_prog
    });
  });
  
  // Convertir a array y ordenar días dentro de cada grupo
  return Object.values(grupos).map(grupo => ({
    ...grupo,
    dias: grupo.dias.sort((a: any, b: any) => a.dia_semana - b.dia_semana)
  }));
});

const resumen = computed(() => {
  let totalHorarios = 0;
  let entradasPuntuales = 0;
  let tardanzas = 0;
  let faltas = 0;
  let salidasAnticipadas = 0;

  diasDelMes.value.forEach(dia => {
    if (dia.horarios && dia.horarios.length > 0) {
      dia.horarios.forEach((horario: any) => {
        totalHorarios++;
        
        // Contar basándose en el estado de la BD
        if (horario.asistencia) {
          const estado = horario.asistencia.estado;
          
          if (estado === 'ASISTIO') {
            entradasPuntuales++;
          } else if (estado === 'TARDE') {
            tardanzas++;
          } else if (estado === 'FALTA') {
            faltas++;
          }
          
          // Contar salidas anticipadas
          if (horario.asistencia.hora_salida_real) {
            const estadoSalida = calcularEstadoSalida(horario, dia.fecha);
            if (estadoSalida.texto.includes('ANTICIPADA')) {
              salidasAnticipadas++;
            }
          }
        } else {
          // Si no tiene asistencia y la fecha ya pasó, contar como falta
          if (esFechaAnteriorAHoy(dia.fecha)) {
            faltas++;
          }
        }
      });
    }
  });

  return { 
    diasLaborables: totalHorarios,
    asistencias: entradasPuntuales,
    tardanzas,
    faltas,
    salidasAnticipadas
  };
});

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
  } catch (error) {
    console.error('Error al buscar personas:', error);
  }
};

const seleccionarPersona = (persona: Persona) => {
  personaSeleccionada.value = persona;
  personasBuscadas.value = [];
  busquedaPersona.value = '';
  reporteGenerado.value = false;
};

const onPeriodoChange = async () => {
  if (!periodoSeleccionado.value) {
    periodoActual.value = null;
    mesSeleccionado.value = '';
    reporteGenerado.value = false;
    return;
  }

  // Buscar el periodo seleccionado
  periodoActual.value = periodos.value.find(p => p.id === periodoSeleccionado.value);
  
  if (periodoActual.value) {
    // Seleccionar automáticamente el mes actual si está dentro del rango del periodo
    const mesActual = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const fechaInicio = new Date(periodoActual.value.fecha_inicio);
    const fechaFin = new Date(periodoActual.value.fecha_fin);
    const mesInicio = fechaInicio.getMonth() + 1;
    const mesFin = fechaFin.getMonth() + 1;
    const mesActualNum = parseInt(mesActual);
    
    if (mesActualNum >= mesInicio && mesActualNum <= mesFin) {
      mesSeleccionado.value = mesActual;
    } else {
      // Si el mes actual no está en el rango, seleccionar el primer mes disponible
      mesSeleccionado.value = mesInicio.toString().padStart(2, '0');
    }
  }
  
  reporteGenerado.value = false;
};

const cargarPeriodos = async () => {
  try {
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .eq('estado', true)
      .order('nombre', { ascending: false });

    if (error) throw error;
    periodos.value = data || [];
    
    // Seleccionar automáticamente el primer periodo (el más reciente)
    if (periodos.value.length > 0) {
      periodoSeleccionado.value = periodos.value[0].id;
      await onPeriodoChange();
    }
  } catch (error) {
    console.error('Error al cargar periodos:', error);
  }
};

const cargarReporte = async () => {
  if (!personaSeleccionada.value || !periodoSeleccionado.value || !mesSeleccionado.value) return;

  cargando.value = true;
  try {
    // Cargar horarios
    await cargarHorarios();
    
    // Cargar asistencias del mes
    await cargarAsistencias();
    
    // Generar días del mes
    generarDiasDelMes();
    
    reporteGenerado.value = true;
  } catch (error) {
    console.error('Error al cargar reporte:', error);
    alert('Error al generar el reporte');
  } finally {
    cargando.value = false;
  }
};

const cargarHorarios = async () => {
  try {
    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .eq('persona_id', personaSeleccionada.value!.id)
      .eq('periodo_id', periodoSeleccionado.value)
      .eq('estado', true);

    if (error) throw error;
    horarios.value = data || [];
  } catch (error) {
    console.error('Error al cargar horarios:', error);
    horarios.value = [];
  }
};

const cargarAsistencias = async () => {
  try {
    const anio = new Date().getFullYear();
    const fechaInicio = `${anio}-${mesSeleccionado.value}-01`;
    const ultimoDia = new Date(anio, parseInt(mesSeleccionado.value), 0).getDate();
    const fechaFin = `${anio}-${mesSeleccionado.value}-${ultimoDia}`;

    const { data, error } = await supabase
      .from('asistencia')
      .select('*')
      .eq('persona_id', personaSeleccionada.value!.id)
      .eq('periodo_id', periodoSeleccionado.value)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: true });

    if (error) throw error;
    asistencias.value = data || [];
  } catch (error) {
    console.error('Error al cargar asistencias:', error);
    asistencias.value = [];
  }
};

const generarDiasDelMes = () => {
  const anio = new Date().getFullYear();
  const mes = parseInt(mesSeleccionado.value) - 1;
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  
  const dias = [];
  
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const fecha = new Date(anio, mes, dia);
    const diaSemana = fecha.getDay();
    const fechaStr = `${anio}-${mesSeleccionado.value}-${dia.toString().padStart(2, '0')}`;
    
    // Buscar TODOS los horarios para este día de la semana
    const horariosDelDia = horarios.value.filter(h => {
      // Verificar que el día de la semana coincida
      if (h.dia_semana !== diaSemana) return false;
      
      // Verificar que la fecha esté dentro del rango del horario
      const fechaActual = new Date(fechaStr);
      const fechaInicio = new Date(h.fecha_inicio);
      const fechaFin = new Date(h.fecha_fin);
      
      return fechaActual >= fechaInicio && fechaActual <= fechaFin;
    });
    
    // Buscar TODAS las asistencias para este día
    const asistenciasDelDia = asistencias.value.filter(a => a.fecha === fechaStr);
    
    // Crear estructura de horarios con sus asistencias correspondientes
    const horariosConAsistencia = horariosDelDia.map(horario => {
      // Buscar la asistencia que corresponde a este horario
      // Comparando la hora de entrada programada con la hora de entrada real
      const asistenciaCorrespondiente = asistenciasDelDia.find(a => {
        if (!a.hora_entrada_real) return false;
        
        // Calcular diferencia en minutos entre entrada programada y real
        const [hProg, mProg] = horario.hora_entrada_prog.split(':').map(Number);
        const [hReal, mReal] = a.hora_entrada_real.split(':').map(Number);
        const minutosProg = hProg * 60 + mProg;
        const minutosReal = hReal * 60 + mReal;
        const diferencia = Math.abs(minutosReal - minutosProg);
        
        // Si la diferencia es menor a 2 horas (120 min), probablemente es el mismo horario
        return diferencia < 120;
      });
      
      return {
        hora_entrada_prog: horario.hora_entrada_prog,
        hora_salida_prog: horario.hora_salida_prog,
        asistencia: asistenciaCorrespondiente
      };
    });
    
    dias.push({
      fecha: fechaStr,
      fechaFormateada: `${dia.toString().padStart(2, '0')}/${mesSeleccionado.value}/${anio}`,
      diaNumero: dia,
      diaNombre: diasSemana[diaSemana],
      diaSemana: diaSemana,
      esFinde: diaSemana === 0,
      tieneHorario: horariosDelDia.length > 0,
      horarios: horariosConAsistencia.length > 0 ? horariosConAsistencia : null,
      observacion: ''
    });
  }
  
  diasDelMes.value = dias;
};

const obtenerNombreDia = (dia: number) => diasSemana[dia];

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Verificar si una fecha es anterior a hoy
const esFechaAnteriorAHoy = (fecha: string) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaComparar = new Date(fecha + 'T00:00:00');
  
  return fechaComparar < hoy;
};

// Calcular estado de entrada basado en el campo estado de la BD
const calcularEstadoEntrada = (horario: any, fecha: string) => {
  // Si no tiene asistencia registrada
  if (!horario.asistencia) {
    // Si la fecha ya pasó, es FALTA
    if (esFechaAnteriorAHoy(fecha)) {
      return {
        texto: 'FALTA',
        clase: 'bg-red-100 text-red-700',
        color: 'text-red-700 bg-red-50'
      };
    }
    // Si es hoy o futuro, aún no hay registro
    return {
      texto: 'SIN REGISTRO',
      clase: 'bg-gray-100 text-gray-600',
      color: 'text-gray-600'
    };
  }

  // Usar el campo estado de la base de datos
  const estado = horario.asistencia.estado;

  // Mapear estados de la BD a visualización
  switch (estado) {
    case 'ASISTIO':
      return {
        texto: 'PUNTUAL',
        clase: 'bg-green-100 text-green-700',
        color: 'text-green-700 bg-green-50'
      };
    case 'TARDE':
      // Calcular minutos de tardanza si hay horas disponibles
      if (horario.hora_entrada_prog && horario.asistencia.hora_entrada_real) {
        const [hProg, mProg] = horario.hora_entrada_prog.split(':').map(Number);
        const [hReal, mReal] = horario.asistencia.hora_entrada_real.split(':').map(Number);
        const minutosProg = hProg * 60 + mProg;
        const minutosReal = hReal * 60 + mReal;
        const minutosTarde = minutosReal - minutosProg;
        return {
          texto: `TARDE (${minutosTarde}m)`,
          clase: 'bg-yellow-100 text-yellow-700',
          color: 'text-yellow-700 bg-yellow-50'
        };
      }
      return {
        texto: 'TARDE',
        clase: 'bg-yellow-100 text-yellow-700',
        color: 'text-yellow-700 bg-yellow-50'
      };
    case 'FALTA':
      return {
        texto: 'FALTA',
        clase: 'bg-red-100 text-red-700',
        color: 'text-red-700 bg-red-50'
      };
    case 'JUSTIFICADO':
      return {
        texto: 'JUSTIFICADO',
        clase: 'bg-blue-100 text-blue-700',
        color: 'text-blue-700 bg-blue-50'
      };
    case 'PERMISO':
      return {
        texto: 'PERMISO',
        clase: 'bg-purple-100 text-purple-700',
        color: 'text-purple-700 bg-purple-50'
      };
    default:
      return {
        texto: 'SIN REGISTRO',
        clase: 'bg-gray-100 text-gray-600',
        color: 'text-gray-600'
      };
  }
};

// Calcular estado de salida
const calcularEstadoSalida = (horario: any, fecha: string) => {
  // Si no tiene asistencia registrada
  if (!horario.asistencia) {
    // Si la fecha ya pasó, es FALTA
    if (esFechaAnteriorAHoy(fecha)) {
      return {
        texto: 'FALTA',
        clase: 'bg-red-100 text-red-700',
        color: 'text-red-700 bg-red-50'
      };
    }
    return {
      texto: 'SIN REGISTRO',
      clase: 'bg-gray-100 text-gray-600',
      color: 'text-gray-600'
    };
  }

  // Si el estado es FALTA, mostrarlo
  if (horario.asistencia.estado === 'FALTA') {
    return {
      texto: 'FALTA',
      clase: 'bg-red-100 text-red-700',
      color: 'text-red-700 bg-red-50'
    };
  }

  // Si no tiene marcación de salida pero sí tiene entrada
  if (!horario.asistencia.hora_salida_real) {
    return {
      texto: 'SIN SALIDA',
      clase: 'bg-gray-100 text-gray-600',
      color: 'text-gray-600'
    };
  }

  // Si tiene salida, validar si es anticipada
  if (horario.hora_salida_prog && horario.asistencia.hora_salida_real) {
    const [hProg, mProg] = horario.hora_salida_prog.split(':').map(Number);
    const [hReal, mReal] = horario.asistencia.hora_salida_real.split(':').map(Number);
    
    const minutosProg = hProg * 60 + mProg;
    const minutosReal = hReal * 60 + mReal;
    
    const diferencia = minutosReal - minutosProg;

    // Si salió antes de tiempo (más de 15 minutos antes)
    if (diferencia < -15) {
      const minutosAntes = Math.abs(diferencia);
      return {
        texto: `SALIDA ANTICIPADA (${minutosAntes}m)`,
        clase: 'bg-orange-100 text-orange-700',
        color: 'text-orange-700 bg-orange-50'
      };
    }
  }

  // Salida normal
  return {
    texto: 'SALIDA OK',
    clase: 'bg-green-100 text-green-700',
    color: 'text-green-700 bg-green-50'
  };
};

const obtenerNombreMes = (mes: string) => {
  const mesObj = todosMeses.find(m => m.valor === mes);
  return mesObj?.nombre || '';
};

// Cargar periodos al montar
cargarPeriodos();
</script>
