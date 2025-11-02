<template>
  <div class="custom-select-wrapper">
    <v-select 
      :options="options" 
      :modelValue="modelValue" 
      @update:modelValue="emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :label="label"
      :track-by="trackBy"
      :multiple="multiple"
    ></v-select>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 1. Importar el componente JS
import vSelect from 'vue-select';

// 2. Importar los estilos CSS de Vue Select (idealmente, esto va en el archivo principal/global)
import 'vue-select/dist/vue-select.css';

// --- PROPS ---
// Define las propiedades que este componente espera recibir de su padre.
const props = defineProps({
  // options: El array de elementos que se mostrarán en el select.

   multiple: {
    type: Boolean,
    default: false, 
  },
  options: {
    type: Array,
    required: true,
  },
  // modelValue: Propiedad estándar que usa Vue 3 para v-model.
  modelValue: {
    type: [String, Number, Object, Array],
    default: null,
  },
  // placeholder: Texto que se muestra por defecto.
  placeholder: {
    type: String,
    default: 'Selecciona una opción...',
  },
  // label: Propiedad de objeto a mostrar (si options son objetos).
  label: {
    type: String,
    default: 'label', // Por defecto 'label' si no se especifica.
  },
  // trackBy: Propiedad de objeto para el seguimiento (si options son objetos).
  trackBy: {
    type: String,
    default: 'id', // Por defecto 'id' si no se especifica.
  },
  // ¡Nueva Propiedad! Indica si se permite la selección múltiple
 

});


// --- EMITS ---
// Define los eventos que este componente puede emitir.
const emit = defineEmits(['update:modelValue']);
</script>

<style>
/* NOTA IMPORTANTE: 
Para que los estilos de 'vue-select' se apliquen correctamente sin :scoped, 
a veces es mejor dejar el <style> sin scoped o añadir un selector más específico 
si tienes problemas de visibilidad. Sin embargo, en la mayoría de los casos 
funciona perfectamente si importaste el CSS globalmente o aquí.
*/
.custom-select-wrapper {
  /* Añade cualquier estilo de wrapper si es necesario */
}

/* Puedes sobrescribir estilos de vue-select aquí si es necesario */
</style>
