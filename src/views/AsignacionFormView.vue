<template>
    <main class="page-wrapper">
        <!-- Usamos un ícono y texto apropiado para la cabecera -->
        <HeaderPage :icon="['fas', 'clipboard-check']" text="Gestión de Asignación" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div class="card">
                    <div class="card-header">
                        <!-- El título cambiará si estamos editando o creando -->
                        <h3 class="card-title">{{ isEditMode ? 'Editar Asignación' : 'Crear Nueva Asignación' }}</h3>
                    </div>
                    <div class="card-body">
                        <!-- Aquí es donde irá tu componente de formulario -->
                        <AsignacionPageForm />
                    </div>
                </div>
            </div>
        </div>
        <FooterPage />
    </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import HeaderPage from '@/components/page/header/Component.vue';
import FooterPage from '@/components/page/footer/Component.vue';
import AsignacionPageForm from '@/components/forms/AsignacionPageForm.vue';

const route = useRoute();

// Comprobamos si la URL contiene un ID para saber si estamos en modo edición
const isEditMode = computed(() => !!route.params.id);

</script>