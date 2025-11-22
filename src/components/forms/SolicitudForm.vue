<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" aria-modal="true" role="dialog" @click.self="close">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEdit ? 'Editar Solicitud' : 'Nueva Solicitud' }}</h5>
                    <button type="button" class="btn-close" @click="close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label required">Tipo de Solicitud</label>
                                <CustomVueSelect v-model="form.tipo"
                                    :options="['ASIGNACION', 'DESINCORPORACION']"
                                    placeholder="Selecciona el tipo..." />
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Departamento Solicitante</label>
                                <CustomVueSelect v-model="form.departamento_solicitante_id"
                                    :options="store.catalogs.departamentos"
                                    placeholder="Selecciona un departamento..." label="nombre" track-by="id" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3"  v-if="form.tipo === 'ASIGNACION'">
                                <label class="form-label required">Usuario del Bien</label>
                                <CustomVueSelect v-model="form.usuario_bien_id"
                                    :options="store.catalogs.personas"
                                    placeholder="Selecciona un usuario..." label="nombres_apellidos" track-by="id" :disabled="!form.departamento_solicitante_id" />
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Motivo</label>
                                <CustomVueSelect v-model="form.motivo_solicitud_id" :options="store.catalogs.motivos"
                                    placeholder="Selecciona un motivo..." label="descripcion" track-by="id" />
                            </div>
                            <div class="col-md-6 mb-3" v-if="form.tipo === 'ASIGNACION'">
                                <label class="form-label">Fecha Requerida</label>
                                <input type="date" class="form-control" v-model="form.tiempo_requerido">
                            </div>
                        </div>

                        <!-- Campo para Solicitudes de ASIGNACIÓN -->
                        <div class="mb-3" v-if="form.tipo === 'ASIGNACION'">
                            <label class="form-label">Descripción</label>
                            <textarea v-model="form.descripcion" class="form-control" rows="3"
                                placeholder="Describe la solicitud..."></textarea>
                        </div>

                        <!-- Campo para Solicitudes de DESINCORPORACIÓN -->
                        <div class="mb-3" v-if="form.tipo === 'DESINCORPORACION'">
                            <label class="form-label required">Bienes a Desincorporar</label>
                            <CustomVueSelect v-model="form.bienes" :options="bienesStore.bienesAsignados"
                                placeholder="Selecciona los bienes..." label="label" track-by="id" :multiple="true" />
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
import { useBienesStore } from '@/stores/bienesStore';
import CustomVueSelect from '@/components/select/select-vue.vue';

const props = defineProps({
    solicitud: Object,
    showModal: Boolean,
});

const emit = defineEmits(['close']);

const store = useSolicitudStore();
const bienesStore = useBienesStore();
const isEdit = ref(false);


const form = ref({
    id: null,
    departamento_solicitante_id: null,
    usuario_bien_id: null,
    motivo_solicitud_id: null,
    descripcion: '',
    tiempo_requerido: new Date().toISOString().slice(0, 10),
    estatus_id: null,
    tipo: 'ASIGNACION', // Valor por defecto
    bienes: [], // Para desincorporación
});

onMounted(() => {
    // Carga los catálogos base (departamentos, estatus)
    store.fetchCatalogos();
    // Carga los motivos para el tipo por defecto ('ASIGNACION')
    store.fetchMotivosPorTipo(form.value.tipo);
});

watch(() => props.solicitud, (newVal) => {
    if (newVal) {
        // La edición de solicitudes está deshabilitada, pero mantenemos la lógica por si se reactiva.
        isEdit.value = true; 
        form.value = { ...newVal };
        // Aseguramos que 'bienes' sea un array
        form.value.bienes = newVal.detalles?.map(d => d.bien) || [];
    } else {
        isEdit.value = false;
        resetForm();
    }
});

const resetForm = () => {
    form.value = {
        id: null,
        departamento_solicitante_id: null,
        usuario_bien_id: null,
        motivo_solicitud_id: null,
        descripcion: '',
        tiempo_requerido: new Date().toISOString().slice(0, 10),
        estatus_id: null,
        tipo: 'ASIGNACION',
        bienes: [],
    };
};

// Cuando cambia el tipo de solicitud, cargamos los motivos correspondientes
watch(() => form.value.tipo, (newTipo) => {
    // Limpiamos el motivo seleccionado anteriormente
    form.value.motivo_solicitud_id = null;
    form.value.bienes = []; // También limpiamos los bienes por si acaso
    // Buscamos los nuevos motivos
    store.fetchMotivosPorTipo(newTipo);
});

// Cuando cambia el departamento, siempre cargamos las personas correspondientes.
watch(() => form.value.departamento_solicitante_id, (newDepto) => {
    form.value.usuario_bien_id = null;
    if (newDepto?.id) {
        store.fetchPersonasPorDepartamento(newDepto.id);
    }
}, { deep: true });

// Cuando cambia el tipo de solicitud, cargamos los bienes si es para desincorporar.
watch(() => form.value.departamento_solicitante_id?.id, (newdepartamento) => {
    if (newdepartamento && form.value.tipo === 'DESINCORPORACION') {
        bienesStore.fetchBienesAsignadosPorDepartamento(newdepartamento);
    } else {
        bienesStore.bienesAsignados = [];
    }
});

const handleSubmit = async () => {
    const payload = {
        ...form.value,
        departamento_solicitante_id: form.value.departamento_solicitante_id?.id || form.value.departamento_solicitante_id,
        usuario_bien_id: form.value.usuario_bien_id?.id || form.value.usuario_bien_id,
        motivo_solicitud_id: form.value.motivo_solicitud_id?.id || form.value.motivo_solicitud_id,
        estatus_id: form.value.estatus_id?.id || form.value.estatus_id,
        // Enviamos solo los IDs de los bienes
        bienes: form.value.bienes.map(b => ({ bien_id: b.id, descripcion: b.label })),
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