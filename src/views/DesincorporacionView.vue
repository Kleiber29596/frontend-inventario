<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'trash-alt']" text="Desincorporaciones" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Desincorporaciones</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nueva Desincorporación</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Motivo</th>
                                        <th>Fecha de Inicio</th>
                                        <th>Persona Responsable</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="6" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="desincorporacion in store.desincorporaciones" :key="desincorporacion.id">
                                        <td>{{ desincorporacion.id }}</td>
                                        <td>{{ desincorporacion.motivo.descripcion}} </td>
                                        <td>{{ desincorporacion.fecha_inicio }}</td>
                                        <td>{{ desincorporacion.persona_responsable.primer_nombre + ' ' + desincorporacion.persona_responsable.primer_apellido}}</td>
                                        <td><span class="badge bg-danger">{{ desincorporacion.estatus.descripcion}}</span></td>
                                        
                                            <!-- <button class="btn btn-sm btn-warning" @click="openModal(desincorporacion)">Editar</button> -->
                                        <td>
                                            <a class="btn btn-action" @click="openModal(desincorporacion)">
                                            <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" @click="openDevolucionModal(asignacion)">
                                            <IconArrowBack size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                      
                                    </tr>
                                    <tr v-if="!store.loading && store.desincorporaciones.length === 0">
                                        <td colspan="6" class="text-center">No se encontraron desincorporaciones.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.desincorporaciones.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <DesincorporacionForm :desincorporacion="selectedDesincorporacion" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';
import HeaderPage from '@/components/page/header/Component.vue';
import DesincorporacionForm from '@/components/forms/DesincorporacionForm.vue';
import { Modal } from 'bootstrap';
import { IconEdit, IconArrowBack } from '@tabler/icons-vue';
const store = useDesincorporacionStore();
const selectedDesincorporacion = ref(null);
let modalInstance = null;

onMounted(() => {
    store.fetchDesincorporaciones();
    store.fetchCatalogos();
    modalInstance = new Modal(document.getElementById('desincorporacionModal'));
});

const openModal = (desincorporacion = null) => {
    selectedDesincorporacion.value = desincorporacion;
    modalInstance.show();
};

const closeModal = () => {
    modalInstance.hide();
    selectedDesincorporacion.value = null;
    store.fetchDesincorporaciones(); // Recargar lista al cerrar
};

const search = () => {
    store.fetchDesincorporaciones(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchDesincorporaciones(page, store.searchTerm);
    }
};

</script>