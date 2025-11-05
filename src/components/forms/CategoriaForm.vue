<template>
    <div class="modal modal-blur fade" id="categoriaModal" tabindex="-1" role="dialog" aria-hidden="true" ref="categoriaModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <input type="text" class="form-control" v-model="form.descripcion" placeholder="Ingrese la descripción" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Categoría' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useCategoriaStore } from '@/stores/categoriaStore';
import { Modal } from 'bootstrap';

const props = defineProps({
    categoria: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const store = useCategoriaStore();
const form = ref({
    id: null,
    descripcion: '',
});

const categoriaModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(categoriaModal.value);
    categoriaModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
    });
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.categoria) {
            form.value = { ...props.categoria };
        } else {
            form.value = {
                id: null,
                descripcion: '',
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
            await store.updateCategoria(form.value.id, form.value);
        } else {
            await store.createCategoria(form.value);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
