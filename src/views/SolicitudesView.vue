
<template>
    <main class="page-wrapper">
        <HeaderPage :icon="['fas', 'file-alt']" text="Solicitudes de Bienes" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Solicitudes</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nueva Solicitud</button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-vcenter card-table table-striped">
                            <thead>
                                <tr>
                                    <th>Solicitante</th>
                                    <th>Departamento</th>
                                    <th>Motivo</th>
                                    <th>Fecha</th>
                                    <th>Estatus</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="store.loading">
                                    <td colspan="6" class="text-center">Cargando...</td>
                                </tr>
                                <tr v-for="solicitud in store.solicitudes" :key="solicitud.id">
                                    <td>{{ `${solicitud.solicitante.persona.primer_nombre} ${solicitud.solicitante.persona.primer_apellido}` }}</td>
                                    <td>{{ solicitud.departamento_solicitante?.nombre || 'N/A' }}</td>
                                    <td>{{ solicitud.motivo_solicitud?.descripcion || 'N/A' }}</td>
                                    <td>{{ solicitud.fecha_solicitud }}</td>
                                    <td>
                                        <span class="badge" :class="getEstatusClass(solicitud.estatus?.descripcion)">
                                            {{ solicitud.estatus?.descripcion || 'N/A' }}
                                        </span>
                                    </td>
                                    <td>
                                        <!-- Este botón ahora inicia el flujo para crear una asignación -->
                                        <button class="btn btn-action btn-success" 
                                                @click="iniciarAsignacion(solicitud.id)" 
                                                title="Atender Solicitud / Crear Asignación" 
                                                :disabled="solicitud.estatus?.descripcion !== 'Pendiente'">
                                            <IconCheck size="20" stroke-width="1.5" />
                                        </button>
                                        <button class="btn btn-action" @click="openModal(solicitud)" title="Editar" :disabled="solicitud.estatus?.descripcion !== 'Pendiente'">
                                            <IconEdit size="20" stroke-width="1.5" />
                                        </button>
                                        <!-- Botón para Rechazar la solicitud -->
                                        <button class="btn btn-action text-danger" 
                                                @click="rechazarSolicitud(solicitud.id)" title="Rechazar" 
                                                :disabled="solicitud.estatus?.descripcion !== 'Pendiente'">
                                            <IconX size="20" stroke-width="1.5" />
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="!store.loading && store.solicitudes.length === 0">
                                    <td colspan="6" class="text-center">No se encontraron solicitudes.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <Pagination v-model:page="currentPage" v-model:pageSize="pageSize" :total="store.totalItems" />
                    </div>
                </div>

                <SolicitudForm :solicitud="selectedSolicitud" :showModal="showSolicitudModal" @close="closeModal" />
            </div>
        </div>
        <FooterPage />
    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSolicitudStore } from '@/stores/solicitudStore';
import HeaderPage from '@/components/page/header/Component.vue';
import { useRouter } from 'vue-router';
import FooterPage from '@/components/page/footer/Component.vue';
import SolicitudForm from '@/components/forms/SolicitudForm.vue';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue';
import SearchInput from '@/components/paginacion/searchInput.vue';

const router = useRouter();
const store = useSolicitudStore();
const selectedSolicitud = ref(null);
const showSolicitudModal = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

const fetchData = () => {
    store.fetchSolicitudes(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(fetchData);
watch([currentPage, pageSize, searchTerm], fetchData);

const openModal = (solicitud = null) => {
    selectedSolicitud.value = solicitud;
    showSolicitudModal.value = true;
};

const closeModal = () => {
    showSolicitudModal.value = false;
    selectedSolicitud.value = null;
    fetchData();
};

const iniciarAsignacion = (solicitudId) => {
    // Redirige al formulario de creación de asignación, pasando el ID de la solicitud
    router.push({ path: '/asignaciones/crear', query: { solicitud_id: solicitudId } });
};

const rechazarSolicitud = async (id) => {
    // Aquí podrías usar un modal más elegante como SweetAlert2 para confirmar
    if (confirm('¿Está seguro de que desea rechazar esta solicitud? Esta acción no se puede deshacer.')) {
        await store.rechazarSolicitud(id);
        fetchData(); // Refrescar la lista
    }
};

const getEstatusClass = (estatus) => {
    if (estatus === 'Aprobada') return 'bg-success';
    if (estatus === 'Rechazada') return 'bg-danger';
    if (estatus === 'Pendiente') return 'bg-warning';
    return 'bg-secondary';
};
</script>