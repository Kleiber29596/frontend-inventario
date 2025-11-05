<template>
    <div class="modal modal-blur fade" id="modeloModal" tabindex="-1" role="dialog" aria-hidden="true" ref="modeloModal">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEditing ? 'Editar Modelo' : 'Nuevo Modelo' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form @submit.prevent="submitForm">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <input type="text" class="form-control" v-model="form.descripcion" placeholder="Ingrese la descripción" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Marca</label>
                            <select class="form-select" v-model="form.marca_id" required>
                                <option :value="null" disabled>Seleccione una marca</option>
                                <option v-for="marca in marcaStore.marcas" :key="marca.id" :value="marca.id">
                                    {{ marca.descripcion }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Modelo' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useModeloStore } from '@/stores/modeloStore';
import { useMarcaStore } from '@/stores/marcaStore'; // Assuming a marcaStore exists
import { Modal } from 'bootstrap';

const props = defineProps({
    modelo: {
        type: Object,
        default: null,
    },
    showModal: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const modeloStore = useModeloStore();
const marcaStore = useMarcaStore();

const form = ref({
    id: null,
    descripcion: '',
    marca_id: null,
});

const modeloModal = ref(null);
let modalInstance = null;

const isEditing = computed(() => !!form.value.id);

onMounted(() => {
    modalInstance = new Modal(modeloModal.value);
    modeloModal.value.addEventListener('hidden.bs.modal', () => {
        emit('close');
    });
    marcaStore.fetchMarcas(); // Fetch brands when the component mounts
});

watch(() => props.showModal, (newVal) => {
    if (newVal) {
        if (props.modelo) {
            form.value = {
                id: props.modelo.id,
                descripcion: props.modelo.descripcion,
                marca_id: props.modelo.marca ? props.modelo.marca.id : null,
            };
        } else {
            form.value = {
                id: null,
                descripcion: '',
                marca_id: null,
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
            await modeloStore.updateModelo(form.value.id, form.value);
        } else {
            await modeloStore.createModelo(form.value);
        }
        emit('close');
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
</script>
