<template>
    <main class="page-wrapper">
        <!-- Encabezado de la página -->
        <HeaderPage :icon="['fas', 'chart-pie']" text="Dashboard" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <!-- Aquí integramos nuestro componente de estadísticas -->
                <DashboardStats />
            </div>
        </div>

        <FooterPage />
    </main>
</template>

<script setup>
import HeaderPage from '@/components/page/header/Component.vue';
import FooterPage from '@/components/page/footer/Component.vue';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
</script>