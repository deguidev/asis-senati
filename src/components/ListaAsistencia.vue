<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const asistencias = ref([])

onMounted(async () => {
  const { data } = await supabase.from('asistencia').select('*').order('fecha', { ascending: false })
  asistencias.value = data || []
})
</script>

<template>
  <div class="mt-8 bg-white p-4 rounded shadow w-full max-w-2xl">
    <h2 class="text-lg font-semibold mb-3">Lista de Asistencias</h2>
    <ul>
      <li v-for="a in asistencias" :key="a.id" class="border-b py-2 text-sm">
        <strong>{{ a.nombre }}</strong> — {{ a.fecha }} — {{ a.hora_entrada }}
      </li>
    </ul>
  </div>
</template>
