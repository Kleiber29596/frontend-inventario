<template>
    <div class="row g-4">
        <!-- Gráfica Donut de Bienes por Estatus -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Distribución de Bienes por Estatus</h3>
                </div>
                <div class="card-body">
                    <div v-if="store.loading" class="text-center">Cargando...</div>
                     <div v-else-if="!seriesEstatus.every(v => v === 0)">
                        <apexchart type="donut" height="350" :options="chartOptionsEstatus" :series="seriesEstatus"></apexchart>
                    </div>
                    <div v-else class="text-center text-muted">No hay datos disponibles para el rango de fechas seleccionado.</div>
                </div>
            </div>
        </div>

        <!-- Nueva Gráfica de Barras para Resumen de Solicitudes -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Resumen de Solicitudes</h3>
                </div>
                <div class="card-body">
                    <div v-if="store.loading" class="text-center">Cargando...</div>
                    <div v-else-if="chartOptionsSolicitudes.xaxis.categories.length > 0">
                        <apexchart type="bar" height="350" :options="chartOptionsSolicitudes" :series="seriesSolicitudes"></apexchart>
                    </div>
                    <div v-else class="text-center text-muted">No hay datos disponibles para el rango de fechas seleccionado.</div>
                </div>
            </div>
        </div>

        <!-- NUEVA Gráfica Lineal de Bienes Creados -->
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tendencia de Creación de Bienes</h3>
                </div>
                <div class="card-body">
                    <div v-if="store.loading" class="text-center">Cargando...</div>
                    <div v-else-if="seriesLineal[0].data.length > 0">
                        <apexchart type="line" height="350" :options="chartOptionsLineal" :series="seriesLineal"></apexchart>
                    </div>
                    <div v-else class="text-center text-muted">No hay datos de tendencia para mostrar en el rango seleccionado.</div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '@/components/modals/dashboardStore';
import VueApexCharts from 'vue3-apexcharts';

// Renombramos el import para evitar conflictos si se usa en el template
const apexchart = VueApexCharts;

const store = useDashboardStore();

const baseChartOptions = {
    chart: {
        type: 'donut',
        height: 350,
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }],
    legend: {
      position: 'bottom'
    },
    // --- GRADIENTE LLAMATIVO ---
    fill: {
        type: 'gradient',
        gradient: {
            // Cambiamos a un gradiente más dinámico
            shade: 'light',
            type: "horizontal",
            shadeIntensity: 0.7,
            inverseColors: true, // Invierte el gradiente para un efecto más vistoso
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 90, 100] // Puntos de parada para el color del gradiente
        }
    },
    // --- NUEVA CONFIGURACIÓN ---
    // Esto mostrará las etiquetas dentro de cada sección de la dona.
    dataLabels: {
        enabled: true,
        // El 'formatter' nos permite personalizar el texto.
        // 'val' es el porcentaje de la sección.
        formatter: function (val) {
            return val.toFixed(1) + '%'; // Mostramos el porcentaje con un decimal
        },
        style: {
            colors: ['#fff'] // Forzamos el color del texto a blanco
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            color: '#000',
            opacity: 0.5
        }
    }
};

// --- Lógica para la gráfica de Estatus (Adaptada) ---
const seriesEstatus = computed(() => {
    // Ahora que los datos son un array, mapeamos para obtener solo los totales.
    const data = store.stats.operacionesPorEstatus || [];
    return data.map(item => item.total);
});

const chartOptionsEstatus = computed(() => {
    // Las etiquetas también se extraen del nuevo formato de datos.
    const data = store.stats.operacionesPorEstatus || [];
    const labels = data.map(item => item.label);
    const colors = ['#00E396', '#008FFB', '#FF4560']; // Verde, Azul, Rojo

    return {
        ...baseChartOptions,
        labels,
        colors,
        title: {
            text: 'Bienes por Estatus',
            align: 'center'
        },
    };
});

// --- Lógica para la nueva gráfica de Solicitudes ---
const seriesSolicitudes = computed(() => {
    const data = store.stats.resumenOperaciones.solicitudes || [];
    return [{
        name: 'Total Solicitudes',
        data: data.map(item => item.total)
    }];
});

const chartOptionsSolicitudes = computed(() => {
    const data = store.stats.resumenOperaciones.solicitudes || [];
    const labels = data.map(item => item.label);

    return {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '40%',
                distributed: true, // Cada barra tendrá un color diferente
            },
        },
        dataLabels: { enabled: false },
        legend: { show: false }, // Ocultamos la leyenda porque 'distributed' ya asigna colores
        xaxis: {
            categories: labels,
        },
        yaxis: {
            title: { text: 'Cantidad de Solicitudes' }
        },
        colors: ['#008FFB', '#FF4560'], // Azul para Asignación, Rojo para Desincorporación
    };
});

// --- Lógica para la NUEVA gráfica Lineal ---
const seriesLineal = computed(() => {
    // Los datos deben estar en el formato { x: fecha, y: valor }
    const data = store.stats.tendenciaBienes?.map(item => ({
        x: item.fecha,
        y: item.total
    })) || [];

    return [{
        name: 'Bienes Creados',
        data: data
    }];
});

const chartOptionsLineal = computed(() => {
    return {
        chart: {
            type: 'line',
            height: 350,
            zoom: {
                enabled: true
            },
            toolbar: {
                show: true
            }
        },
        stroke: {
            curve: 'smooth'
        },
        dataLabels: {
            enabled: false
        },
        title: {
            text: 'Bienes Registrados por Día',
            align: 'left'
        },
        xaxis: {
            type: 'datetime',
            labels: {
                format: 'dd MMM yy'
            }
        },
        yaxis: {
            title: {
                text: 'Cantidad de Bienes'
            }
        },
    };
});
</script>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style>