<template>
  <div v-if="showForm">
    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" style="z-index: 1050;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content card">
          <div class="card-header">
            <h3 class="card-title m-0">{{ isEdit ? 'Editar bien' : 'Nuevo bien' }}</h3>
            <button type="button" class="btn-close" aria-label="Close" @click="closeForm"></button>
          </div>

          <div class="card-body">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div class="row g-2">
              <div class="col-md-4">
                <label class="form-label">Serial del Bien *</label>
                <input v-model="form.serial_bien" class="form-control" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Serial del Equipo</label>
                <input v-model="form.serial_equipo" class="form-control" />
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

              <div class="col-md-4">
                <label class="form-label">Medida</label>
                <input v-model="form.medida" type="number" class="form-control" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Valor Monetario *</label>
                <input v-model="form.valor_monetario" type="number" step="0.01" class="form-control" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Fecha de adquisición *</label>
                <input v-model="form.fecha_adquisicion" type="date" class="form-control" />
              </div>
            </div>
          </div>

          <div class="card-footer d-flex gap-2 justify-content-end">
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
  medida: '',
  valor_monetario: '',
  fecha_adquisicion: '',
});

const loading = ref(false);
const error = ref(null);

watch(() => props.bienData, async (newVal) => {
  if (newVal) {
    // Asegurarse de que los catálogos están cargados
    if (bienesStore.catalogs.tiposBien.length === 0) {
      await bienesStore.catalogos_bienes();
    }

    const catalogs = bienesStore.catalogs;
    form.serial_bien = newVal.serial_bien || '';
    form.serial_equipo = newVal.serial_equipo || '';
    form.color = catalogs.colores.find(c => c.descripcion === newVal.color) || null;
    form.tipo_bien_id = catalogs.tiposBien.find(t => t.descripcion === newVal.tipo_bien) || null;
    form.categoria_id = catalogs.categorias.find(c => c.descripcion === newVal.categoria) || null;
    form.marca_id = catalogs.marcas.find(m => m.descripcion === newVal.marca) || null;
    form.modelo_id = catalogs.modelos.find(m => m.descripcion === newVal.modelo) || null;
    form.estado_fisico_id = catalogs.estadosFisicos.find(e => e.nombre === newVal.estado_fisico) || null;
    form.medida = newVal.medida || '';
    form.valor_monetario = newVal.valor_monetario || '';
    form.fecha_adquisicion = (newVal.fecha_adquisicion || '').slice(0, 10);
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
    medida: '',
    valor_monetario: '',
    fecha_adquisicion: '',
  });
};

const closeForm = () => {
  emit('close');
  resetForm();
};

const submitForm = async () => {
  loading.value = true;
  error.value = null;

  const { color, ...restForm } = form;
  const payload = {
    ...restForm,
    color_id: color?.id,
    tipo_bien_id: form.tipo_bien_id?.id,
    categoria_id: form.categoria_id?.id,
    marca_id: form.marca_id?.id,
    modelo_id: form.modelo_id?.id,
    estado_fisico_id: form.estado_fisico_id?.id,
  };

  try {
    if (props.isEdit) {
      await bienesStore.updateBien(props.bienData.id, payload);
    } else {
      await bienesStore.createBien(payload);
    }
    emit('submit');
    closeForm();
  } catch (err) {
    error.value = err.response?.data?.detail || 'Error al guardar el bien';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  bienesStore.catalogos_bienes();
});
</script>


