<template>
    <div class="modal modal-blur fade" id="dependenciaModal" tabindex="-1" role="dialog" aria-hidden="true" ref="dependenciaModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Dependencia' : 'Nueva Dependencia' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" v-model="form.nombre" placeholder="Ingrese el nombre de la dependencia" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Dependencia' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useDependenciaStore } from '@/stores/dependenciaStore';
import { Modal } from 'bootstrap';

const props = defineProps({
    dependencia: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = useDependenciaStore();
const form = ref({
    id: null,
    nombre: '',
});

const dependenciaModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(dependenciaModal.value);
    dependenciaModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
    });
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.dependencia) {
            form.value = { ...props.dependencia };
        } else {
            form.value = {
                id: null,
                nombre: '',
            };
        }
        modalInstance.show();
    } else {
        modalInstance.hide();
    }
});

const submitForm = async () => {
    try {
        if (isEditing.value) {
            await store.updateDependencia(form.value.id, { nombre: form.value.nombre });
        } else {
            console.warn('Create Dependencia functionality not explicitly defined in API.');
            // await store.createDependencia(form.value);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
