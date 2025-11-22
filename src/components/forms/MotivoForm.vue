<template>
    <div class="modal modal-blur fade" id="motivoModal" tabindex="-1" role="dialog" aria-hidden="true" ref="motivoModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Motivo' : 'Nuevo Motivo' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <input type="text" class="form-control" v-model="form.descripcion" placeholder="Ingrese la descripción" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo</label>
                           <select name="tipo" class="form-select" v-model="form.tipo" required>
                            <option value="Asignacion">Asignacion</option>
                            <option value="Desincorporacion">Desincorporacion</option>
                            <option value="Solicitud">Solicitud</option>
                            <option value="Devolucion">Devolucion</option>
                           </select>
                            
                            
                        </div>
                        <div class="mb-3">
                            <label class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" v-model="form.activo">
                                <span class="form-check-label">Activo</span>
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Motivo' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useMotivoStore } from '@/stores/motivoStore';
import { Modal } from 'bootstrap';

const props = defineProps({
    motivo: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = useMotivoStore();
const form = ref({
    id: null,
    descripcion: '',
    tipo: '',
    activo: true,
});

const motivoModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(motivoModal.value);
    motivoModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
    });
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.motivo) {
            form.value = { ...props.motivo };
        } else {
            form.value = {
                id: null,
                descripcion: '',
                tipo: '',
                activo: true,
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
            await store.updateMotivo(form.value.id, form.value);
        } else {
            await store.createMotivo(form.value);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
