<template>
  <header v-if="isAuthenticated" class="sticky top-0 z-50 px-5 pt-5">
    <nav class="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl shadow-lg border border-gray-200 rounded-2xl">
      <div class="flex items-center justify-between h-20 px-6">
        <!-- Título -->
        <div class="flex items-center gap-3">
          <div>
            <h1 class="text-lg font-bold text-gray-800">Sistema de Asistencia</h1>
            <p class="text-xs text-blue-600">SENATI - Control y Gestión</p>
          </div>
        </div>

        <!-- Navegación Desktop -->
        <div class="hidden md:flex items-center gap-2">
          <!-- Asistencia -->
          <a href="/" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
            <Icon icon="mdi:calendar-check" width="20" height="20" />
            <span class="text-sm font-medium">Asistencia</span>
          </a>

          <!-- Gestión (con submenú) -->
          <div class="relative" ref="menuGestionRef">
            <button 
              @click="menuGestionAbierto = !menuGestionAbierto"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700"
            >
              <Icon icon="mdi:cog" width="20" height="20" />
              <span class="text-sm font-medium">Gestión</span>
              <Icon icon="mdi:chevron-down" width="16" height="16" />
            </button>

            <!-- Dropdown Gestión -->
            <div 
              v-if="menuGestionAbierto"
              class="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
            >
              <a href="/gestion/personas" @click="menuGestionAbierto = false" class="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
                <Icon icon="mdi:account-group" width="18" height="18" />
                <span class="text-sm">Personas</span>
              </a>
              <a href="/gestion/llaves" @click="menuGestionAbierto = false" class="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
                <Icon icon="mdi:key" width="18" height="18" />
                <span class="text-sm">Llaves</span>
              </a>
              <a href="/gestion/periodos" @click="menuGestionAbierto = false" class="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
                <Icon icon="mdi:calendar-range" width="18" height="18" />
                <span class="text-sm">Periodos</span>
              </a>
              <a href="/gestion/horarios" @click="menuGestionAbierto = false" class="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
                <Icon icon="mdi:clock-outline" width="18" height="18" />
                <span class="text-sm">Horarios</span>
              </a>
              <div class="border-t border-gray-200 my-1"></div>
              <a href="/gestion/configuracion" @click="menuGestionAbierto = false" class="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
                <Icon icon="mdi:cog-outline" width="18" height="18" />
                <span class="text-sm">Configuración</span>
              </a>
            </div>
          </div>

          <!-- Reportes (con submenú) -->
          <div class="relative" ref="menuReportesRef">
            <button 
              @click="menuReportesAbierto = !menuReportesAbierto"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700"
            >
              <Icon icon="mdi:chart-box" width="20" height="20" />
              <span class="text-sm font-medium">Reportes</span>
              <Icon icon="mdi:chevron-down" width="16" height="16" />
            </button>

            <!-- Dropdown Reportes -->
            <div 
              v-if="menuReportesAbierto"
              class="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
            >
              <a href="/reportes/asistencia" @click="menuReportesAbierto = false" class="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
                <Icon icon="mdi:calendar-check" width="18" height="18" />
                <span class="text-sm">Asistencia</span>
              </a>
            </div>
          </div>

          <!-- Menú de Usuario Desktop -->
          <div class="relative ml-2" ref="menuUsuarioRef">
            <button 
              @click="menuUsuarioAbierto = !menuUsuarioAbierto"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
            >
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {{ iniciales }}
              </div>
              <Icon icon="mdi:chevron-down" width="20" height="20" />
            </button>

            <!-- Dropdown Usuario -->
            <div 
              v-if="menuUsuarioAbierto"
              class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200">
                <p class="text-sm font-semibold text-gray-800">{{ user?.user_metadata?.full_name || 'Usuario' }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
              </div>
              <button 
                @click="cerrarSesion"
                :disabled="cerrandoSesion"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon 
                  :icon="cerrandoSesion ? 'mdi:loading' : 'mdi:logout'" 
                  width="20" 
                  height="20"
                  :class="{ 'animate-spin': cerrandoSesion }"
                />
                <span>{{ cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar Sesión' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón Menú Mobile -->
        <button 
          @click="menuAbierto = !menuAbierto"
          class="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700"
        >
          <Icon :icon="menuAbierto ? 'mdi:close' : 'mdi:menu'" width="24" height="24" />
        </button>
      </div>

      <!-- Menú Mobile -->
      <div 
        v-if="menuAbierto"
        class="md:hidden py-4 border-t border-gray-200"
      >
        <div class="flex flex-col gap-2 px-2">
          <!-- Info Usuario Mobile -->
          <div class="px-4 py-3 bg-blue-50 rounded-lg mb-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {{ iniciales }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">{{ user?.user_metadata?.full_name || 'Usuario' }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
              </div>
            </div>
          </div>

          <!-- Asistencia -->
          <a href="/" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700">
            <Icon icon="mdi:calendar-check" width="20" height="20" />
            <span class="font-medium">Asistencia</span>
          </a>

          <!-- Gestión (con submenú) -->
          <div>
            <button 
              @click="menuGestionMovilAbierto = !menuGestionMovilAbierto"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700"
            >
              <div class="flex items-center gap-3">
                <Icon icon="mdi:cog" width="20" height="20" />
                <span class="font-medium">Gestión</span>
              </div>
              <Icon 
                :icon="menuGestionMovilAbierto ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                width="20" 
                height="20" 
              />
            </button>
            
            <!-- Submenú Gestión Mobile -->
            <div v-if="menuGestionMovilAbierto" class="ml-4 mt-1 space-y-1">
              <a href="/gestion/personas" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-700">
                <Icon icon="mdi:account-group" width="18" height="18" />
                <span class="text-sm">Personas</span>
              </a>
              <a href="/gestion/llaves" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-700">
                <Icon icon="mdi:key" width="18" height="18" />
                <span class="text-sm">Llaves</span>
              </a>
              <a href="/gestion/periodos" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-700">
                <Icon icon="mdi:calendar-range" width="18" height="18" />
                <span class="text-sm">Periodos</span>
              </a>
              <a href="/gestion/horarios" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-700">
                <Icon icon="mdi:clock-outline" width="18" height="18" />
                <span class="text-sm">Horarios</span>
              </a>
              <div class="border-t border-gray-200 my-1 mx-4"></div>
              <a href="/gestion/configuracion" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-700">
                <Icon icon="mdi:cog-outline" width="18" height="18" />
                <span class="text-sm">Configuración</span>
              </a>
            </div>
          </div>

          <!-- Reportes (con submenú) -->
          <div>
            <button 
              @click="menuReportesMovilAbierto = !menuReportesMovilAbierto"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 hover:text-blue-700"
            >
              <div class="flex items-center gap-3">
                <Icon icon="mdi:chart-box" width="20" height="20" />
                <span class="font-medium">Reportes</span>
              </div>
              <Icon 
                :icon="menuReportesMovilAbierto ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                width="20" 
                height="20" 
              />
            </button>
            
            <!-- Submenú Reportes Mobile -->
            <div v-if="menuReportesMovilAbierto" class="ml-4 mt-1 space-y-1">
              <a href="/reportes/asistencia" @click="menuAbierto = false" class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-700">
                <Icon icon="mdi:calendar-check" width="18" height="18" />
                <span class="text-sm">Asistencia</span>
              </a>
            </div>
          </div>

          <!-- Cerrar Sesión Mobile -->
          <button 
            @click="cerrarSesion"
            :disabled="cerrandoSesion"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon 
              :icon="cerrandoSesion ? 'mdi:loading' : 'mdi:logout'" 
              width="20" 
              height="20"
              :class="{ 'animate-spin': cerrandoSesion }"
            />
            <span>{{ cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar Sesión' }}</span>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useAuth } from '@/composables/useAuth';

// Usar el estado de autenticación del composable
const { isAuthenticated, user, signOut } = useAuth();

const menuAbierto = ref(false);
const menuUsuarioAbierto = ref(false);
const menuGestionAbierto = ref(false);
const menuGestionMovilAbierto = ref(false);
const menuReportesAbierto = ref(false);
const menuReportesMovilAbierto = ref(false);
const cerrandoSesion = ref(false);

// Refs para detectar clicks fuera
const menuGestionRef = ref<HTMLElement | null>(null);
const menuUsuarioRef = ref<HTMLElement | null>(null);
const menuReportesRef = ref<HTMLElement | null>(null);

// Obtener iniciales del nombre del usuario
const iniciales = computed(() => {
  if (user.value?.user_metadata?.full_name) {
    const nombres = user.value.user_metadata.full_name.split(' ');
    return nombres.length >= 2 
      ? `${nombres[0][0]}${nombres[1][0]}`.toUpperCase()
      : nombres[0][0].toUpperCase();
  }
  if (user.value?.email) {
    return user.value.email[0].toUpperCase();
  }
  return 'U';
});

const cerrarSesion = async () => {
  cerrandoSesion.value = true;
  try {
    await signOut();
    menuUsuarioAbierto.value = false;
    menuAbierto.value = false;
    // Redirigir a la página principal
    window.location.href = '/';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    cerrandoSesion.value = false;
  }
};

// Cerrar dropdowns al hacer click fuera
const handleClickOutside = (event: MouseEvent) => {
  // Cerrar menú de gestión
  if (menuGestionRef.value && !menuGestionRef.value.contains(event.target as Node)) {
    menuGestionAbierto.value = false;
  }
  
  // Cerrar menú de usuario
  if (menuUsuarioRef.value && !menuUsuarioRef.value.contains(event.target as Node)) {
    menuUsuarioAbierto.value = false;
  }
  
  // Cerrar menú de reportes
  if (menuReportesRef.value && !menuReportesRef.value.contains(event.target as Node)) {
    menuReportesAbierto.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
