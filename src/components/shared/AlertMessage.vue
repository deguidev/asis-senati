<template>
  <div v-if="visible" :class="[
    'flex items-center gap-3 px-5 py-4 rounded-lg mb-4 animate-slide-in',
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : '',
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' : '',
    type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : '',
    type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''
  ]">
    <span class="text-2xl font-bold">{{ icon }}</span>
    <span class="flex-1 text-base">{{ message }}</span>
    <button @click="cerrar" class="text-xl opacity-70 hover:opacity-100 transition-opacity">✕</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success', // success, error, warning, info
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const emit = defineEmits(['close']);

const visible = ref(true);

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[props.type] || icons.info;
});

const cerrar = () => {
  visible.value = false;
  emit('close');
};

// Auto-cerrar después de la duración especificada
if (props.duration > 0) {
  setTimeout(() => {
    cerrar();
  }, props.duration);
}
</script>

<style>
@keyframes slide-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
