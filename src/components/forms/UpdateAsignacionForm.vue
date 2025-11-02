<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" aria-labelledby="asignacionModalLabel"
        aria-modal="true" role="dialog">
        <div class="modal-dialog modal-lg">
            <!-- Contenido del modal -->
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="asignacionModalLabel">Editar Asignación</h5>
                    <button type="button" class="btn-close" @click="close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="departamento" class="form-label">Departamento</label>
                                
                                <CustomVueSelect :options="store.catalogs.departamentos" v-model="form.departamento_id"
                                    placeholder="Selecciona un departamento..." label="nombre" track-by="id" />
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="persona" class="form-label">Persona</label>
                               
                                <CustomVueSelect :options="store.catalogs.personas" v-model="form.persona_id"
                                    placeholder="Selecciona una persona..." label="primer_nombre" track-by="id" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
                                <input type="date" class="form-control" id="fecha_inicio" v-model="form.fecha_inicio">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="estatus" class="form-label">Estatus</label>
                                <CustomVueSelect :options="store.catalogs.estatus" v-model="form.estatus_id"
                                    placeholder="Selecciona un estatus..." label="descripcion" track-by="id" />
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="motivo" class="form-label">Motivo</label>
                            <CustomVueSelect :options="store.catalogs.motivos" v-model="form.motivo"
                                placeholder="Selecciona un motivo..." label="descripcion" track-by="id" />
                        </div>

                        <hr>

                        <h5>Bienes Asignados</h5>
                        <div class="mb-3">
                            <label for="bienes-select" class="form-label">Buscar y Agregar Bienes</label>
                                                            <CustomVueSelect :options="store.bienes" v-model="form.bienes_id"
                                                            placeholder="Selecciona bienes..." label="label" track-by="id" :multiple="true" />
                        </div>
                          

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
                            <button type="submit" class="btn btn-primary" :disabled="store.loading">
                                <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status"
                                    aria-hidden="true"></span>
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import CustomVueSelect from '@/components/select/select-vue.vue'

const props = defineProps({
    asignacion: Object,
    showModal: Boolean
});

const emit = defineEmits(['close']);

const store = useAsignacionStore();

onMounted(() => {
    store.fetchCatalogos();
    store.fetchBienes();
});



const form = ref({
    id: null,
    departamento_id: '',
    persona_id: '',
    fecha_inicio: '',
    fecha_fin: null,
    estatus_id: '',
    motivo: null,
    bienes_id: []
});



const resetForm = () => {
    form.value = {
        id: null,
        departamento_id: '',
        persona_id: '',
        fecha_inicio: '',
        fecha_fin: null,
        estatus_id: '',
        motivo: null,
        bienes: [],
    };
    store.catalogs.personas = [];
};

watch(() => form.value.departamento_id, (newVal) => {
    form.value.persona_id = '';
    if (newVal) {
        store.fetchPersonasPorDepartamento(newVal);
    }
});

watch(() => props.asignacion, async (newVal) => {
    if (newVal && newVal.id) {
        // Fetch personas for the department first, then populate the form
        if (newVal.departamento && newVal.departamento.id) {
            await store.fetchPersonasPorDepartamento(newVal.departamento.id);
        }
        populateForm(newVal);
    } else {
        resetForm();
    }
}, { deep: true, immediate: true });

const populateForm = (newVal) => {
    form.value.id = newVal.id;
    form.value.fecha_inicio = newVal.fecha_inicio;

    // Find and assign the full objects from catalogs
    form.value.departamento_id = store.catalogs.departamentos.find(d => d.id === newVal.departamento.id) || null;
    form.value.persona_id = store.catalogs.personas.find(p => p.id === newVal.persona.id) || null;
    form.value.estatus_id = store.catalogs.estatus.find(e => e.id === newVal.estatus.id) || null;
    form.value.motivo = store.catalogs.motivos.find(m => m.id === newVal.motivo.id) || null;

    // Ensure bienes are correctly mapped for the select component
    if (newVal.bienes && Array.isArray(newVal.bienes)) {
        form.value.bienes_id = newVal.bienes.map(b => {
            const bienData = store.bienes.find(bien => bien.id === b.bien_id);
            return bienData ? { id: bienData.id, label: bienData.label } : null;
        }).filter(b => b !== null);
    } else {
        form.value.bienes_id = [];
    }
};



const close = () => {
    emit('close');
};

const handleSubmit = async () => {
    if (!form.value.persona_id || !form.value.departamento_id || !form.value.fecha_inicio) {
        // Replace with a more robust notification system if available
        alert('Por favor, completa los campos requeridos.');
        return;
    }

    const formValue = form.value;

    // Build the payload with correct data structure
    const payload = {
        departamento_id: formValue.departamento_id?.id,
        persona_id: formValue.persona_id?.id,
        estatus_id: formValue.estatus_id?.id,
        fecha_inicio: formValue.fecha_inicio,
        fecha_fin: formValue.fecha_fin, // This should be null on creation
        motivo: formValue.motivo?.id, // Assuming motivo is an object with an id
        bienes: formValue.bienes_id.map(bien => ({
            bien_id: bien.id,
            condicion_retorno: ""
        }))
    };

    try {
        // Only update existing assignment
        await store.updateAsignacion(formValue.id, payload);
        close();
    } catch (error) {
        // Replace with a more robust notification system if available
        alert('Ocurrió un error al guardar la asignación.');
        console.error(error);
    }
    
};

</script>
