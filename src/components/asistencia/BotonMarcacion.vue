<template>
  <div class="mb-5">
    <!-- Tabla de Horarios Semanales -->
    <div v-if="horarioSemanal.length > 0" class="mb-4 bg-white rounded-lg shadow-md p-3 md:p-4 border border-gray-200">
      <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Icon icon="mdi:calendar-clock" width="18" height="18" class="text-blue-600" />
        Tu Horario de Hoy
      </h3>
      
      <!-- Grid responsivo: 2 filas en móvil (4+3), 1 fila en desktop (7) -->
      <div class="space-y-1.5 md:space-y-0">
        <!-- Primera fila: 4 días en móvil, 7 en desktop -->
        <div class="grid grid-cols-4 md:grid-cols-7 gap-1.5 md:gap-2 text-xs">
          <div 
            v-for="dia in diasSemana.slice(0, 4)" 
            :key="dia.valor"
            :class="[
              'text-center p-2 md:p-2.5 rounded-lg border-2 transition-all',
              diaActual === dia.valor
                ? 'bg-blue-50 border-blue-500 font-bold text-blue-700 shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            ]"
          >
            <div class="font-semibold mb-1 text-[10px] md:text-xs">{{ dia.abrev }}</div>
            <div v-if="horariosPorDia[dia.valor]" class="space-y-1">
              <div 
                v-for="(bloque, idx) in horariosPorDia[dia.valor]" 
                :key="idx"
                class="text-[8px] md:text-[10px] bg-white rounded px-0.5 md:px-1 py-0.5 border border-gray-300 leading-tight"
              >
                {{ bloque.entrada }}<br class="md:hidden">-{{ bloque.salida }}
              </div>
            </div>
            <div v-else class="text-[9px] md:text-[10px] text-gray-400">-</div>
          </div>
          
          <!-- Últimos 3 días solo en desktop -->
          <div 
            v-for="dia in diasSemana.slice(4)" 
            :key="dia.valor"
            :class="[
              'hidden md:block text-center p-2.5 rounded-lg border-2 transition-all',
              diaActual === dia.valor
                ? 'bg-blue-50 border-blue-500 font-bold text-blue-700 shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            ]"
          >
            <div class="font-semibold mb-1 text-xs">{{ dia.abrev }}</div>
            <div v-if="horariosPorDia[dia.valor]" class="space-y-1">
              <div 
                v-for="(bloque, idx) in horariosPorDia[dia.valor]" 
                :key="idx"
                class="text-[10px] bg-white rounded px-1 py-0.5 border border-gray-300"
              >
                {{ bloque.entrada }}-{{ bloque.salida }}
              </div>
            </div>
            <div v-else class="text-[10px] text-gray-400">-</div>
          </div>
        </div>
        
        <!-- Segunda fila: 3 días solo en móvil -->
        <div class="grid grid-cols-3 gap-1.5 text-xs md:hidden">
          <div 
            v-for="dia in diasSemana.slice(4)" 
            :key="dia.valor"
            :class="[
              'text-center p-2 rounded-lg border-2 transition-all',
              diaActual === dia.valor
                ? 'bg-blue-50 border-blue-500 font-bold text-blue-700 shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            ]"
          >
            <div class="font-semibold mb-1 text-[10px]">{{ dia.abrev }}</div>
            <div v-if="horariosPorDia[dia.valor]" class="space-y-1">
              <div 
                v-for="(bloque, idx) in horariosPorDia[dia.valor]" 
                :key="idx"
                class="text-[8px] bg-white rounded px-0.5 py-0.5 border border-gray-300 leading-tight"
              >
                {{ bloque.entrada }}<br>-{{ bloque.salida }}
              </div>
            </div>
            <div v-else class="text-[9px] text-gray-400">-</div>
          </div>
        </div>
      </div>

      <!-- Horario de Hoy Destacado -->
      <div v-if="horariosHoy.length > 0" class="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-600 mb-1">Horario de Hoy:</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(bloque, idx) in horariosHoy" 
                :key="idx"
                class="px-2 py-1 bg-white rounded-md text-sm font-bold text-blue-700 border border-blue-300"
              >
                {{ bloque.entrada }} - {{ bloque.salida }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-600">Tolerancia</p>
            <p class="text-lg font-bold text-orange-600">{{ toleranciaMinutos }} min</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de Marcación -->
    <button
      v-if="mostrarBoton" 
      @click="registrarMarcacion" 
      :disabled="cargando"
      class="w-full px-6 py-6 text-xl font-bold rounded-xl cursor-pointer flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:-translate-y-1 hover:shadow-xl"
    >
      <Icon 
        v-if="!cargando"
        icon="mdi:login"
        class="text-white animate-pulse"
        width="32" 
        height="32" 
      />
      <Icon 
        v-else
        icon="mdi:loading" 
        class="animate-spin text-white"
        width="32" 
        height="32" 
      />
      <span class="text-xl">
        {{ cargando ? 'Registrando...' : 'Marcar ENTRADA' }}
      </span>
    </button>

    <!-- Mensaje de feedback -->
    <AlertMessage 
      v-if="mensaje"
      :message="mensaje"
      :type="tipoMensaje"
      @close="mensaje = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { Icon } from '@iconify/vue';
import AlertMessage from '@/components/shared/AlertMessage.vue';
import { getFechaActual, getHoraActual, getDiaSemanaActual } from '@/lib/dateUtils';

interface BloqueHorario {
  entrada: string;
  salida: string;
}

const props = defineProps({
  personaId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['marcacion-exitosa']);

const cargando = ref(false);
const mensaje = ref('');
const tipoMensaje = ref<'success' | 'error'>('success');
const mostrarBoton = ref(true);
const horarioSemanal = ref<any[]>([]);
const toleranciaMinutos = ref(5); // Default 5 minutos
const diaActual = ref(getDiaSemanaActual());

const diasSemana = [
  { valor: 1, nombre: 'Lunes', abrev: 'Lun' },
  { valor: 2, nombre: 'Martes', abrev: 'Mar' },
  { valor: 3, nombre: 'Miércoles', abrev: 'Mié' },
  { valor: 4, nombre: 'Jueves', abrev: 'Jue' },
  { valor: 5, nombre: 'Viernes', abrev: 'Vie' },
  { valor: 6, nombre: 'Sábado', abrev: 'Sáb' },
  { valor: 0, nombre: 'Domingo', abrev: 'Dom' }
];

// Agrupar horarios por día
const horariosPorDia = computed(() => {
  const agrupado: Record<number, BloqueHorario[]> = {};
  
  horarioSemanal.value.forEach(h => {
    if (!agrupado[h.dia_semana]) {
      agrupado[h.dia_semana] = [];
    }
    agrupado[h.dia_semana].push({
      entrada: h.hora_entrada_prog.substring(0, 5),
      salida: h.hora_salida_prog.substring(0, 5)
    });
  });
  
  return agrupado;
});

// Horarios del día actual
const horariosHoy = computed(() => {
  return horariosPorDia.value[diaActual.value] || [];
});

onMounted(async () => {
  await cargarConfiguracion();
  await cargarHorarios();
  await verificarEstadoBoton();
});

watch(() => props.personaId, async () => {
  await cargarHorarios();
  await verificarEstadoBoton();
});

const cargarConfiguracion = async () => {
  try {
    const { data, error } = await supabase
      .from('config_asistencia')
      .select('minutos_tolerancia')
      .single();

    if (error) throw error;
    
    if (data && data.minutos_tolerancia) {
      toleranciaMinutos.value = data.minutos_tolerancia;
    }
  } catch (error) {
    console.log('Usando tolerancia por defecto: 5 minutos');
    toleranciaMinutos.value = 5;
  }
};

const cargarHorarios = async () => {
  try {
    const hoy = getFechaActual(); // Usar timezone de Lima
    
    const { data: periodoActivo } = await supabase
      .from('periodos')
      .select('id')
      .eq('estado', true)
      .single();

    if (!periodoActivo) return;

    // Obtener horarios que aplican para la fecha actual
    const { data: horarios, error } = await supabase
      .from('horarios')
      .select('*')
      .eq('persona_id', props.personaId)
      .eq('periodo_id', periodoActivo.id)
      .lte('fecha_inicio', hoy)
      .gte('fecha_fin', hoy)
      .eq('estado', true);

    if (error) throw error;
    
    horarioSemanal.value = horarios || [];
  } catch (error) {
    console.error('Error al cargar horarios:', error);
    horarioSemanal.value = [];
  }
};

const verificarEstadoBoton = async () => {
  try {
    const hoy = getFechaActual(); // Usar timezone de Lima
    
    const { data: periodoActivo } = await supabase
      .from('periodos')
      .select('id')
      .eq('estado', true)
      .single();

    if (!periodoActivo) {
      mostrarBoton.value = true;
      return;
    }

    // Verificar si hay una entrada sin salida
    const { data: entradaPendiente } = await supabase
      .from('asistencia')
      .select('*')
      .eq('persona_id', props.personaId)
      .eq('periodo_id', periodoActivo.id)
      .eq('fecha', hoy)
      .is('hora_salida_real', null)
      .single();

    // Si hay entrada sin salida, ocultar botón
    mostrarBoton.value = !entradaPendiente;
  } catch (error) {
    // Si no hay registros, mostrar botón
    mostrarBoton.value = true;
  }
};

const calcularEstadoAsistencia = (horaReal: string, horaProgEntrada: string): string => {
  const [hReal, mReal] = horaReal.split(':').map(Number);
  const [hProg, mProg] = horaProgEntrada.split(':').map(Number);
  
  const minutosReales = hReal * 60 + mReal;
  const minutosProgramados = hProg * 60 + mProg;
  const diferencia = minutosReales - minutosProgramados;

  if (diferencia <= 0) {
    return 'PUNTUAL';
  } else if (diferencia <= toleranciaMinutos.value) {
    return 'PUNTUAL'; // Dentro de la tolerancia
  } else if (diferencia <= 30) {
    return 'TARDE';
  } else {
    return 'FALTA';
  }
};

const registrarMarcacion = async () => {
  cargando.value = true;
  mensaje.value = '';

  try {
    const fecha = getFechaActual(); // Usar timezone de Lima
    const hora = getHoraActual(); // Usar timezone de Lima
    const diaSemana = getDiaSemanaActual(); // Usar timezone de Lima

    // Obtener el período activo
    const { data: periodoActivo } = await supabase
      .from('periodos')
      .select('id')
      .eq('estado', true)
      .single();

    if (!periodoActivo) {
      throw new Error('No hay período activo configurado');
    }

    // Verificar si tiene horario para hoy
    const horariosDelDia = horarioSemanal.value.filter(h => h.dia_semana === diaSemana);

    // Determinar estado de asistencia
    let estadoAsistencia = 'ASISTIO';
    let mensajeResultado = '✓ Entrada registrada correctamente';
    
    if (horariosDelDia.length > 0) {
      // CON HORARIO: Validar contra el horario más cercano
      const [hActual, mActual] = hora.split(':').map(Number);
      const minutosActuales = hActual * 60 + mActual;

      // Encontrar el bloque de horario más cercano
      let bloqueSeleccionado = horariosDelDia[0];
      let menorDiferencia = Infinity;

      horariosDelDia.forEach(horario => {
        const [hProg, mProg] = horario.hora_entrada_prog.split(':').map(Number);
        const minutosProg = hProg * 60 + mProg;
        const diferencia = Math.abs(minutosActuales - minutosProg);
        
        if (diferencia < menorDiferencia) {
          menorDiferencia = diferencia;
          bloqueSeleccionado = horario;
        }
      });

      // Calcular estado de asistencia
      estadoAsistencia = calcularEstadoAsistencia(hora, bloqueSeleccionado.hora_entrada_prog);
      
      // Mensajes según el estado
      const mensajes = {
        'PUNTUAL': '✓ ¡Excelente! Llegaste puntual 🎉',
        'TARDE': '⚠️ Llegaste tarde, pero dentro del margen',
        'FALTA': '❌ Llegaste muy tarde, se registra como falta',
        'ASISTIO': '✓ Entrada registrada correctamente'
      };
      
      mensajeResultado = mensajes[estadoAsistencia as keyof typeof mensajes];
    } else {
      mensajeResultado = '✓ Entrada registrada (sin horario programado)';
    }

    // Registrar asistencia (mismo formato para todos los casos)
    const { error } = await supabase
      .from('asistencia')
      .insert({
        persona_id: props.personaId,
        periodo_id: periodoActivo.id,
        fecha: fecha,
        hora_entrada_real: hora,
        tipo: 'ENTRADA',
        estado: estadoAsistencia
      });

    if (error) throw error;
    
    mensaje.value = mensajeResultado;
    tipoMensaje.value = estadoAsistencia === 'FALTA' ? 'error' : 'success';
    
    // Ocultar el botón después de registrar entrada
    mostrarBoton.value = false;

    emit('marcacion-exitosa');
  } catch (error: any) {
    console.error('Error al registrar marcación:', error);
    mensaje.value = `✕ Error: ${error.message}`;
    tipoMensaje.value = 'error';
  } finally {
    cargando.value = false;
  }
};

// Exponer método para que el padre pueda actualizar el estado
defineExpose({
  verificarEstadoBoton
});
</script>

