<template>
  <div v-if="showForm">
    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" style="z-index: 1050;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Editar Bien' : 'Nuevo Bien' }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeForm"></button>
          </div>

          <div class="modal-body">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div class="row g-3">
              <!-- Interruptor para modo lote -->
              <div class="col-12">
                <label class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" v-model="esModoLote">
                  <span class="form-check-label">Registrar por lote</span>
                </label>
              </div>

              <!-- Campos condicionales -->
              <div v-if="esModoLote" class="col-md-4">
                <label class="form-label">Cantidad a registrar *</label>
                <input v-model.number="lote.cantidad" type="number" class="form-control" placeholder="Ej: 50" />
              </div>
              <div v-if="!esModoLote" class="col-md-4">
                <label class="form-label">Serial del Bien *</label>
                <input v-model="form.serial_bien" class="form-control" placeholder="Ingrese serial del bien" />
              </div>
              <div v-if="!esModoLote" class="col-md-4">
                <label class="form-label">Serial del Equipo</label>
                <input v-model="form.serial_equipo" class="form-control" placeholder="Ingrese serial del equipo" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Color</label>
                <SelectVue
                  v-model="form.color"
                  :options="bienesStore.catalogs.colores"
                  placeholder="Selecciona un color"
                  label="descripcion"
                  track-by="id"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Tipo de Bien *</label>
                <SelectVue
                  v-model="form.tipo_bien_id"
                  :options="bienesStore.catalogs.tiposBien"
                  placeholder="Selecciona un tipo"
                  label="descripcion"
                  track-by="id"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Categoría *</label>
                <SelectVue
                  v-model="form.categoria_id"
                  :options="bienesStore.catalogs.categorias"
                  placeholder="Selecciona una categoría"
                  label="descripcion"
                  track-by="id"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Marca *</label>
                <SelectVue
                  v-model="form.marca_id"
                  :options="bienesStore.catalogs.marcas"
                  placeholder="Selecciona una marca"
                  label="descripcion"
                  track-by="id"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Modelo *</label>
                <SelectVue
                  v-model="form.modelo_id"
                  :options="bienesStore.catalogs.modelos"
                  placeholder="Selecciona un modelo"
                  label="descripcion"
                  track-by="id"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Estado Físico *</label>
                <SelectVue
                  v-model="form.estado_fisico_id"
                  :options="bienesStore.catalogs.estadosFisicos"
                  placeholder="Selecciona un estado"
                  label="nombre"
                  track-by="id"
                />
              </div>

              <div class="col-md-3">
                <label class="form-label">Medida</label>
                <input v-model="form.medida" type="number" class="form-control" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Unidad de Medida</label>
                <select v-model="form.unidad_medida" class="form-select">
                  <option disabled value="">Selecciona una unidad</option>
                  <option value="mm">Milímetros (mm)</option>
                  <option value="cm">Centímetros (cm)</option>
                  <option value="m">Metros (m)</option>
                  <option value="in">Pulgadas (in)</option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="form-label">Valor Monetario (Bs.) *</label>
                <input v-model="form.valor_monetario" type="number" step="0.01" class="form-control" />
              </div>

              <div class="col-md-3">
                <label class="form-label">Fecha de adquisición *</label>
                <input v-model="form.fecha_adquisicion" type="date" class="form-control" />
              </div>
          </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" :disabled="loading" @click="closeForm">Cancelar</button>
            <button class="btn btn-primary" :disabled="loading" @click="submitForm">
              {{ loading ? (isEdit ? 'Guardando cambios…' : 'Guardando…') : (isEdit ? 'Guardar cambios' : 'Guardar') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" style="z-index: 1040;"></div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useBienesStore } from '@/stores/bienesStore';
import SelectVue from '@/components/select/select-vue.vue';

const props = defineProps({
  showForm: Boolean,
  isEdit: Boolean,
  bienData: Object,
});

const emit = defineEmits(['close', 'submit']);

const bienesStore = useBienesStore();
const form = reactive({
  serial_bien: '',
  serial_equipo: '',
  color: null,
  tipo_bien_id: null,
  categoria_id: null,
  marca_id: null,
  modelo_id: null,
  estado_fisico_id: null,
  unidad_medida: '',
  medida: '',
  valor_monetario: '',
  fecha_adquisicion: '',
});

// Nuevos estados para el modo lote
const esModoLote = ref(false);
const lote = reactive({
  cantidad: 1,
});

const loading = ref(false);
const error = ref(null);

// Watcher para limpiar seriales cuando se activa/desactiva el modo lote
watch(esModoLote, (newVal) => {
  if (newVal) {
    form.serial_bien = '';
    form.serial_equipo = '';
  }
});

// ✅ FUNCIÓN DE VALIDACIÓN - ESTA ES LA QUE FALTABA
const validateForm = () => {
  error.value = null;

  if (esModoLote.value) {
    // Validaciones para modo lote
    if (!lote.cantidad || lote.cantidad < 1) {
      error.value = 'La cantidad debe ser mayor a 0';
      return false;
    }
    if (lote.cantidad > 1000) {
      error.value = 'La cantidad no puede ser mayor a 1000';
      return false;
    }
  } else {
    // Validaciones para modo individual
    if (!form.serial_bien?.trim()) {
      error.value = 'El serial del bien es requerido';
      return false;
    }
  }

  // Validaciones comunes más detalladas
  const camposRequeridos = [
    { campo: form.tipo_bien_id, nombre: 'tipo de bien' },
    { campo: form.categoria_id, nombre: 'categoría' },
    { campo: form.marca_id, nombre: 'marca' },
    { campo: form.modelo_id, nombre: 'modelo' },
    { campo: form.estado_fisico_id, nombre: 'estado físico' },
  ];

  for (const { campo, nombre } of camposRequeridos) {
    if (!campo?.id) {
      error.value = `El ${nombre} es requerido`;
      return false;
    }
  }

  if (!form.valor_monetario || parseFloat(form.valor_monetario) <= 0) {
    error.value = 'El valor monetario debe ser mayor a 0';
    return false;
  }

  if (!form.fecha_adquisicion) {
    error.value = 'La fecha de adquisición es requerida';
    return false;
  }

  console.log('✅ Todas las validaciones pasaron');
  return true;
};

watch(() => props.bienData, async (newVal) => {
  if (props.isEdit && newVal) {
    form.serial_bien = newVal.serial_bien || '';
    form.serial_equipo = newVal.serial_equipo || '';
    form.color = newVal.color || null;
    form.tipo_bien_id = newVal.tipo_bien || null;
    form.categoria_id = newVal.categoria || null;
    form.marca_id = newVal.marca || null;
    form.modelo_id = newVal.modelo || null;
    form.estado_fisico_id = newVal.estado_fisico || null;
    form.unidad_medida = newVal.unidad_medida || '';
    form.medida = newVal.medida || '';
    form.valor_monetario = newVal.valor_monetario || '';
    form.fecha_adquisicion = (newVal.fecha_adquisicion || '').slice(0, 10);
    esModoLote.value = false;
  } else {
    resetForm();
  }
});

const resetForm = () => {
  Object.assign(form, {
    serial_bien: '',
    serial_equipo: '',
    color: null,
    tipo_bien_id: null,
    categoria_id: null,
    marca_id: null,
    modelo_id: null,
    estado_fisico_id: null,
    unidad_medida: '',
    medida: '',
    valor_monetario: '',
    fecha_adquisicion: '',
  });
  esModoLote.value = false;
  lote.cantidad = 1;
  error.value = null;
};

const closeForm = () => {
  emit('close');
  resetForm();
};

const submitForm = async () => {
  console.log('=== INICIANDO SUBMIT FORM ===');
  console.log('Modo lote:', esModoLote.value);
  console.log('Form data:', JSON.parse(JSON.stringify(form)));
  console.log('Lote data:', JSON.parse(JSON.stringify(lote)));

  // Validar antes de enviar
  if (!validateForm()) {
    console.log('❌ Validación fallida:', error.value);
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    console.log('✅ Validación pasada, enviando datos...');
    
    // Buscamos el ID del estatus "Disponible" para usarlo en la creación.
    const estatusDisponible = bienesStore.catalogs.estatus?.find(
      (e) => e.descripcion.toLowerCase() === 'disponible'
    );
    if (!estatusDisponible && !props.isEdit) {
        throw new Error("No se pudo encontrar el estatus 'Disponible' en los catálogos.");
    }

    if (esModoLote.value) {
      console.log('🚀 MODO LOTE - Construyendo payload...');
      
      const payloadLote = {
        cantidad: lote.cantidad,
        plantilla: {
          fecha_adquisicion: form.fecha_adquisicion,
          valor_monetario: parseFloat(form.valor_monetario),
          medida: form.medida ? parseFloat(form.medida) : null,
          unidad_medida: form.unidad_medida,
          tipo_bien_id: form.tipo_bien_id?.id,
          categoria_id: form.categoria_id?.id,
          marca_id: form.marca_id?.id,
          modelo_id: form.modelo_id?.id,
          estado_fisico_id: form.estado_fisico_id?.id,
          estatus_id: estatusDisponible?.id, // Siempre "Disponible" para lotes
          color_id: form.color?.id,
        }
      };
      
      console.log('📦 Payload lote listo:', payloadLote);
      console.log('🔄 Llamando a createBienesEnLote...');
      
      await bienesStore.createBienesEnLote(payloadLote);
      
      console.log('✅ Lote creado exitosamente');
      
    } else {
      console.log('👤 MODO INDIVIDUAL - Procesando...');
      const payload = {
        serial_bien: form.serial_bien,
        serial_equipo: form.serial_equipo,
        medida: form.medida ? parseFloat(form.medida) : null,
        unidad_medida: form.unidad_medida,
        valor_monetario: parseFloat(form.valor_monetario),
        fecha_adquisicion: form.fecha_adquisicion,
        color_id: form.color?.id,
        tipo_bien_id: form.tipo_bien_id?.id,
        categoria_id: form.categoria_id?.id,
        marca_id: form.marca_id?.id,
        modelo_id: form.modelo_id?.id,
        estado_fisico_id: form.estado_fisico_id?.id,
        estatus_id: props.isEdit ? props.bienData.estatus.id : estatusDisponible.id,
      };

      if (props.isEdit) {
        await bienesStore.updateBien(props.bienData.id, payload);
      } else {
        await bienesStore.createBien(payload);
      }
    }
    
    console.log('📤 Emitiendo submit...');
    emit('submit');
    closeForm();
    
  } catch (err) {
    console.error('❌ Error catch:', err);
    error.value = err.response?.data?.detail || err.response?.data?.message || 'Error al guardar el bien';
    
    if (err.response) {
      console.error('📡 Error response:', err.response);
      console.error('📡 Error data:', err.response.data);
    }
  } finally {
    console.log('🏁 Finalizando submit');
    loading.value = false;
  }
};

onMounted(() => {
  bienesStore.catalogos_bienes();
});
</script>