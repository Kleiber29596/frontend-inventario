<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEdit ? 'Editar Solicitud' : 'Nueva Solicitud' }}</h5>
                    <button type="button" class="btn-close" @click="close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Departamento Solicitante</label>
                                <CustomVueSelect v-model="form.departamento_solicitante_id"
                                    :options="store.catalogs.departamentos"
                                    placeholder="Selecciona un departamento..." label="nombre" track-by="id" />
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Motivo</label>
                                <CustomVueSelect v-model="form.motivo_solicitud_id" :options="store.catalogs.motivos"
                                    placeholder="Selecciona un motivo..." label="descripcion" track-by="id" />
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Tiempo Requerido</label>
                                <input type="date" class="form-control" v-model="form.tiempo_requerido">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea v-model="form.descripcion" class="form-control" rows="3"
                                placeholder="Describe la solicitud..."></textarea>
                        </div>
                        
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
                    <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="store.loading">
                        <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        {{ isEdit ? 'Actualizar' : 'Guardar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useSolicitudStore } from '@/stores/solicitudStore';
import CustomVueSelect from '@/components/select/select-vue.vue';

const props = defineProps({
    solicitud: Object,
    showModal: Boolean,
});

const emit = defineEmits(['close']);

const store = useSolicitudStore();
const isEdit = ref(false);

const form = ref({
    id: null,
    departamento_solicitante_id: null,
    motivo_solicitud_id: null,
    descripcion: '',
    tiempo_requerido: new Date().toISOString().slice(0, 10),
    estatus_id: 1, // Default to 1
});

onMounted(() => {
    store.fetchCatalogos();
});

watch(() => props.solicitud, (newVal) => {
    if (newVal) {
        isEdit.value = true;
        form.value = { ...newVal };
    } else {
        isEdit.value = false;
        resetForm();
    }
});

const resetForm = () => {
    form.value = {
        id: null,
        departamento_solicitante_id: null,
        motivo_solicitud_id: null,
        descripcion: '',
        tiempo_requerido: new Date().toISOString().slice(0, 10),
        estatus_id: 1,
    };
};

const handleSubmit = async () => {
    const payload = {
        ...form.value,
        departamento_solicitante_id: form.value.departamento_solicitante_id?.id || form.value.departamento_solicitante_id,
        motivo_solicitud_id: form.value.motivo_solicitud_id?.id || form.value.motivo_solicitud_id,
        estatus_id: form.value.estatus_id?.id || form.value.estatus_id,
    };

    if (isEdit.value) {
        await store.updateSolicitud(form.value.id, payload);
    } else {
        await store.createSolicitud(payload);
    }
    close();
};

const close = () => {
    emit('close');
    resetForm();
};
</script>