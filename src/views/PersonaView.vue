<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'users']" text="Personas" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Personas</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nueva Persona</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cédula</th>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Cargo</th>
                                        <th>Activo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="9" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="persona in store.personas" :key="persona.id">
                                        <td>{{ persona.id }}</td>
                                        <td>{{ persona.cedula }}</td>
                                        <td>{{ persona.primer_nombre }} </td>
                                        <td>{{ persona.primer_apellido }}</td>
                                        <td>{{ persona.cargo }}</td>
                                        <td>
                                            <span :class="['badge', persona.activo ? 'bg-success' : 'bg-danger']">
                                                {{ persona.activo ? 'Sí' : 'No' }}
                                            </span>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(persona)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deletePersona(persona.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.personas.length === 0">
                                        <td colspan="9" class="text-center">No se encontraron personas.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer">
                        <Pagination v-model:page="currentPage" v-model:pageSize="pageSize" :total="store.totalItems" />
                    </div>
                </div>
            </div>
        </div>

        <PersonaForm :persona="selectedPersona" :showModal="showPersonaModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { usePersonaStore } from '@/stores/personaStore';
import HeaderPage from '@/components/page/header/Component.vue';
import PersonaForm from '@/components/forms/PersonaForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = usePersonaStore();
const selectedPersona = ref(null);
const showPersonaModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchPersonas(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (persona = null) => {
    selectedPersona.value = persona;
    showPersonaModal.value = true;
};

const closeModal = () => {
    showPersonaModal.value = false;
    selectedPersona.value = null;
    fetchData();
};

const deletePersona = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta persona?')) {
        await store.deletePersona(id);
        fetchData();
    }
};
</script>
