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
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Icon icon="mdi:calendar-month" width="22" height="22" class="text-blue-600" />
              Registro de {{ obtenerNombreMes(mesSeleccionado) }}
            </h3>
            <button
              @click="exportarExcel"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Icon icon="mdi:file-excel" width="18" height="18" />
              Exportar
            </button>
          </div>

          <!-- Tabla de Asistencia -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 sticky left-0 bg-gray-100 z-10">Día</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Fecha</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Estado</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Entrada Prog.</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Entrada Real</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Salida Prog.</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Salida Real</th>
                  <th class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="dia in diasDelMes" 
                  :key="dia.fecha"
                  :class="[
                    'hover:bg-gray-50 transition-colors',
                    dia.esFinde ? 'bg-gray-100' : ''
                  ]"
                >
                  <!-- Día -->
                  <td class="border border-gray-300 px-2 py-2 text-center font-medium sticky left-0 bg-white z-10">
                    <div class="flex flex-col items-center">
                      <span class="text-xs font-bold text-gray-700">{{ dia.diaNombre }}</span>
                      <span class="text-[10px] text-gray-500">{{ dia.diaNumero }}</span>
                    </div>
                  </td>

                  <!-- Fecha -->
                  <td class="border border-gray-300 px-2 py-2 text-center text-gray-600">
                    {{ dia.fechaFormateada }}
                  </td>

                  <!-- Estado -->
                  <td class="border border-gray-300 px-2 py-2 text-center">
                    <span 
                      v-if="dia.asistencia"
                      :class="[
                        'px-2 py-1 rounded-full text-[10px] font-bold',
                        dia.asistencia.estado === 'ASISTIO' ? 'bg-green-100 text-green-700' :
                        dia.asistencia.estado === 'TARDE' ? 'bg-yellow-100 text-yellow-700' :
                        dia.asistencia.estado === 'FALTA' ? 'bg-red-100 text-red-700' :
                        dia.asistencia.estado === 'JUSTIFICADO' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      ]"
                    >
                      {{ dia.asistencia.estado === 'ASISTIO' ? 'PUNTUAL' : dia.asistencia.estado }}
                    </span>
                    <span v-else-if="dia.esFinde" class="text-gray-400 text-[10px]">-</span>
                    <span v-else-if="!dia.tieneHorario" class="text-gray-400 text-[10px]">Sin horario</span>
                    <span v-else class="text-red-400 text-[10px] font-bold">SIN REGISTRO</span>
                  </td>

                  <!-- Entrada Programada -->
                  <td class="border border-gray-300 px-2 py-2 text-center text-gray-600">
                    {{ dia.horario?.hora_entrada_prog || '-' }}
                  </td>

                  <!-- Entrada Real -->
                  <td 
                    class="border border-gray-300 px-2 py-2 text-center font-bold"
                    :class="[
                      dia.asistencia?.estado === 'ASISTIO' ? 'text-green-700' :
                      dia.asistencia?.estado === 'TARDE' ? 'text-yellow-700' :
                      dia.asistencia?.estado === 'FALTA' ? 'text-red-700' :
                      'text-gray-600'
                    ]"
                  >
                    {{ dia.asistencia?.hora_entrada_real || '-' }}
                  </td>

                  <!-- Salida Programada -->
                  <td class="border border-gray-300 px-2 py-2 text-center text-gray-600">
                    {{ dia.horario?.hora_salida_prog || '-' }}
                  </td>

                  <!-- Salida Real -->
                  <td class="border border-gray-300 px-2 py-2 text-center font-bold text-gray-700">
                    {{ dia.asistencia?.hora_salida_real || '-' }}
                  </td>

                  <!-- Observación -->
                  <td class="border border-gray-300 px-2 py-2 text-center text-gray-500 text-[10px]">
                    {{ dia.observacion || '-' }}
                  </td>
                </tr>
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
  const diasLaborables = diasDelMes.value.filter(d => !d.esFinde && d.tieneHorario).length;
  const asistencias = diasDelMes.value.filter(d => d.asistencia?.estado === 'ASISTIO').length;
  const tardanzas = diasDelMes.value.filter(d => d.asistencia?.estado === 'TARDE').length;
  const faltas = diasDelMes.value.filter(d => !d.asistencia && !d.esFinde && d.tieneHorario).length;

  return { diasLaborables, asistencias, tardanzas, faltas };
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
    
    // Buscar horario para este día
    const horario = horarios.value.find(h => h.dia_semana === diaSemana);
    
    // Buscar asistencia para este día
    const asistencia = asistencias.value.find(a => a.fecha === fechaStr);
    
    dias.push({
      fecha: fechaStr,
      fechaFormateada: `${dia.toString().padStart(2, '0')}/${mesSeleccionado.value}/${anio}`,
      diaNumero: dia,
      diaNombre: diasSemana[diaSemana],
      diaSemana: diaSemana,
      esFinde: diaSemana === 0 || diaSemana === 6,
      tieneHorario: !!horario,
      horario: horario,
      asistencia: asistencia,
      observacion: asistencia ? '' : (!horario ? 'Sin horario' : (diaSemana === 0 || diaSemana === 6) ? 'Fin de semana' : '')
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

const obtenerNombreMes = (mes: string) => {
  const mesObj = todosMeses.find(m => m.valor === mes);
  return mesObj?.nombre || '';
};

const exportarExcel = () => {
  alert('Función de exportar a Excel en desarrollo');
};

// Cargar periodos al montar
cargarPeriodos();
</script>
