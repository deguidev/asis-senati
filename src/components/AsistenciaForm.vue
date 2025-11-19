<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const nombre = ref('')
const observacion = ref('')
const loading = ref(false)
const mensaje = ref('')

const marcarAsistencia = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('asistencia')
    .insert([{ nombre: nombre.value, observacion: observacion.value }])
  loading.value = false

  if (error) mensaje.value = '❌ Error al registrar asistencia'
  else mensaje.value = '✅ Asistencia registrada correctamente'
}
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4 text-gray-700">Registro de Asistencia</h2>

    <input
      v-model="nombre"
      type="text"
      placeholder="Tu nombre"
      class="border p-2 rounded w-full mb-3"
    />
    <textarea
      v-model="observacion"
      placeholder="Observación"
      class="border p-2 rounded w-full mb-3"
    ></textarea>

    <button
      @click="marcarAsistencia"
      :disabled="loading"
      class="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {{ loading ? 'Guardando...' : 'Marcar Asistencia' }}
    </button>

    <p class="mt-3 text-sm text-gray-600">{{ mensaje }}</p>
  </div>
</template>
