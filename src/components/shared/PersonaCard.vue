<template>
  <div class="flex items-center gap-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-5 rounded-xl shadow-xl">
    <div class="flex items-center justify-center w-20 h-20 text-5xl bg-white/20 rounded-full">
      👤
    </div>
    <div>
      <h3 class="text-2xl font-bold mb-2">{{ persona.nombres }} {{ persona.paterno }} {{ persona.materno }}</h3>
      <div class="flex gap-5 text-sm opacity-95">
        <span><strong>DNI:</strong> {{ persona.dni }}</span>
        <span><strong>Código:</strong> {{ persona.codigo }}</span>
        <span><strong>Tipo:</strong> {{ persona.tipo_persona }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  persona: {
    type: Object,
    required: true
  }
});
</script>

