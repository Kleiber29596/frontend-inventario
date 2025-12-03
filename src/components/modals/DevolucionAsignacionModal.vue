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

                    <!-- NUEVO: Campo para Informe Técnico, condicional -->
                    <div class="mb-3" v-if="isMantenimiento">
                        <label class="form-label">Informe Técnico (PDF)</label>
                        <input
                            type="file"
                            class="form-control"
                            accept=".pdf"
                            @change="handleFileChange"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Condición de retorno de los bienes</label>
                        <ul class="list-group">
                            <!-- ✅ MEJORA: Se reestructura el bucle para añadir el campo de observaciones -->
                            <li v-for="bien in devolucionForm.bienes" :key="bien.bien_id" class="list-group-item">
                                <div class="row align-items-center g-3">
                                    <div class="col-auto">
                                        <input class="form-check-input" type="checkbox" v-model="bien.seleccionado">
                                    </div>
                                    <div class="col">
                                        <strong :class="{ 'text-muted': !bien.seleccionado }">{{ bien.bien_label }}</strong>
                                    </div>
                                    <div class="col-md-3">
                                        <CustomVueSelect
                                            v-model="bien.condicion_retorno_id"
                                            :options="store.catalogs.estadosFisicos"
                                            placeholder="Condición de retorno..."
                                            label="nombre"
                                            track-by="id"
                                            :disabled="!bien.seleccionado"
                                        />
                                    </div>
                                    <!-- ✅ CORRECCIÓN: El campo de observaciones se movió aquí, dentro del bucle -->
                                    <div v-if="bien.seleccionado" class="mt-2 col-12">
                                        <label class="form-label form-label-sm">Observaciones</label>
                                        <textarea 
                                            class="form-control" 
                                            rows="2" 
                                            placeholder="Añada una observación sobre el estado del bien..."
                                            v-model="bien.observaciones"
                                        ></textarea>
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
import { useAsignacionStore } from '@/stores/asignacionStore'; // Asegúrate de que la ruta sea correcta
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

// ✅ MEJORA: La configuración de Flatpickr ahora es una propiedad computada.
// Esto nos permite establecer dinámicamente la fecha mínima (`minDate`)
// basándonos en la fecha de inicio de la asignación.
const flatpickrConfig = computed(() => ({
    enableTime: true,
    altInput: true,
    altFormat: "Y-m-d h:i K",
    dateFormat: "Y-m-d\\TH:i:S",
    time_24hr: false,
    locale: Spanish,
    minuteIncrement: 1,
    // ✅ NUEVO: No se puede seleccionar una fecha anterior al inicio de la asignación.
    minDate: props.asignacion?.fecha_inicio || null,
}));



// ✅ CORRECCIÓN: Cambiamos de `reactive` a `ref` para una mejor reactividad anidada.
const devolucionForm = ref({
    asignacion_id: null,
    persona_responsable_id: null,
    motivo_id: null,
    fecha_devolucion: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:mm
    informe_tecnico: null, // Cambiado a null para manejar el archivo
    bienes: [], // Este array ahora será reactivo de forma más fiable.
});

// Propiedad computada para verificar si el motivo de la asignación es "Mantenimiento"
// Asegúrate de que el string 'Mantenimiento' coincida exactamente con el de tu base de datos.
const isMantenimiento = computed(() => {
    return props.asignacion?.motivo?.descripcion === 'Mantenimiento';
});

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        devolucionForm.value.informe_tecnico = file;
    }
};

// Usamos un watch en `showModal` para controlar el llenado y reseteo del formulario.
// Esto es más fiable que observar la prop `asignacion`.
watch(() => props.showModal, async (isVisible) => {
    if (isVisible && props.asignacion) {
        // ---- LLENAR FORMULARIO AL ABRIR ----
        const asignacionActual = props.asignacion;
        devolucionForm.value.asignacion_id = asignacionActual.id;
        devolucionForm.value.persona_responsable_id = asignacionActual.departamento?.responsable_patrimonial_id;

        // Obtenemos los detalles frescos de los bienes
        const detalles = await store.fetchAsignacionDetalles(asignacionActual.id);
        if (detalles) { 
            devolucionForm.value.bienes = detalles.map(detalle => ({
                bien_id: detalle.bien.id,
                bien_label: `${detalle.bien.serial_bien || 'S/S'} - ${detalle.bien.tipo_bien.descripcion} ${detalle.bien.marca.descripcion}`,
                condicion_retorno_id: null,
                observaciones: '', // ✅ NUEVO: Se añade el campo de observaciones
                seleccionado: false,
            }));
        }
    } else if (!isVisible) {
        // ---- RESETEAR FORMULARIO AL CERRAR ----
        devolucionForm.value.asignacion_id = null;
        devolucionForm.value.persona_responsable_id = null;
        devolucionForm.value.motivo_id = null;
        devolucionForm.value.fecha_devolucion = new Date().toISOString().slice(0, 16);
        devolucionForm.value.informe_tecnico = null; // Reseteamos el campo de archivo
        devolucionForm.value.bienes = [];
    }
});

const guardarDevolucion = async () => {
    // Filtramos solo los bienes que han sido seleccionados
    const bienesSeleccionados = devolucionForm.value.bienes.filter(b => b.seleccionado);

    // --- VALIDACIONES ---
    // 1. Validar que al menos un bien haya sido seleccionado.
    if (bienesSeleccionados.length === 0) {
        alert('Debes seleccionar al menos un bien para devolver.');
        return;
    }

    // 2. Validar fecha
    if (props.asignacion?.fecha_inicio && devolucionForm.value.fecha_devolucion < props.asignacion.fecha_inicio) {
        alert('La fecha de devolución no puede ser anterior a la fecha de inicio de la asignación.');
        return;
    }

    // 3. Validar motivo
    if (!devolucionForm.value.motivo_id) {
        alert('Debes seleccionar un motivo de devolución.');
        return;
    }

    // 4. Validar condición de retorno según el tipo de devolución
    if (!isMantenimiento.value) {
        const bienesSinCondicion = bienesSeleccionados.filter(b => !b.condicion_retorno_id);
        if (bienesSinCondicion.length > 0) {
            alert('Por favor, especifica la condición de retorno para todos los bienes seleccionados.');
            return;
        }
    }

    // --- CONSTRUCCIÓN DEL PAYLOAD CON FormData ---
    const formData = new FormData();

    // 1. Añadir campos simples
    formData.append('asignacion_id', devolucionForm.value.asignacion_id);
    formData.append('persona_responsable_id', devolucionForm.value.persona_responsable_id);
    
    // ✅ CORRECCIÓN: Asegurarnos de enviar solo el ID del motivo
    if (devolucionForm.value.motivo_id && devolucionForm.value.motivo_id.id) {
        formData.append('motivo_id', devolucionForm.value.motivo_id.id);
    } else if (devolucionForm.value.motivo_id) {
        formData.append('motivo_id', devolucionForm.value.motivo_id);
    }
    
    formData.append('fecha_devolucion', devolucionForm.value.fecha_devolucion);

    // 2. Añadir el archivo si existe
    if (devolucionForm.value.informe_tecnico) {
        formData.append('informe_tecnico', devolucionForm.value.informe_tecnico);
    }

    // 3. Añadir la lista de bienes (como un string JSON)
    // ✅ CORRECCIÓN IMPORTANTE: Mapear correctamente las observaciones
    const bienesParaEnviar = bienesSeleccionados.map(b => ({
        bien_id: b.bien_id,
        condicion_retorno_id: b.condicion_retorno_id?.id || b.condicion_retorno_id || null,
        // ✅ Asegurar que se envíe el valor actual de observaciones
        observaciones: b.observaciones || '' // Esto enviará el valor actual (vacio o no)
    }));
    
    console.log('Bienes a enviar:', bienesParaEnviar); // Para depuración
    
    formData.append('bienes', JSON.stringify(bienesParaEnviar));

    // Para depuración: mostrar lo que se está enviando
    for (let [key, value] of formData.entries()) {
        if (key === 'bienes') {
            console.log('bienes (JSON):', value);
        } else {
            console.log(key, ':', value);
        }
    }

    // 4. Enviar los datos
    try {
        await store.createDevolucion(formData);
        close();
    } catch (error) {
        console.error('Error al guardar la devolución:', error);
        alert('Ocurrió un error al guardar la devolución. Por favor, intenta nuevamente.');
    }
};

const close = () => {
    emit('close');
};
</script>
