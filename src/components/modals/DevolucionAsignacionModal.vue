<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Registrar Devolución de Asignación</h5>
                    <button type="button" class="btn-close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Fecha de devolución</label>
                        <input v-model="devolucionForm.fecha_devolucion" type="date" class="form-control" />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Condiciones de los bienes</label>
                        <ul class="list-group">
                            <li v-for="detalle in devolucionForm.detalles" :key="detalle.id" class="list-group-item">
                                <strong>{{ detalle.bien.serial_bien }}</strong> - {{ detalle.bien.tipo_bien.descripcion }}- {{ detalle.bien.marca.descripcion }} {{ detalle.bien.modelo.descripcion }}
                                <select v-model="detalle.condicion_devolucion" class="form-select mt-2">
                                    <option v-for="estado in store.catalogs.estadosFisicos" :key="estado.id" :value="estado.id">{{ estado.nombre}}</option>
                                </select>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
                    <button type="button" class="btn btn-primary" @click="guardarDevolucion">Guardar Devolución</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';

const props = defineProps({
    showModal: Boolean,
    asignacion: Object,
});

const emit = defineEmits(['close']);

const store = useAsignacionStore();

const devolucionForm = reactive({
    asignacion_id: null,
    fecha_devolucion: new Date().toISOString().split('T')[0],
    detalles: [],
});

watch(() => props.asignacion, async (newAsignacion) => {
    if (newAsignacion) {
        devolucionForm.asignacion_id = newAsignacion.id;
        const detalles = await store.fetchAsignacionDetalles(newAsignacion.id);
        devolucionForm.detalles = detalles.map(d => ({
            ...d,
            condicion_devolucion: store.catalogs.estadosFisicos.length > 0 ? store.catalogs.estadosFisicos[0].id : null,
        }));
    } else {
        devolucionForm.asignacion_id = null;
        devolucionForm.detalles = [];
    }
});

const guardarDevolucion = async () => {
    // Here we would call the store action
    await store.guardarDevolucion(devolucionForm);
    close();
};

const close = () => {
    emit('close');
};
</script>
