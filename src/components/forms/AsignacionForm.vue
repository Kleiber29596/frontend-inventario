<template>
    <div class="modal fade" id="asignacionModal" tabindex="-1" aria-labelledby="asignacionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="asignacionModalLabel">{{ form.id ? 'Editar' : 'Nueva' }} Asignación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="departamento" class="form-label">Departamento</label>
                                <select class="form-select" id="departamento" v-model="form.departamento_id">
                                    <option disabled value="">Seleccione un departamento</option>
                                    <option v-for="depto in store.catalogs.departamentos" :key="depto.id" :value="depto.id">
                                        {{ depto.nombre }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="persona" class="form-label">Persona</label>
                                <select class="form-select" id="persona" v-model="form.persona_id" :disabled="!form.departamento_id">
                                    <option disabled value="">Seleccione una persona</option>
                                    <option v-for="persona in store.catalogs.personas" :key="persona.id" :value="persona.id">
                                        {{ persona.primer_nombre }} {{ persona.primer_apellido }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
                                <input type="date" class="form-control" id="fecha_inicio" v-model="form.fecha_inicio">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="estatus" class="form-label">Estatus</label>
                                <select class="form-select" id="estatus" v-model="form.estatus_id">
                                    <option disabled value="">Seleccione un estatus</option>
                                    <option v-for="est in store.catalogs.estatus" :key="est.id" :value="est.id">
                                        {{ est.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="motivo" class="form-label">Motivo</label>
                            <textarea class="form-control" id="motivo" rows="3" v-model="form.motivo"></textarea>
                        </div>

                        <hr>

                        <h5>Bienes Asignados</h5>
                        <div class="mb-3">
                            <label for="bien-search" class="form-label">Buscar y Agregar Bienes</label>
                            <VueMultiselect
                                v-model="bienesToAdd"
                                :options="store.catalogs.bienes"
                                :multiple="true"
                                track-by="id"
                                label="serial"
                                placeholder="Escribe para buscar serial..."
                                :searchable="true"
                                :loading="store.loading"
                                @search-change="buscarBienes"
                            />
                        </div>

                        <table class="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Serial</th>
                                    <th>Condición de Retorno</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(bien, index) in form.bienes" :key="bien.bien_id">
                                    <td>{{ bien.serial }}</td>
                                    <td>
                                        <input type="text" class="form-control form-control-sm" v-model="bien.condicion_retorno">
                                    </td>
                                    <td>
                                        <button type="button" class="btn btn-danger btn-sm" @click="removeBien(index)">Quitar</button>
                                    </td>
                                </tr>
                                <tr v-if="form.bienes.length === 0">
                                    <td colspan="3" class="text-center">No hay bienes agregados.</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
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
import { ref, watch, onMounted } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import VueMultiselect from 'vue-multiselect';

const props = defineProps({
    asignacion: Object
});

const emit = defineEmits(['close']);

const store = useAsignacionStore();

onMounted(() => {
    store.fetchCatalogos();
});

const form = ref({
    id: null,
    departamento_id: '',
    persona_id: '',
    fecha_inicio: '',
    fecha_fin: null,
    estatus_id: '',
    motivo: '',
    bienes: []
});

const bienesToAdd = ref([]);

watch(() => form.value.departamento_id, (newVal) => {
    form.value.persona_id = '';
    if (newVal) {
        store.fetchPersonasPorDepartamento(newVal);
    }
});

watch(() => props.asignacion, (newVal) => {
    if (newVal) {
        form.value = { ...newVal, bienes: newVal.bienes || [] };
        // Sync with vue-multiselect model
        bienesToAdd.value = form.value.bienes.map(b => ({ id: b.bien_id, serial: b.serial }));
        if (newVal.departamento_id) {
            store.fetchPersonasPorDepartamento(newVal.departamento_id);
        }
    } else {
        resetForm();
    }
}, { deep: true });

watch(bienesToAdd, (selection) => {
    if (!selection) return;

    const selectedIds = selection.map(s => s.id);

    // Add new items to form.bienes
    selection.forEach(selBien => {
        if (!form.value.bienes.some(formBien => formBien.bien_id === selBien.id)) {
            form.value.bienes.push({
                bien_id: selBien.id,
                serial: selBien.serial,
                condicion_retorno: ''
            });
        }
    });

    // Remove items from form.bienes that are no longer in selection
    form.value.bienes = form.value.bienes.filter(formBien =>
        selectedIds.includes(formBien.bien_id)
    );
});

const removeBien = (index) => {
    const removedBienId = form.value.bienes[index].bien_id;
    form.value.bienes.splice(index, 1);
    bienesToAdd.value = bienesToAdd.value.filter(b => b.id !== removedBienId);
};

const handleSubmit = async () => {
    if (!form.value.persona_id || !form.value.departamento_id || !form.value.fecha_inicio) {
        alert('Por favor, completa los campos requeridos.');
        return;
    }

    const payload = { ...form.value };

    try {
        if (payload.id) {
            await store.updateAsignacion(payload.id, payload);
        } else {
            await store.createAsignacion(payload);
        }
        emit('close');
        resetForm();
    } catch (error) {
        alert('Ocurrió un error al guardar la asignación.');
    }
};

const resetForm = () => {
    form.value = {
        id: null,
        departamento_id: '',
        persona_id: '',
        fecha_inicio: '',
        fecha_fin: null,
        estatus_id: '',
        motivo: '',
        bienes: []
    };
    bienesToAdd.value = [];
    store.catalogs.personas = [];
};

const buscarBienes = (query) => {
    if (query) {
        store.searchBienes(query);
    }
};

</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style>
.multiselect__tags {
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
}
</style>
