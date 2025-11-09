<template>
    <div class="modal modal-blur fade" id="estatusModal" tabindex="-1" role="dialog" aria-hidden="true" ref="estatusModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Estatus' : 'Nuevo Estatus' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <input type="text" class="form-control" v-model="form.descripcion" placeholder="Ingrese la descripción del estatus" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo de Estatus</label>
                            <select class="form-select" v-model="form.tipo_estatus" required>
                                <option value="" disabled>Seleccione un tipo</option>
                                <option value="Bienes">Bienes</option>
                                <option value="Asignacion">Asignación</option>
                                <option value="Desincorporacion">Desincorporación</option>
                                <option value="Solicitud">Solicitud</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Estatus' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useEstatusStore } from '@/stores/estatusStore';
import { Modal } from 'bootstrap';

const props = defineProps({
    estatus: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = useEstatusStore();
const form = ref({
    id: null,
    descripcion: '',
    tipo_estatus: '',
});

const estatusModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(estatusModal.value);
    estatusModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
    });
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.estatus) {
            form.value = { ...props.estatus };
        } else {
            form.value = {
                id: null,
                descripcion: '',
                tipo_estatus: '',
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
            await store.updateEstatus(form.value.id, form.value);
        } else {
            await store.createEstatus(form.value);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
