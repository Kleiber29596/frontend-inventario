<template>
    <div class="nav-item dropdown d-flex me-3">
        <a href="#" class="nav-link px-0" data-bs-toggle="dropdown" tabindex="-1" aria-label="Show notifications" @click="onBellClick">
            <font-awesome-icon icon="fa-solid fa-bell" />
            <span v-if="store.unreadCount > 0" class="badge bg-red badge-pill">{{ store.unreadCount }}</span>
        </a>
        <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Últimas Notificaciones</h3>
                </div>
                <div class="list-group list-group-flush list-group-hoverable">
                    <div v-if="store.loading" class="text-center p-3">
                        <div class="spinner-border spinner-border-sm" role="status"></div>
                        <span class="ms-2">Cargando...</span>
                    </div>

                    <div v-else-if="store.notifications.length === 0" class="text-center p-3 text-muted">
                        No tienes notificaciones nuevas.
                    </div>

                    <div v-else v-for="notification in store.notifications" :key="notification.id" class="list-group-item" @click="handleNotificationClick(notification)">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <span :class="getNotificationStyle(notification.tipo_notificacion).color" class="status-dot status-dot-animated"></span>
                            </div>
                            <div class="col text-truncate">
                                <a href="#" class="text-body d-block text-decoration-none" @click.prevent>{{ notification.mensaje }}</a>
                                <div class="d-block text-muted text-truncate mt-n1">
                                    {{ timeAgo(notification.fecha_creacion) }}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { timeAgo, getNotificationStyle } from '@/components/page/navbartop/timeAgo.js';

const store = useNotificationStore();

const onBellClick = () => {
    // Si la lista ya está cargada y no hay notificaciones, no recargar.
    // Si hay notificaciones, recargar para obtener las últimas.
    if (store.notifications.length > 0 || store.unreadCount > 0) {
        store.fetchNotifications();
    }
};

const handleNotificationClick = (notification) => {
    // Cierra el dropdown manualmente
    const dropdownElement = document.querySelector('.nav-item.dropdown.show');
    if (dropdownElement) {
        const dropdown = new bootstrap.Dropdown(dropdownElement.querySelector('[data-bs-toggle="dropdown"]'));
        dropdown.hide();
    }
    store.markAsReadAndNavigate(notification);
};

onMounted(() => {
    store.startPolling();
});

onUnmounted(() => {
    store.stopPolling();
});
</script>

<style scoped>
.list-group-item {
    cursor: pointer;
}
.badge-pill {
    position: absolute;
    top: 5px;
    right: -5px;
    font-size: 0.65rem;
    padding: 0.2em 0.4em;
}
</style>