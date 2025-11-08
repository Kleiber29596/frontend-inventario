<template>
    <div class="modal modal-blur fade" id="adjuntarActaModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Adjuntar Acta de Entrega</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- Content for attaching the file will go here -->
                    <p>Desincorporación ID: {{ desincorporacion?.id }}</p>
                    <p>Motivo: {{ desincorporacion?.motivo?.descripcion }}</p>
                    <input type="file" @change="handleFileUpload" />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn me-auto" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" @click="submitActa">Adjuntar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';
import { useAlertsStore } from '@/stores/alerts';
import { Modal } from 'bootstrap';

const desincorporacionStore = useDesincorporacionStore();

const props = defineProps({
    desincorporacion: Object,
});

const emit = defineEmits(['close', 'actaAdjuntada']);

const selectedFile = ref(null);
const alertsStore = useAlertsStore();

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0];
};

const submitActa = async () => {
    if (selectedFile.value && props.desincorporacion) {
        try {
            await desincorporacionStore.cargarActa(props.desincorporacion.id, selectedFile.value);
            alertsStore.addAlert({
                type: 'success',
                title: 'Éxito',
                message: 'Acta adjuntada y desincorporación aprobada con éxito.'
            });
            closeAndResetModal();
            emit('actaAdjuntada'); // Notify parent to refresh list
        } catch (error) {
            console.error('Error al adjuntar acta:', error);
            alertsStore.addAlert({ type: 'danger', title: 'Error', message: 'Error al adjuntar acta. Inténtalo de nuevo.' });
        }
    } else {
        alertsStore.addAlert({
            type: 'warning',
            title: 'Atención',
            message: 'Por favor, selecciona un archivo.'
        });
    }
};

const closeAndResetModal = () => {
    const modalElement = document.getElementById('adjuntarActaModal');
    const modalInstance = Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
    selectedFile.value = null; // Reset file input
    emit('close');
};

watch(() => props.desincorporacion, (newVal) => {
    if (!newVal) {
        selectedFile.value = null;
    }
});

</script>