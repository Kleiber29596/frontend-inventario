<template>
    <div class="modal modal-blur fade" id="personaModal" tabindex="-1" role="dialog" aria-hidden="true" ref="personaModal">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Persona' : 'Nueva Persona' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Nacionalidad</label>
                                <select class="form-select" v-model="form.nacionalidad" required>
                                    <option value="V">V</option>
                                    <option value="E">E</option>
                                </select>
                            </div>
                            <div class="col-md-8 mb-3">
                                <label class="form-label">Cédula</label>
                                <input type="text" class="form-control" v-model="form.cedula" placeholder="12345678" required>
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Primer Nombre</label>
                                <input type="text" class="form-control" v-model="form.primer_nombre" placeholder="Juan" required>
                            </div>
                
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Primer Apellido</label>
                                <input type="text" class="form-control" v-model="form.primer_apellido" placeholder="Perez" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Correo</label>
                                <input type="email" class="form-control" v-model="form.correo" placeholder="juan.perez@example.com" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Número dedsdsdssd Contacto</label>
                                <input type="text" class="form-control" v-model="form.num_contacto" placeholder="0412-1234567" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Cargo</label>
                                <input type="text" class="form-control" v-model="form.cargo" placeholder="Analista" required>
                            </div>
                           
                            <div class="col-md-6 mb-3">
                                <label class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" v-model="form.Estado">
                                    <span class="form-check-label">Activo</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Persona' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { usePersonaStore } from '@/stores/personaStore';
import CustomVueSelect from '@/components/select/select-vue.vue';
import { Modal } from 'bootstrap';

const props = defineProps({
    persona: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = usePersonaStore();
const form = ref({
    id: null,
    nacionalidad: '',
    cedula: '',
    primer_nombre: '',
    primer_apellido: '',
    correo: '',
    num_contacto: '',
    cargo: '',
    Estado: true,
    dependencia_id: null,
});

const personaModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(personaModal.value);
    personaModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
        store.fetchCatalogos(); // Cargar catálogos para el formulario
    });
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.persona) {
            // Asignación explícita para asegurar que los datos se mapeen correctamente
            form.value.id = props.persona.id;
            form.value.nacionalidad = props.persona.nacionalidad;
            form.value.cedula = props.persona.cedula;
            form.value.primer_nombre = props.persona.primer_nombre;
            form.value.primer_apellido = props.persona.primer_apellido;
            form.value.correo = props.persona.correo;
            form.value.num_contacto = props.persona.num_contacto;
            form.value.cargo = props.persona.cargo;
            form.value.Estado = props.persona.Estado;
            form.value.dependencia_id = props.persona.dependencia || null; // <-- Aquí está la corrección
        } else {
            form.value = {
                id: null,
                nacionalidad: '',
                cedula: '',
                primer_nombre: '',
                primer_apellido: '',
                correo: '',
                num_contacto: '',
                cargo: '',
                Estado: true,
                dependencia_id: null,
            };
        }
        modalInstance.show();
    } else {
        modalInstance.hide();
    }
});

const submitForm = async () => {
    const payload = {
        ...form.value,
        // Aseguramos que se envíe solo el ID si el valor es un objeto
        dependencia_id: form.value.dependencia_id?.id || form.value.dependencia_id,
    };

    try {
        if (isEditing.value) {
            await store.updatePersona(form.value.id, payload);
        } else {
            await store.createPersona(payload);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
