<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" @click.self="close">
        <!-- El modal-dialog-scrollable es útil si el contenido es muy largo -->
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalles de la Asignación #{{ asignacion?.id }}</h5>
                    <button type="button" class="btn-close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div v-if="loading" class="text-center">
                        <div class="spinner-border" role="status"></div>
                        <p>Cargando detalles...</p>
                    </div>
                    <div v-if="!loading && asignacion">
                        <!-- Información General -->
                        <div class="card mb-3">
                            <div class="card-header"><h4 class="card-title">Información General</h4></div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>Departamento:</strong> {{ asignacion.departamento?.nombre }}</p>
                                        <p><strong>Usuario del Bien:</strong> {{ asignacion.usuario_bien?.primer_nombre }} {{ asignacion.usuario_bien?.primer_apellido }}</p>
                                        <p><strong>Responsable Patrimonial:</strong> {{ asignacion.responsable_patrimonial?.primer_nombre }} {{ asignacion.responsable_patrimonial?.primer_apellido }}</p>
                                       

                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Motivo:</strong> {{ asignacion.motivo?.descripcion || 'Sin especificar'  }}</p>
                                        <p><strong>Fecha de Inicio:</strong> {{ formatSimpleDate(asignacion.fecha_inicio) }}</p>
                                        <p><strong>Fecha de Fin:</strong> {{ formatSimpleDate(asignacion.fecha_fin) || 'Indefinida' }}</p>
                                        <p><strong>Estatus:</strong> <span class="badge" :class="getEstatusClass(asignacion.estatus?.descripcion)">{{ asignacion.estatus?.descripcion }}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Bienes Asignados -->
                        <div class="card mb-3">
                            <div class="card-header"><h4 class="card-title">Bienes Asignados</h4></div>
                            <div class="card-body">
                                <ul class="list-group">
                                    <li v-for="detalle in asignacion.detalles" :key="detalle.id" class="list-group-item">
                                        {{ detalle.bien.serial_bien || 'S/S' }} - {{ detalle.bien.tipo_bien.descripcion }} {{ detalle.bien.marca.descripcion }}
                                    </li>
                                    <li v-if="!asignacion.detalles?.length" class="list-group-item text-muted">No hay bienes en esta asignación.</li>
                                </ul>
                            </div>
                        </div>

                        <!-- Historial de Devoluciones -->
                        <div class="card">
                            <div class="card-header"><h4 class="card-title">Historial de Devoluciones</h4></div>
                            <div class="card-body">
                                <div v-if="!asignacion.devoluciones?.length" class="text-muted">
                                    No se han registrado devoluciones para esta asignación.
                                </div>
                                <!-- Añadimos una ref para poder acceder a este elemento desde el script -->
                                <div v-else class="accordion" id="accordionDevoluciones" ref="accordionContainer">
                                    <div v-for="(devolucion, index) in asignacion.devoluciones" :key="devolucion.id" class="accordion-item">
                                        <h2 class="accordion-header" :id="'heading' + index">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index">
                                                Devolución del {{ formatFecha(devolucion.fecha_devolucion) }} - Motivo: {{ devolucion.motivo.descripcion }}
                                            </button>
                                        </h2>
                                        <div :id="'collapse' + index" class="accordion-collapse collapse" data-bs-parent="#accordionDevoluciones">
                                            <div class="accordion-body">
                                                <p><strong>Responsable que entrega:</strong> {{ devolucion.persona_responsable.primer_nombre }} {{ devolucion.persona_responsable.primer_apellido }}</p>
                                                
                                                <!-- Mostrar enlace al informe técnico si existe -->
                                                <p v-if="devolucion.informe_tecnico_url">
                                                    <strong>Informe Técnico:</strong>
                                                    <a :href="getInformeUrl(devolucion.informe_tecnico_url)" target="_blank" rel="noopener noreferrer" class="ms-2">
                                                        Ver Documento <i class="ti ti-external-link"></i>
                                                    </a>
                                                </p>
                                                <h6>Bienes Devueltos:</h6>
                                                <ul class="list-group">
                                                    <li v-for="item in devolucion.bienes_devueltos" :key="item.id" class="list-group-item">
                                                        <div>{{ item.bien.serial_bien }} - Condición: <span class="badge bg-secondary">{{ item.condicion_retorno.nombre }}</span></div>
                                                        <!-- ✅ NUEVO: Mostrar observaciones si existen -->
                                                        <div v-if="item.observaciones" class="mt-2">
                                                            <small class="text-muted">Observaciones:</small>
                                                            <p class="mb-0 fst-italic">"{{ item.observaciones }}"</p>
                                                        </div>
                                                        <!-- ✅ FIN DEL NUEVO BLOQUE -->
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<script setup>
// 1. Importar lo necesario de Vue y Bootstrap
import { ref, onMounted, onUpdated, nextTick } from 'vue';
import { Collapse } from 'bootstrap';

defineProps({
    showModal: Boolean,
    asignacion: Object,
    loading: Boolean,
});

const emit = defineEmits(['close']);

// 2. Crear una referencia para el contenedor del acordeón
const accordionContainer = ref(null);

// 3. Función para inicializar los acordeones
const initializeAccordions = () => {
    if (accordionContainer.value) {
        // Buscamos todos los botones que controlan un collapse dentro de nuestro contenedor
        const collapseElements = accordionContainer.value.querySelectorAll('[data-bs-toggle="collapse"]');
        // Por cada botón, creamos una nueva instancia de Collapse de Bootstrap.
        // Esto asegura que Bootstrap les añada los eventos de click necesarios.
        collapseElements.forEach(el => {
            // El segundo argumento { toggle: false } evita que se abran solos al inicializar.
            new Collapse(document.querySelector(el.dataset.bsTarget), { toggle: false });
        });
    }
};

// 4. Usar los hooks del ciclo de vida de Vue
onMounted(initializeAccordions);
onUpdated(initializeAccordions);

const close = () => {
    emit('close');
};

const getEstatusClass = (estatus) => {
    if (estatus === 'Activa') return 'bg-primary';
    if (estatus === 'Finalizada') return 'bg-success';
    if (estatus === 'Parcialmente Devuelta') return 'bg-warning';
    return 'bg-secondary';
};

// Define or import the formatFecha function
const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

// Función para formatear fechas YYYY-MM-DD a dd/mm/yy
const formatSimpleDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
};

// Función para construir la URL completa del informe técnico
const getInformeUrl = (relativePath) => {
    // Obtiene la URL base de la API desde las variables de entorno de Vite.
    // Si la variable no está definida, usa un valor por defecto para el entorno de desarrollo.
    // Esto hace el código más robusto.
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

    // Asegurarnos de que la ruta relativa no tenga una barra al principio si la base ya la tiene al final
    const cleanRelativePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    return `${cleanBaseUrl}${cleanRelativePath}`;
};
</script>