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
                                        <p><strong>Fecha de Inicio:</strong> {{ asignacion.fecha_inicio }}</p>
                                        <p><strong>Fecha de Fin:</strong> {{ asignacion.fecha_fin || 'Indefinida' }}</p>
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
                                                <h6>Bienes Devueltos:</h6>
                                                <ul class="list-group">
                                                    <li v-for="item in devolucion.bienes_devueltos" :key="item.id" class="list-group-item">
                                                        {{ item.bien.serial_bien }} - Condición: <span class="badge bg-secondary">{{ item.condicion_retorno.nombre }}</span>
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
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
</script>