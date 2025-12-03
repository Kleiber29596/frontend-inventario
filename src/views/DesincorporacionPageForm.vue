<template>
    <main class="page-wrapper">
        <HeaderPage :icon="['fas', 'trash-alt']" text="Nueva Desincorporación" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div class="card">
                    <div class="card-header">
                        <!-- El título cambiará si estamos editando o creando -->
                        <h3 class="card-title">{{ isEditMode ? 'Editar Desincorporación' : 'Crear Nueva Desincorporación' }}</h3>
                    </div>
                    <div class="card-body">
                         <!-- Barra de Progreso -->
                    <div class="steps">
                        <a v-for="step in steps" :key="step.id" class="step-item" :class="{
                            'active': currentStep === step.id,
                            'completed': currentStep > step.id
                        }">
                            <div class="step-progress">
                                <span class="step-number">{{ step.id }}</span>
                            </div>
                            <div class="step-label">{{ step.title }}</div>
                        </a>
                    </div>
                        <div v-if="store.loading && !store.solicitud" class="text-center p-5">
                            <div class="spinner-border" role="status"></div>
                            <p class="mt-2">Cargando datos de la solicitud...</p>
                        </div>

                        <form v-else-if="store.solicitud" @submit.prevent="handleSubmit">
                            <!-- Paso 1: Verificación de Datos -->
                            <div v-if="currentStep === 1">
                                <h4 class="mb-4">Paso 1: Verificación de Datos de la Solicitud</h4>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Departamento Solicitante</label>
                                        <input type="text" class="form-control" :value="store.solicitud.departamento_solicitante.nombre" readonly>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Solicitante</label>
                                        <input type="text" class="form-control" :value="`${store.solicitud.solicitante.persona.primer_nombre} ${store.solicitud.solicitante.persona.primer_apellido}`" readonly>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Motivo de la Solicitud</label>
                                        <input type="text" class="form-control" :value="store.solicitud.motivo_solicitud.descripcion" readonly>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Fecha de la Solicitud</label>
                                        <input type="text" class="form-control" :value="new Date(store.solicitud.fecha_solicitud).toLocaleDateString('es-ES')" readonly>
                                    </div>
                                </div>
                            </div>

                            <!-- Paso 2: Detalles de la Desincorporación -->
                            <div v-if="currentStep === 2">
                                <h4 class="mb-4">Paso 2: Detalles de la Desincorporación</h4>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="fecha_desincorporacion" class="form-label required">Fecha de Desincorporación</label>
                                        <input type="date" class="form-control" id="fecha_desincorporacion" v-model="form.fecha_desincorporacion">
                                    </div>
                                </div>
                                <h5 class="mt-3">Bienes a Desincorporar</h5>
                                <div class="table-responsive">
                                    <table class="table table-vcenter card-table table-striped">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Bien</th>
                                                <th>Serial</th>
                                                <th style="width: 30%;">Condición Final</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(detalle, index) in form.detalles" :key="detalle.bien_id">
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ detalle.bien_label }}</td>
                                                <td>{{ detalle.bien_serial }}</td>
                                                <td>
                                                    <!-- Campo de solo lectura para la condición final -->
                                                    <input type="text" class="form-control" :value="getCondicionNombre(detalle.condicion_final_id)" readonly>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Paso 3: Resumen y Confirmación -->
                            <div v-if="currentStep === 3">
                                <h4 class="mb-4">Paso 3: Resumen y Confirmación</h4>
                                <div class="card card-body">
                                    <p><strong>Departamento:</strong> {{ store.solicitud.departamento_solicitante.nombre }}</p>
                                    <p><strong>Solicitante:</strong> {{ `${store.solicitud.solicitante.persona.primer_nombre} ${store.solicitud.solicitante.persona.primer_apellido}` }}</p>
                                    <p><strong>Motivo:</strong> {{ store.solicitud.motivo_solicitud.descripcion }}</p>
                                    <p><strong>Fecha de Desincorporación:</strong> {{ formatDisplayDate(form.fecha_desincorporacion) }}</p>
                                    <hr>
                                    <h5>Bienes a Desincorporar</h5>
                                    <ul class="list-group">
                                        <li v-for="detalle in form.detalles" :key="detalle.bien_id" class="list-group-item">
                                            {{ detalle.bien_label }} - <strong>Condición:</strong> {{ getCondicionNombre(detalle.condicion_final_id) }}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Navegación de Pasos -->
                            <div class="d-flex justify-content-between mt-4">
                                <button type="button" class="btn btn-light" @click="cancel" v-if="currentStep === 1">Cancelar</button>
                                <button type="button" class="btn btn-secondary" @click="prevStep" v-if="currentStep > 1">Anterior</button>
                                <button type="button" class="btn btn-primary" @click="nextStep" v-if="currentStep < 3" :disabled="!canProceed">Siguiente</button>
                                <button type="submit" class="btn btn-success" :disabled="store.loading || !canSubmit" v-if="currentStep === 3">
                                    <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Confirmar y Registrar Desincorporación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <FooterPage />
    </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';
import { useBienesStore } from '@/stores/bienesStore';
import HeaderPage from '@/components/page/header/Component.vue';
import FooterPage from '@/components/page/footer/Component.vue';
import CustomVueSelect from '@/components/select/select-vue.vue';

const store = useDesincorporacionStore();
const bienesStore = useBienesStore();
const route = useRoute();
const router = useRouter();

const currentStep = ref(1);
const steps = ref([
    { id: 1, title: 'Verificación' },
    { id: 2, title: 'Detalles' },
    { id: 3, title: 'Confirmación' }
]);

const form = ref({
    solicitud_id: null,
    fecha_desincorporacion: new Date().toISOString().slice(0, 10),
    detalles: [],
});

onMounted(async () => {
    const solicitudId = route.query.solicitud_id;
    if (solicitudId) {
        await store.fetchSolicitudParaDesincorporar(solicitudId);
        if (store.solicitud) {
            form.value.solicitud_id = store.solicitud.id;
            // Pre-llenamos los detalles con los bienes de la solicitud
            // Usamos el bienesStore para obtener la información completa de cada bien.
            const detallesPromises = store.solicitud.detalles.map(async (d) => {
                const bienInfo = await bienesStore.fetchBienById(d.bien.id);
                return {
                    bien_id: bienInfo.id,
                    bien_label: bienInfo.tipo_bien.descripcion + ' ' + bienInfo.modelo.descripcion + ' ' + bienInfo.marca.descripcion, // Descripción completa del bien
                    bien_serial: bienInfo.serial_bien, // Serial del bien
                    condicion_final_id: bienInfo.estado_fisico, // Precargamos la condición actual del bien
                };
            });
            form.value.detalles = await Promise.all(detallesPromises);
        }
    } else {
        router.push('/solicitudes'); // Si no hay ID, no podemos continuar
    }
});

const canProceed = computed(() => {
    if (currentStep.value === 2) {
        // Todos los bienes deben tener una condición final seleccionada
        return form.value.detalles.every(d => d.condicion_final_id);
    }
    return true;
});

const canSubmit = computed(() => canProceed.value);

const getCondicionNombre = (id) => {
    // El v-model del select guarda el objeto completo, no solo el id.
    // O puede ser solo el ID si viene precargado.
    if (typeof id === 'object' && id !== null && id.nombre) {
        return id.nombre;
    }
    // Si 'id' es un número (el ID), buscamos en el catálogo
    if (typeof id === 'number' && store.catalogs.estadosFisicos) {
        const condicion = store.catalogs.estadosFisicos.find(e => e.id === id);
        return condicion ? condicion.nombre : 'Condición no encontrada';
    }
    return 'N/A';
};

const cancel = () => router.push('/desincorporaciones');
const nextStep = () => { if (currentStep.value < 3 && canProceed.value) currentStep.value++; };
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

// Función para formatear fechas para visualización
const formatDisplayDate = (dateString) => {
    if (!dateString) return null;
    // Aseguramos que la fecha se interprete como UTC para evitar problemas de zona horaria
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const handleSubmit = async () => {
    if (!canSubmit.value) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }


    const payload = {
        solicitud_id: form.value.solicitud_id,
        fecha_desincorporacion: form.value.fecha_desincorporacion,
        persona_responsable_id: store.solicitud.solicitante.id, // Añadimos el ID del responsable
        departamento_id: store.solicitud.departamento_solicitante.id, // Añadimos el ID del departamento
        motivo_id: store.solicitud.motivo_solicitud.id, // Añadimos el ID del motivo de la solicitud
        bienes: form.value.detalles.map(d => ({
            bien_id: d.bien_id,
            descripcion: d.bien_label, // El backend espera una descripción para el detalle
            condicion_final_id: (typeof d.condicion_final_id === 'object' && d.condicion_final_id !== null) ? d.condicion_final_id.id : d.condicion_final_id,
        })),
    };

    try {
        const response = await store.createDesincorporacion(payload);
        if (response) {
            router.push('/desincorporaciones');
        }
    } catch (error) {
        console.error("Error en el submit de desincorporación:", error);
    }
};
</script>

<style scoped>
/* Estilos para la barra de progreso (igual que en AsignacionPageForm) */
.steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    position: relative;
}
.steps::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #e9ecef;
    z-index: 1;
}
.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    text-decoration: none;
    color: #6c757d;
    flex: 1;
}
.step-progress {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}
.step-number { font-weight: bold; color: #6c757d; }
.step-label { font-size: 0.875rem; text-align: center; max-width: 100px; }
.step-item.active .step-progress { background-color: #007bff; border-color: #007bff; }
.step-item.active .step-number { color: white; }
.step-item.active .step-label { color: #007bff; font-weight: bold; }
.step-item.completed .step-progress { background-color: #28a745; border-color: #28a745; }
.step-item.completed .step-number { color: white; }
.step-item.completed .step-label { color: #28a745; }
</style>