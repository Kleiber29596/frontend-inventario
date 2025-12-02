<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
        <!--
            He cambiado el modal a modal-lg ya que el XL era muy grande para el contenido.
            Si prefieres el tamaño anterior, puedes volver a cambiarlo a modal-xl.
        -->
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Registrar Devolución de Asignación</h5>
                    <button type="button" class="btn-close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label required">Fecha de devolución</label>
                                <!-- Reemplazamos el input nativo por Flatpickr -->
                                <flat-pickr
                                    v-model="devolucionForm.fecha_devolucion"
                                    :config="flatpickrConfig"
                                    class="form-control"
                                    placeholder="Selecciona fecha y hora" />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label required">Motivo de Devolución</label>
                                <CustomVueSelect
                                    v-model="devolucionForm.motivo_id"
                                    :options="store.catalogs.motivos_devolucion"
                                    placeholder="Selecciona un motivo..."
                                    label="descripcion"
                                    track-by="id"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Condición de retorno de los bienes</label>
                        <ul class="list-group">
                            <li v-for="bien in devolucionForm.bienes" :key="bien.bien_id" class="list-group-item">
                                <div class="row align-items-center g-2">
                                    <div class="col-auto">
                                        <input class="form-check-input" type="checkbox" v-model="bien.seleccionado">
                                    </div>
                                    <div class="col">
                                        <strong :class="{ 'text-muted': !bien.seleccionado }">{{ bien.bien_label }}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <CustomVueSelect
                                            v-model="bien.condicion_retorno_id"
                                            :options="store.catalogs.estadosFisicos"
                                            placeholder="Selecciona una condición..."
                                            label="nombre"
                                            track-by="id"
                                            :disabled="!bien.seleccionado"
                                        />
                                    </div>
                                </div>
                            </li>
                            <li v-if="devolucionForm.bienes.length === 0" class="list-group-item text-center text-muted">
                                No hay bienes en esta asignación.
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
import { ref, reactive, watch, computed } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import CustomVueSelect from '@/components/select/select-vue.vue';
// 1. Importar el componente Flatpickr y sus estilos
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';



const props = defineProps({
    showModal: Boolean,
    asignacion: Object,
});

const emit = defineEmits(['close']);

const store = useAsignacionStore();

// 2. Configuración para Flatpickr
const flatpickrConfig = {
    enableTime: true,       // Habilita el selector de hora
    altInput: true, // Muestra un input amigable para el usuario
    altFormat: "Y-m-d h:i K", // Formato que ve el usuario (12h con AM/PM)
    dateFormat: "Y-m-d\\TH:i:S", // Formato que se envía al backend (ISO 8601)
    time_24hr: false,       // Usar formato de 12 horas (AM/PM)
    locale: Spanish,        // Usar el idioma español
    minuteIncrement: 1,     // Incremento de los minutos (las flechas irán de 1 en 1)
};


const devolucionForm = reactive({
    asignacion_id: null,
    persona_responsable_id: null,
    motivo_id: null,
    fecha_devolucion: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:mm
    bienes: [],
});

// Usamos un watch en `showModal` para controlar el llenado y reseteo del formulario.
// Esto es más fiable que observar la prop `asignacion`.
watch(() => props.showModal, async (isVisible) => {
    if (isVisible && props.asignacion) {
        // ---- LLENAR FORMULARIO AL ABRIR ----
        const asignacionActual = props.asignacion;
        devolucionForm.asignacion_id = asignacionActual.id;
        devolucionForm.persona_responsable_id = asignacionActual.departamento?.responsable_patrimonial_id;

        // Obtenemos los detalles frescos de los bienes
        const detalles = await store.fetchAsignacionDetalles(asignacionActual.id);
        if (detalles) {
            devolucionForm.bienes = detalles.map(detalle => ({
                bien_id: detalle.bien.id,
                bien_label: `${detalle.bien.serial_bien || 'S/S'} - ${detalle.bien.tipo_bien.descripcion} ${detalle.bien.marca.descripcion}`,
                condicion_retorno_id: null,
                seleccionado: false,
            }));
        }
    } else if (!isVisible) {
        // ---- RESETEAR FORMULARIO AL CERRAR ----
        devolucionForm.asignacion_id = null;
        devolucionForm.persona_responsable_id = null;
        devolucionForm.motivo_id = null;
        devolucionForm.fecha_devolucion = new Date().toISOString().slice(0, 16);
        devolucionForm.bienes = [];
    }
});

const guardarDevolucion = async () => {
    // Filtramos solo los bienes que han sido seleccionados
    const bienesSeleccionados = devolucionForm.bienes.filter(b => b.seleccionado);

    // --- VALIDACIONES ---
    // 1. Validar que al menos un bien haya sido seleccionado.
    if (bienesSeleccionados.length === 0) {
        alert('Debes seleccionar al menos un bien para devolver.');
        return;
    }

    // 2. Validar que cada bien seleccionado tenga una condición de retorno.
    if (bienesSeleccionados.some(b => !b.condicion_retorno_id)) {
        alert('Por favor, especifica la condición de retorno para todos los bienes seleccionados.');
        return;
    }

    // --- CONSTRUCCIÓN DEL PAYLOAD ---
    // Volvemos a la lógica original: crear un objeto JSON plano.
    const payload = {
        asignacion_id: devolucionForm.asignacion_id,
        persona_responsable_id: devolucionForm.persona_responsable_id,
        motivo_id: devolucionForm.motivo_id?.id,
        fecha_devolucion: devolucionForm.fecha_devolucion,
        bienes: bienesSeleccionados.map(b => ({
            bien_id: b.bien_id,
            condicion_retorno_id: b.condicion_retorno_id?.id,
        })),
    };

    await store.createDevolucion(payload);
    close();
};

const close = () => {
    emit('close');
};
</script>
