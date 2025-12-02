<template>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" @click.self="close">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle de Desincorporación #{{ desincorporacionData?.id }}</h5>
                    <button type="button" class="btn-close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div v-if="desincorporacionData">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Fecha de Desincorporación</label>
                                <p class="form-control-plaintext">{{ new Date(desincorporacionData.fecha_desincorporacion).toLocaleDateString('es-ES') }}</p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Motivo</label>
                                <p class="form-control-plaintext">{{ desincorporacionData.motivo.descripcion }}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Departamento Responsable</label>
                                <p class="form-control-plaintext">{{ desincorporacionData.departamento.nombre }}</p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Persona Responsable</label>
                                <p class="form-control-plaintext">{{ `${desincorporacionData.persona_responsable.primer_nombre} ${desincorporacionData.persona_responsable.primer_apellido}` }}</p>
                            </div>
                        </div>
                        <div class="row" v-if="desincorporacionData.solicitud_id">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">ID de Solicitud Asociada</label>
                                <p class="form-control-plaintext">{{ desincorporacionData.solicitud_id }}</p>
                            </div>
                        </div>

                        <h5 class="mt-3 border-top pt-3">Bienes Desincorporados</h5>
                        <div class="table-responsive">
                            <table class="table table-vcenter card-table table-striped">
                                <thead>
                                    <tr>
                                        <th>Marca</th>
                                        <th>Modelo</th>
                                        <th>Serial</th>
                                        <th>Condición Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(detalle, index) in desincorporacionData.detalles" :key="detalle.id">
                                        <td>{{ detalle.bien.marca.descripcion }}</td>
                                        <td>{{ detalle.bien.modelo.descripcion }}</td>
                                        <td>{{ detalle.bien.tipo_bien.descripcion }}</td>
                                        <td>{{ detalle.bien.serial_bien || 'N/A' }}</td>
                                        <td>
                                            <span class="badge bg-secondary">{{ detalle.bien.estado_fisico.nombre }}</span>
                                        </td>
                                    </tr>
                                    <tr v-if="!desincorporacionData.detalles || desincorporacionData.detalles.length === 0">
                                        <td colspan="4" class="text-center">No se encontraron bienes.</td>
                                    </tr>
                                </tbody>
                            </table>
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
const props = defineProps({
    showModal: Boolean,
    desincorporacionData: Object,
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
</script>