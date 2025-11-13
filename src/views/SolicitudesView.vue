
<template>
    <main class="page-wrapper">
        <!-- Se muestra el nombre de usuario desde el accountStore -->
        <HeaderPage :icon="['fas', 'file-alt']" text="Solicitudes de Bienes" :user-name="accountStore.username" />

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
                                    <th>Tipo</th>
                                    <th>Fecha</th>
                                    <th>Estatus</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="store.loading">
                                    <td colspan="7" class="text-center">Cargando...</td>
                                </tr>
                                <tr v-for="solicitud in store.solicitudes" :key="solicitud.id">
                                    <td>{{ `${solicitud.solicitante.persona.primer_nombre} ${solicitud.solicitante.persona.primer_apellido}` }}</td>
                                    <td>{{ solicitud.departamento_solicitante?.nombre || 'N/A' }}</td>
                                    <td>{{ solicitud.motivo_solicitud?.descripcion || 'N/A' }}</td>
                                    <td>{{ solicitud.tipo }}</td>
                                    <td>{{ new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES') }}</td>
                                    <td>
                                        <span class="badge" :class="getEstatusClass(solicitud.estatus?.descripcion)">
                                            {{ solicitud.estatus?.descripcion || 'N/A' }}
                                        </span>
                                    </td>
                                    <td>
                                        <!-- Botones solo para Administradores -->
                                        <template v-if="accountStore.isAdmin">
                                            <button class="btn btn-action btn-success" 
                                                @click="atenderSolicitud(solicitud)" 
                                                title="Atender Solicitud / Crear Asignación" 
                                                :disabled="solicitud.estatus?.descripcion !== 'Pendiente'">
                                                <IconCheck size="20" stroke-width="1.5" />
                                            </button>
                                            <button class="btn btn-action text-danger" 
                                                @click="rechazarSolicitud(solicitud.id)" title="Rechazar" 
                                                :disabled="solicitud.estatus?.descripcion !== 'Pendiente'">
                                                <IconX size="20" stroke-width="1.5" />
                                            </button>
                                        </template>
                                       
                                    </td>
                                </tr>
                                <tr v-if="!store.loading && store.solicitudes.length === 0">
                                    <td colspan="7" class="text-center">No se encontraron solicitudes.</td>
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
import { useAccountStore } from '@/stores/account';
import HeaderPage from '@/components/page/header/Component.vue';
import { useRouter } from 'vue-router';
import FooterPage from '@/components/page/footer/Component.vue';
import SolicitudForm from '@/components/forms/SolicitudForm.vue';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue';
import SearchInput from '@/components/paginacion/searchInput.vue';

const router = useRouter();
const store = useSolicitudStore();
const accountStore = useAccountStore();
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

const atenderSolicitud = (solicitud) => {
    if (solicitud.tipo === 'ASIGNACION') {
        // Redirige al formulario de creación de asignación
        router.push({ path: '/asignaciones/crear', query: { solicitud_id: solicitud.id } });
    } else if (solicitud.tipo === 'DESINCORPORACION') {
        // Redirige al formulario de creación de desincorporación
        router.push({ path: '/desincorporaciones/crear', query: { solicitud_id: solicitud.id } });
    }
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