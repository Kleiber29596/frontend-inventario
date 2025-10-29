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
                                <select id="persona_responsable" v-model="form.persona_responsable_id" class="form-select">
                                    <option :value="null">Seleccione una persona</option>
                                    <option v-for="persona in store.catalogs.personas" :key="persona.id" :value="persona.id">{{ persona.primer_nombre + ' ' + persona.primer_apellido}}</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="departamento" class="form-label">Departamento</label>
                                <select id="departamento" v-model="form.departamento_id" class="form-select">
                                    <option :value="null">Seleccione un departamento</option>
                                    <option v-for="depto in store.catalogs.departamentos" :key="depto.id" :value="depto.id">{{ depto.nombre }}</option>
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
                                <select id="estatus" v-model="form.estatus_id" class="form-select">
                                    <option :value="null">Seleccione un estatus</option>
                                    <option v-for="estatus in store.catalogs.estatus" :key="estatus.id" :value="estatus.id">{{ estatus.nombre }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="motivo" class="form-label">Motivo</label>
                            <textarea class="form-control" id="motivo" rows="3" v-model="form.motivo"></textarea>
                        </div>

                        <hr>

                        <h5>Bienes a Desincorporar</h5>
                        <div class="mb-3">
                            <label for="bien-search" class="form-label">Buscar Bien</label>
                             <input type="text" class="form-control" @input="onBienSearch($event.target.value)" placeholder="Escribe para buscar serial...">
                            <select class="form-select mt-2" @change="addBienById($event.target.value)">
                                <option :value="null">Resultados de la búsqueda</option>
                                <option v-for="bien in store.catalogs.bienes" :key="bien.id" :value="bien.id">{{ bien.serial }}</option>
                            </select>
                            <small class="form-text text-muted">Busca por serial del bien.</small>
                        </div>

                        <table class="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Serial</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(bien, index) in form.bienes" :key="bien.bien_id">
                                    <td>{{ bien.serial }}</td>
                                    <td>
                                        <button type="button" class="btn btn-danger btn-sm" @click="removeBien(index)">Quitar</button>
                                    </td>
                                </tr>
                                <tr v-if="form.bienes.length === 0">
                                    <td colspan="2" class="text-center">No hay bienes agregados.</td>
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
import { ref, watch } from 'vue';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';

const props = defineProps({
    desincorporacion: Object
});

const emit = defineEmits(['close']);

const store = useDesincorporacionStore();

const form = ref({
    id: null,
    motivo: '',
    fecha_inicio: '',
    persona_responsable_id: null,
    departamento_id: null,
    estatus_id: null,
    bienes: []
});

watch(() => props.desincorporacion, (newVal) => {
    if (newVal) {
        form.value = { ...newVal, bienes: newVal.bienes || [] };
    } else {
        resetForm();
    }
});

let searchTimeout;
const onBienSearch = (query) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        store.searchBienes(query);
    }, 300); // Debounce
};

const addBienById = (bienId) => {
    const bien = store.catalogs.bienes.find(b => b.id === parseInt(bienId));
    if (bien && !form.value.bienes.some(b => b.bien_id === bien.id)) {
        form.value.bienes.push({
            bien_id: bien.id,
            serial: bien.serial
        });
    }
};

const removeBien = (index) => {
    form.value.bienes.splice(index, 1);
};

const handleSubmit = async () => {
    if (!form.value.persona_responsable_id || !form.value.departamento_id || !form.value.fecha_inicio) {
        alert('Por favor, completa los campos requeridos.');
        return;
    }

    const payload = { ...form.value };

    try {
        if (payload.id) {
            await store.updateDesincorporacion(payload.id, payload);
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
        motivo: '',
        fecha_inicio: '',
        persona_responsable_id: null,
        departamento_id: null,
        estatus_id: null,
        bienes: []
    };
};

</script>
