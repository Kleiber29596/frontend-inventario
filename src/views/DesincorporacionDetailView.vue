<template>
    <main class="page-wrapper">
        <HeaderPage :icon="['fas', 'eye']" :text="`Detalle de Desincorporación #${desincorporacionId}`" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div v-if="store.loading" class="text-center p-5">
                    <div class="spinner-border" role="status"></div>
                    <p class="mt-2">Cargando detalles...</p>
                </div>

                <div v-else-if="store.desincorporacionSeleccionada" class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h3 class="card-title">Información General</h3>
                        <router-link to="/desincorporaciones" class="btn btn-secondary">
                            <IconArrowBack size="20" stroke-width="1.5" class="me-2" />
                            Volver al Listado
                        </router-link>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Fecha de Desincorporación</label>
                                <input type="text" class="form-control" :value="new Date(store.desincorporacionSeleccionada.fecha_desincorporacion).toLocaleDateString('es-ES')" readonly>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Motivo</label>
                                <input type="text" class="form-control" :value="store.desincorporacionSeleccionada.motivo.descripcion" readonly>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Departamento Responsable</label>
                                <input type="text" class="form-control" :value="store.desincorporacionSeleccionada.departamento.nombre" readonly>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Persona Responsable</label>
                                <input type="text" class="form-control" :value="`${store.desincorporacionSeleccionada.persona_responsable.primer_nombre} ${store.desincorporacionSeleccionada.persona_responsable.primer_apellido}`" readonly>
                            </div>
                        </div>
                         <div class="row" v-if="store.desincorporacionSeleccionada.solicitud_id">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">ID de Solicitud Asociada</label>
                                <input type="text" class="form-control" :value="store.desincorporacionSeleccionada.solicitud_id" readonly>
                            </div>
                        </div>
                    </div>

                    <div class="card-header border-top">
                        <h3 class="card-title">Bienes Desincorporados</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-vcenter card-table table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Bien</th>
                                    <th>Serial</th>
                                    <th>Condición Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(detalle, index) in store.desincorporacionSeleccionada.detalles" :key="detalle.id">
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ detalle.descripcion }}</td>
                                    <td>{{ detalle.bien.serial_bien || 'N/A' }}</td>
                                    <td>
                                        <span class="badge bg-secondary">{{ detalle.condicion_final.nombre }}</span>
                                    </td>
                                </tr>
                                <tr v-if="!store.desincorporacionSeleccionada.detalles || store.desincorporacionSeleccionada.detalles.length === 0">
                                    <td colspan="4" class="text-center">No se encontraron bienes en esta desincorporación.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-else class="alert alert-danger">
                    No se pudo cargar la información de la desincorporación.
                </div>
            </div>
        </div>
        <FooterPage />
    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';
import HeaderPage from '@/components/page/header/Component.vue';
import FooterPage from '@/components/page/footer/Component.vue';
import { IconArrowBack } from '@tabler/icons-vue';

const route = useRoute();
const store = useDesincorporacionStore();
const desincorporacionId = ref(route.params.id);

onMounted(() => {
    // Limpiamos el estado anterior y buscamos la nueva desincorporación
    store.desincorporacionSeleccionada = null;
    store.fetchDesincorporacionById(desincorporacionId.value);
});
</script>