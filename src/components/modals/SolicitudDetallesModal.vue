<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" @click.self="close">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalles de la Solicitud #{{ solicitud?.nro_solici }}</h5>
                    <button type="button" class="btn-close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div v-if="loading" class="text-center">
                        <div class="spinner-border" role="status"></div>
                        <p>Cargando detalles...</p>
                    </div>
                    <div v-if="!loading && solicitud">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Tipo de Solicitud:</strong> {{ solicitud.tipo }}</p>
                                <p><strong>Departamento:</strong> {{ solicitud.departamento_solicitante?.nombre }}</p>
                                <p><strong>Solicitante:</strong> {{ solicitud.solicitante?.persona.primer_nombre }} {{ solicitud.solicitante?.persona.primer_apellido }}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Fecha de Solicitud:</strong> {{ new Date(solicitud.fecha_solicitud).toLocaleDateString() }}</p>
                                <p><strong>Motivo:</strong> {{ solicitud.motivo_solicitud?.descripcion }}</p>
                                <p><strong>Estatus:</strong> <span class="badge" :class="getEstatusClass(solicitud.estatus?.descripcion)">{{ solicitud.estatus?.descripcion }}</span></p>
                            </div>
                        </div>
                        <hr>
                        <!-- Detalles específicos por tipo -->
                        <div v-if="solicitud.tipo === 'ASIGNACION'">
                            <h6>Descripción de la Necesidad</h6>
                            <p class="text-muted">{{ solicitud.descripcion || 'No se proporcionó descripción.' }}</p>
                            <p><strong>Fecha Requerida:</strong> {{ solicitud.tiempo_requerido || 'No especificada' }}</p>
                        </div>
                        <div v-if="solicitud.tipo === 'DESINCORPORACION'">
                            <h6>Bienes a Desincorporar</h6>
                            <ul class="list-group">
                                <li v-for="detalle in solicitud.detalles" :key="detalle.id" class="list-group-item">
                                     {{ detalle.descripcion }}  
                                </li>
                                <li v-if="!solicitud.detalles?.length" class="list-group-item text-muted">No se especificaron bienes.</li>
                            </ul>
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
defineProps({
    showModal: Boolean,
    solicitud: Object,
    loading: Boolean,
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};

const getEstatusClass = (estatus) => {
    const classes = {
        'Pendiente': 'bg-warning',
        'Aprobada': 'bg-success',
        'Rechazada': 'bg-danger',
    };
    return classes[estatus] || 'bg-secondary';
};
</script>