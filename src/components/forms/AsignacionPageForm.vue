<template>
    <!-- Envolvemos todo en una tarjeta para que el diseño de Tabler funcione -->
    <div class="card">
        <!-- Barra de Progreso estilo Tabler -->
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
        <div class="card-body">
            <form @submit.prevent="handleSubmit">
                <!-- Paso 1: Información General -->
                <div v-if="currentStep === 1">
                    <h4 class="mb-3">Paso 1: Información de la Asignación</h4>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="departamento" class="form-label">Departamento</label>
                            <CustomVueSelect :options="store.catalogs.departamentos" v-model="form.departamento_id"
                                placeholder="Selecciona un departamento..." label="nombre" track-by="id" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="persona" class="form-label">Responsable</label>
                            <CustomVueSelect :options="store.catalogs.personas" v-model="form.persona_id"
                                placeholder="Selecciona una persona..." label="primer_nombre" track-by="id"
                                :disabled="!form.departamento_id" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
                            <input type="date" class="form-control" id="fecha_inicio" v-model="form.fecha_inicio">
                        </div>
                        <div class="col-md mb-3">
                            <label for="motivo" class="form-label">Motivo</label>
                            <CustomVueSelect :options="store.catalogs.motivos" v-model="form.motivo"
                                placeholder="Selecciona un motivo..." label="descripcion" track-by="id" />
                        </div>

                    </div>

                </div>

                <!-- Paso 2: Selección de Bienes -->
                <div v-if="currentStep === 2">
                    <h4 class="mb-3">Paso 2: Selección de Bienes</h4>
                    <div class="mb-3">
                        <label for="bienes-select" class="form-label">Buscar y Agregar Bienes</label>
                        <CustomVueSelect :options="store.bienes" v-model="form.bienes_id"
                            placeholder="Selecciona bienes..." label="label" track-by="id" :multiple="true" />
                    </div>
                </div>

                <!-- Paso 3: Resumen y Confirmación -->
                <div v-if="currentStep === 3">
                    <h4 class="mb-3">Paso 3: Resumen y Confirmación</h4>
                    <div class="card card-body">
                        <p><strong>Departamento:</strong> {{ getDepartamentoNombre }}</p>
                        <p><strong>Responsable:</strong> {{ getPersonaNombre }}</p>
                        <p><strong>Fecha de Inicio:</strong> {{ form.fecha_inicio }}</p>
                        <p><strong>Fecha de fin:</strong> Indeterminada</p>
                        <p><strong>Motivo:</strong> {{ getMotivoNombre }}</p>
                        <hr>
                        <h5>Bienes Seleccionados ({{ form.bienes_id.length }})</h5>
                        <ul class="list-group">
                            <li v-for="bien in form.bienes_id" :key="bien.id" class="list-group-item">{{ bien.label }}
                            </li>
                            <li v-if="form.bienes_id.length === 0" class="list-group-item">No se han seleccionado
                                bienes.
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Navegación de Pasos -->
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-light" @click="cancel"
                        v-if="currentStep === 1">Cancelar</button>
                    <button type="button" class="btn btn-secondary" @click="prevStep"
                        v-if="currentStep > 1">Anterior</button>

                    <button type="button" class="btn btn-primary" @click="nextStep" v-if="currentStep < 3"
                        :disabled="!canProceed">Siguiente</button>
                    <button type="submit" class="btn btn-success" :disabled="store.loading || !canSubmit"
                        v-if="currentStep === 3">
                        <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status"
                            aria-hidden="true"></span>
                        Guardar Asignación
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import { useSolicitudStore } from '@/stores/solicitudStore';
import { useRoute, useRouter } from 'vue-router';
import CustomVueSelect from '@/components/select/select-vue.vue'

const store = useAsignacionStore();
const solicitudStore = useSolicitudStore();
const route = useRoute();
const router = useRouter();

const currentStep = ref(1);
const steps = ref([
    { id: 1, title: 'Información de la Asignación' },
    { id: 2, title: 'Selección de Bienes' },
    { id: 3, title: 'Resumen y Confirmación' }
]);

// Computed para validaciones
const canProceed = computed(() => {
    switch (currentStep.value) {
        case 1:
            return form.value.departamento_id && form.value.persona_id && form.value.fecha_inicio;
        case 2:
            return form.value.bienes_id.length > 0;
        default:
            return true;
    }
});

const canSubmit = computed(() => {
    return form.value.departamento_id && form.value.persona_id &&
        form.value.fecha_inicio && form.value.bienes_id.length > 0;
});

// Computed para mostrar datos en el resumen
const getDepartamentoNombre = computed(() => {
    return form.value.departamento_id?.nombre || 'No seleccionado';
});

const getPersonaNombre = computed(() => {
    if (!form.value.persona_id) return 'No seleccionada';
    const persona = form.value.persona_id;
    return `${persona.primer_nombre}  ${persona.primer_apellido}, ${persona.cargo}`.trim();
});

const getMotivoNombre = computed(() => {
    return form.value.motivo?.descripcion || 'No seleccionado';
});

onMounted(async () => {
    // Cargar catálogos y bienes en paralelo para más eficiencia
    await Promise.all([
        store.fetchCatalogos(),
        store.fetchBienes()
    ]);

    const solicitudId = route.query.solicitud_id;
    if (solicitudId) {
        form.value.solicitud_id = solicitudId;
        try {
            // Obtenemos los datos de la solicitud
            const solicitud = await solicitudStore.fetchSolicitudById(solicitudId);
            if (solicitud) {
                // Pre-cargamos el formulario con los datos de la solicitud
                form.value.departamento_id = solicitud.departamento_solicitante;
                form.value.motivo = solicitud.motivo_solicitud;
                // El solicitante de la solicitud es la persona que recibe la asignación
                form.value.persona_id = solicitud.solicitante.persona;
            }
        } catch (error) {
            console.error("No se pudo pre-cargar el formulario desde la solicitud:", error);
        }
    }
});

const form = ref({
    id: null,
    departamento_id: null,
    persona_id: null,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: null,
    estatus_id: null,
    motivo: null,
    bienes_id: [],
    solicitud_id: null,
});

// Watcher mejorado para evitar reset en carga inicial
let initialLoad = true;

watch(() => form.value.departamento_id, (newVal, oldVal) => {
    // No reseteamos la persona si viene de una solicitud precargada
    if (initialLoad) {
        initialLoad = false;
        return;
    }

    // Solo resetear si realmente cambió el departamento
    const newDepId = newVal?.id;
    const oldDepId = oldVal?.id;

    if (newDepId !== oldDepId) {
        form.value.persona_id = null;
    }

    if (newDepId) {
        store.fetchPersonasPorDepartamento(newDepId);
    }
}, { deep: true });

const cancel = () => {
    router.push('/asignaciones');
};

const nextStep = () => {
    if (currentStep.value < 3 && canProceed.value) {
        currentStep.value++;
    }
};

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const handleSubmit = async () => {
    if (!canSubmit.value) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    const formValue = form.value;

    const payload = {
        departamento_id: formValue.departamento_id?.id || formValue.departamento_id,
        persona_id: formValue.persona_id?.id || formValue.persona_id,
        estatus_id: formValue.estatus_id?.id || formValue.estatus_id,
        fecha_inicio: formValue.fecha_inicio,
        fecha_fin: formValue.fecha_fin,
        motivo: formValue.motivo?.id || formValue.motivo,
        solicitud_id: formValue.solicitud_id,
        bienes: formValue.bienes_id.map(bien => ({
            bien_id: bien.id,
            condicion_retorno: ""
        }))
    };

    try {
        const response = await store.createAsignacion(payload);
        if (response) {
            router.push('/asignaciones');
        }
    } catch (error) {
        alert('Ocurrió un error al guardar la asignación.');
        console.error(error);
    }
};
</script>

<style scoped>
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

.step-number {
    font-weight: bold;
    color: #6c757d;
}

.step-label {
    font-size: 0.875rem;
    text-align: center;
    max-width: 100px;
}

/* Paso activo */
.step-item.active .step-progress {
    background-color: #007bff;
    border-color: #007bff;
}

.step-item.active .step-number {
    color: white;
}

.step-item.active .step-label {
    color: #007bff;
    font-weight: bold;
}

/* Paso completado */
.step-item.completed .step-progress {
    background-color: #28a745;
    border-color: #28a745;
}

.step-item.completed .step-number {
    color: white;
}

.step-item.completed .step-label {
    color: #28a745;
}
</style>