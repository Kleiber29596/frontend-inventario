<script setup>
import { computed } from 'vue';
import { useAlertStore } from '@/stores/useAlertStore'; // 1. Importar el nuevo store de alertas
import svg from '../../assets/svg/icons-svg.json';

// Define las props
const props = defineProps(['scope']);

const alertStore = useAlertStore(); // 2. Usar el store de alertas

// Filtrar alertas por el `scope` actual
const scopedAlerts = computed(() => {
    // 3. Filtrar las alertas que coincidan con el 'scope' del componente
    return alertStore.alerts.filter(alert => alert.scope === props.scope);
});

function removeAlert(id) {
    alertStore.removeAlert(id);
}
</script>

<template>
    <div>
        <div v-for="(alert, index) in scopedAlerts" :key="index" :class="`alert alert-${alert.type}`" role="alert">
            <div class="d-flex">
                <div>
                    <div v-if="alert.type === 'success'" v-html="svg.success"></div>
                    <div v-if="alert.type === 'info'" v-html="svg.info"></div>
                    <div v-if="alert.type === 'warning'" v-html="svg.warning"></div>
                    <div v-if="alert.type === 'danger'" v-html="svg.danger"></div>
                </div>
                <div>
                    <h4 class="alert-title">{{ alert.title }}</h4>
                    <div class="text-secondary">{{ alert.message }}</div>
                </div>
            </div>
            <a class="btn-close" @click="removeAlert(alert.id)" aria-label="close"></a>
        </div>
    </div>
</template>
