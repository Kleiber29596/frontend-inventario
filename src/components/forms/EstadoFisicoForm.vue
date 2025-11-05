<template>
    <div class="modal modal-blur fade" id="estadoFisicoModal" tabindex="-1" role="dialog" aria-hidden="true" ref="estadoFisicoModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Estado Físico' : 'Nuevo Estado Físico' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" v-model="form.nombre" placeholder="Ingrese el nombre del estado físico" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Estado Físico' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useEstadoFisicoStore } from '@/stores/estadoFisicoStore';
import { Modal } from 'bootstrap';

const props = defineProps({
    estadoFisico: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = useEstadoFisicoStore();
const form = ref({
    id: null,
    nombre: '',
});

const estadoFisicoModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(estadoFisicoModal.value);
    estadoFisicoModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
    });
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.estadoFisico) {
            form.value = { ...props.estadoFisico };
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
            await store.updateEstadoFisico(form.value.id, form.value);
        } else {
            await store.createEstadoFisico(form.value);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
