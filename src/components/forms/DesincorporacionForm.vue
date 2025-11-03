<template>
    <div class="modal fade" id="desincorporacionModal" tabindex="-1" aria-labelledby="desincorporacionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="desincorporacionModalLabel">{{ form.id ? 'Editar' : 'Nueva' }} Desincorporación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="persona_responsable" class="form-label">Persona Responsable</label>
                                <SelectVue
                                    id="persona_responsable"
                                    v-model="form.persona_responsable_id"
                                    :options="store.catalogs.personas"
                                    placeholder="Seleccione una persona"
                                    label="primer_nombre"
                                    track-by="id"
                                />
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="departamento" class="form-label">Departamento</label>
                                <SelectVue
                                    id="departamento"
                                    v-model="form.departamento_id"
                                    :options="store.catalogs.departamentos"
                                    placeholder="Seleccione un departamento"
                                    label="nombre"
                                    track-by="id"
                                />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
                                <input type="date" class="form-control" id="fecha_inicio" v-model="form.fecha_inicio">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="estatus" class="form-label">Estatus</label>
                                <SelectVue
                                    id="estatus"
                                    v-model="form.estatus_id"
                                    :options="store.catalogs.estatus"
                                    placeholder="Seleccione un estatus"
                                    label="descripcion"
                                    track-by="id"
                                />
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="motivo" class="form-label">Motivo</label>
                            <SelectVue
                                id="motivo"
                                v-model="form.motivo"
                                :options="store.catalogs.motivos"
                                placeholder="Seleccione un motivo"
                                label="descripcion"
                                track-by="id"
                            />
                        </div>

                        <div class="mb-3" v-if="form.id && form.estatus_id !== 3">
                            <label for="acta_firmada" class="form-label">Adjuntar Acta Firmada</label>
                            <input type="file" class="form-control" id="acta_firmada" @change="handleFileUpload">
                        </div>

                        <hr>

                        <div class="mb-3">
                            <label for="bienes" class="form-label">Bienes a Desincorporar</label>
                            <SelectVue
                                id="bienes"
                                v-model="form.bienes"
                                :options="store.catalogs.bienes"
                                placeholder="Seleccione los bienes a desincorporar"
                                label="label"
                                track-by="id"
                                :multiple="true"
                            />
                        </div>




                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" v-if="form.id && form.estatus_id !== 3" @click="uploadActaAndApprove" :disabled="!fileActa || store.loading">
                                <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Adjuntar Acta y Aprobar
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="store.loading">
                                <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';
import SelectVue from '@/components/select/select-vue.vue';

const props = defineProps({
    desincorporacion: Object
});

const emit = defineEmits(['close']);

const store = useDesincorporacionStore();

const form = ref({
    id: null,
    motivo: null,
    fecha_inicio: '',
    persona_responsable_id: null,
    departamento_id: null,
    estatus_id: null,
    bienes: []
});

watch(() => props.desincorporacion, async (newVal) => {
    if (newVal) {
        if (store.catalogs.bienes.length === 0) {
            await store.fetchCatalogos();
        }
        form.value = {
            ...newVal,
            bienes: newVal.bienes ? newVal.bienes.map(b => store.catalogs.bienes.find(cb => cb.id === b.bien_id)) : []
        };
    } else {
        resetForm();
    }
});



const fileActa = ref(null);

const handleFileUpload = (event) => {
    fileActa.value = event.target.files[0];
};

const uploadActaAndApprove = async () => {
    if (!fileActa.value) {
        alert('Por favor, selecciona un archivo para el acta.');
        return;
    }
    try {
        store.loading = true;
        await store.uploadActaAndApprove(form.value.id, fileActa.value);
        emit('close');
        resetForm();
    } catch (error) {
        alert('Ocurrió un error al adjuntar el acta y aprobar la desincorporación.');
    } finally {
        store.loading = false;
    }
};

const handleSubmit = async () => {
    if (!form.value.persona_responsable_id || !form.value.departamento_id || !form.value.fecha_inicio) {
        alert('Por favor, completa los campos requeridos.');
        return;
    }

    const payload = {
        persona_responsable_id: form.value.persona_responsable_id?.id,
        departamento_id: form.value.departamento_id?.id,
        estatus_id: form.value.estatus_id?.id,
        motivo_id: form.value.motivo?.id,
        fecha_inicio: form.value.fecha_inicio,
        bienes: form.value.bienes.map(bien => ({ bien_id: bien.id }))

    };

    try {
        if (payload.id) {
            await store.updateDesincorporacion(form.id, payload);
        } else {
            await store.createDesincorporacion(payload);
        }
        emit('close');
        resetForm();
    } catch (error) {
        alert('Ocurrió un error al guardar la desincorporación.');
    }
};

const resetForm = () => {
    form.value = {
        id: null,
        motivo: null,
        fecha_inicio: '',
        persona_responsable_id: null,
        departamento_id: null,
        estatus_id: null,
        bienes: []
    };
};

</script>
