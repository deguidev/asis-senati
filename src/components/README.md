# 📁 Estructura de Componentes - Sistema de Asistencia y Llaves

## 🎯 Visión General

Sistema intuitivo para registro de asistencia y control de llaves en una sola vista. Diseñado para ser usado por docentes sin experiencia técnica.

## 📂 Estructura de Carpetas

```
components/
├── registro/              # Vista principal del sistema
│   └── RegistroMain.vue  # Contenedor principal con layout de 2 columnas
│
├── busqueda/              # Búsqueda de personas
│   └── BuscadorPersona.vue
│
├── asistencia/            # Gestión de asistencia (Columna izquierda)
│   ├── BotonMarcacion.vue
│   └── HistorialAsistencia.vue
│
├── llaves/                # Gestión de llaves (Columna derecha)
│   ├── TableroDeLlaves.vue
│   ├── BotonLlave.vue
│   └── HistorialLlaves.vue
│
└── shared/                # Componentes reutilizables
    ├── PersonaCard.vue
    └── AlertMessage.vue
```

## 🔄 Flujo de Usuario

### 1️⃣ Búsqueda
- El docente ingresa su **DNI** o **código**
- El sistema busca y muestra resultados en tiempo real
- Al seleccionar, se muestra la información del docente

### 2️⃣ Registro de Asistencia (Columna Izquierda)
- **Botón inteligente** que detecta automáticamente:
  - Primera vez del día → **ENTRADA** 🟢
  - Ya tiene entrada → **SALIDA** 🔴
  - Ya tiene salida → **ENTRADA** nuevamente 🟢
- Historial del día actual con todas las marcaciones

### 3️⃣ Registro de Llaves (Columna Derecha)
- **Tablero visual** de llaves organizadas por pabellón
- Filtros por pabellón (A, B, C, etc.)
- Estados visuales:
  - 🔓 **Disponible** (puede retirar)
  - 🔒 **Ocupada** (alguien la tiene)
- **Botón inteligente** que detecta:
  - No tiene la llave → **RETIRO** 🔑
  - Ya la retiró → **DEVOLUCIÓN** ✅
- Historial del día con movimientos de llaves

## 🎨 Componentes Principales

### `RegistroMain.vue`
**Responsabilidad:** Contenedor principal que orquesta todo el sistema
- Layout de 2 columnas responsivo
- Gestiona el estado de la persona seleccionada
- Coordina la comunicación entre componentes

### `BuscadorPersona.vue`
**Responsabilidad:** Búsqueda y selección de personas
- Búsqueda por DNI o código
- Resultados en tiempo real
- Validación de personas activas

### `BotonMarcacion.vue`
**Responsabilidad:** Registro de entrada/salida
- Lógica automática de tipo de marcación
- Integración con tabla `asistencia`
- Feedback visual inmediato

### `HistorialAsistencia.vue`
**Responsabilidad:** Mostrar marcaciones del día
- Lista cronológica de entradas/salidas
- Solo registros del día actual
- Actualización automática

### `TableroDeLlaves.vue`
**Responsabilidad:** Visualización de llaves disponibles
- Grid visual de llaves
- Filtros por pabellón
- Estados en tiempo real (disponible/ocupada)

### `BotonLlave.vue`
**Responsabilidad:** Registro de retiro/devolución
- Lógica automática de tipo de movimiento
- Integración con tabla `registro_llaves`
- Validación de estado de llave

### `HistorialLlaves.vue`
**Responsabilidad:** Mostrar movimientos de llaves del día
- Lista de retiros y devoluciones
- Indicador de llaves pendientes de devolución
- Solo registros del día actual

## 🗄️ Integración con Base de Datos

### Tablas Principales Utilizadas

#### `personas`
- Búsqueda por DNI/código
- Información del docente

#### `periodos`
- Obtener período activo
- Validación de registros

#### `asistencia`
- Registro de entradas/salidas
- Historial del día
- Campo `tipo`: 'ENTRADA' | 'SALIDA'

#### `llaves`
- Listado de llaves disponibles
- Organización por pabellón/nivel

#### `registro_llaves`
- Registro de retiros/devoluciones
- Estado de ocupación
- Campo `tipo`: 'RETIRO' | 'DEVOLUCION'
- Campo `estado`: true (retirada) | false (devuelta)

## 🎯 Características Clave

### ✅ Intuitivo
- Todo en una sola pantalla
- Botones grandes y claros
- Feedback visual inmediato

### ✅ Automático
- Detecta automáticamente el tipo de marcación
- No requiere que el usuario elija entre entrada/salida
- Valida estados en tiempo real

### ✅ Visual
- Tablero de llaves con colores
- Historial organizado cronológicamente
- Estados claros (disponible/ocupada, pendiente/devuelta)

### ✅ Seguro
- Validación de período activo
- Control de estados de llaves
- Manejo de errores con mensajes claros

## 🚀 Uso del Componente Principal

```vue
<!-- En tu página principal (index.astro o similar) -->
<template>
  <RegistroMain />
</template>

<script setup>
import RegistroMain from '@/components/registro/RegistroMain.vue';
</script>
```

## 📝 Notas Importantes

1. **Período Activo:** El sistema requiere que haya un período activo en la tabla `periodos`
2. **Supabase Client:** Todos los componentes usan `@/lib/supabaseClient`
3. **Responsivo:** El layout se adapta a pantallas pequeñas (columnas apiladas)
4. **Tiempo Real:** Los historiales se actualizan automáticamente después de cada acción

## 🔧 Próximos Pasos

- [ ] Agregar validación de horarios programados
- [ ] Implementar notificaciones de tardanza
- [ ] Agregar reportes y estadísticas
- [ ] Implementar permisos y justificaciones
