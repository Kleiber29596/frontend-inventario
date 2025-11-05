<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'lightbulb']" text="Motivos" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Motivos</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <!-- Assuming no direct creation from this view, or it opens a generic form -->
                                <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Motivo</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>Tipo</th>
                                        <th>Activo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="5" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="motivo in store.motivos" :key="motivo.id">
                                        <td>{{ motivo.id }}</td>
                                        <td>{{ motivo.descripcion }}</td>
                                        <td>{{ motivo.tipo }}</td>
                                        <td>
                                            <span :class="['badge', motivo.activo ? 'bg-success' : 'bg-danger']">
                                                {{ motivo.activo ? 'Sí' : 'No' }}
                                            </span>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(motivo)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteMotivo(motivo.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.motivos.length === 0">
                                        <td colspan="5" class="text-center">No se encontraron motivos.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.motivos.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
                        <ul class="pagination m-0 ms-auto">
                            <li class="page-item" :class="{ disabled: !store.paginacion.anterior }">
                                <a class="page-link" href="#" @click.prevent="changePage(store.paginacion.pagina_actual - 1)">anterior</a>
                            </li>
                            <li class="page-item" v-for="page in store.paginacion.paginas" :key="page" :class="{ active: page === store.paginacion.pagina_actual }">
                                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: !store.paginacion.siguiente }">
                                <a class="page-link" href="#" @click.prevent="changePage(store.paginacion.pagina_actual + 1)">siguiente</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <MotivoForm :motivo="selectedMotivo" :showModal="showMotivoModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMotivoStore } from '@/stores/motivoStore';
import HeaderPage from '@/components/page/header/Component.vue';
import MotivoForm from '@/components/forms/MotivoForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useMotivoStore();
const selectedMotivo = ref(null);
const showMotivoModal = ref(false);

onMounted(() => {
    store.fetchMotivos();
});

const openModal = (motivo = null) => {
    selectedMotivo.value = motivo;
    showMotivoModal.value = true;
};

const closeModal = () => {
    showMotivoModal.value = false;
    selectedMotivo.value = null;
    store.fetchMotivos();
};

const deleteMotivo = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este motivo?')) {
        // Assuming a deleteMotivo action will be added to the store if needed
        // await store.deleteMotivo(id);
        alert('Funcionalidad de eliminación no implementada para motivos.');
        store.fetchMotivos();
    }
};

const search = () => {
    store.fetchMotivos(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchMotivos(page, store.searchTerm);
    }
};
</script>
