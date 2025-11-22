<template>
    <div class="sidebar pt-3 pb-2 rounded-0 d-none d-lg-block">
        <div class="d-flex justify-content-between ps-3 pe-3">
            <div class="d-flex gap-2">
                <!-- Form search -->
                <FormSearch />
            </div>

            <div class="d-flex align-items-center gap-3">
                <ThemeMode />

                <!-- Menú de Notificaciones Dinámico -->
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link px-0" data-bs-toggle="dropdown" tabindex="-1"
                        aria-label="Show notifications">
                        <font-awesome-icon :icon="['fas', 'bell']" class="icon-style text-secondary" />
                        <!-- Punto rojo que aparece si hay notificaciones -->
                        <span v-if="totalNotificaciones > 0" class="badge bg-red notification-badge">
                            {{ totalNotificaciones }}
                        </span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card">
                        <div class="card notification-card">
                            <div class="card-header notification-header">
                                <h3 class="card-title">Solicitudes Pendientes!</h3>
                            </div>
                            <div class="list-group list-group-flush list-group-hoverable">

                                <!-- Notificación de Solicitudes Pendientes -->
                                <div v-if="totalNotificaciones > 0">
                                    <div v-for="solicitud in notificationStore.solicitudes_pendientes"
                                        :key="solicitud.id" class="list-group-item notification-item">
                                        <RouterLink to="/solicitudes" class="text-decoration-none text-body">
                                            <div class="row align-items-center">
                                                <div class="col-auto">
                                                    <span
                                                        class="status-dot status-dot-animated bg-red d-block notification-dot"></span>
                                                </div>
                                                <div class="col">
                                                    <div class="fw-bold notification-code">Nro: {{ solicitud.codigo }}</div>
                                                    <div class="text-muted small notification-department">
                                                       Departamento: {{ solicitud.departamento_nombre }}
                                                    </div>
                                                    <!-- Nuevos elementos para tipo y motivo -->
                                                    <div class="notification-details mt-2">
                                                        <span class="notification-tag notification-type">
                                                            {{ solicitud.tipo }}
                                                        </span>
                                                        <span class="notification-tag notification-reason">
                                                            {{solicitud.motivo }}
                                                        </span>
                                                    </div>
                                                    <div class="text-muted small notification-date">
                                                        {{ formatRelativeTime(solicitud.fecha_solicitud) }}
                                                    </div>
                                                </div>
                                            </div>
                                        </RouterLink>
                                    </div>
                                </div>

                                <!-- Mensaje si no hay notificaciones -->
                                <div v-if="totalNotificaciones === 0"
                                    class="list-group-item text-center text-muted empty-notifications">
                                    <div class="empty-icon">
                                        <font-awesome-icon :icon="['fas', 'bell-slash']" />
                                    </div>
                                    <div>No hay notificaciones nuevas.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="navbar-nav flex-row">
                    <div class="nav-item dropdown">
                        <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown"
                            aria-label="Open user menu">
                            <span class="avatar avatar-sm rounded-circle user-avatar"
                                :style="{ backgroundImage: `url(${avatar})` }"></span>
                            <div class="d-none d-xl-block ps-2 user-info">
                                <div class="username">{{ storeAccount.user?.username || 'Usuario' }}</div>
                                <div class="mt-1 small text-muted user-email">{{ storeAccount.user?.email || 'Sin email'
                                    }}</div>
                            </div>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                            <RouterLink to="/profile" class="dropdown-item">Configuración</RouterLink>
                            <div class="dropdown-divider"></div>
                            <button @click="exit" class="dropdown-item">Cerrar sesión</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import FormSearch from './FormSearch.vue'
import ThemeMode from './ThemeMode.vue'
import avatar from '@/assets/img/perfil_default.png';
import { RouterLink, useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore';
import { onMounted, onUnmounted, computed } from 'vue';
import { useAccountStore } from '@/stores/account';

const router = useRouter();

const storeAccount = useAccountStore();
const notificationStore = useNotificationStore();

// Iniciar y detener la búsqueda de notificaciones cuando el componente se monta/desmonta
onMounted(() => {
    notificationStore.startPolling();
});

onUnmounted(() => {
    notificationStore.stopPolling();
});

// Propiedad computada para el total de notificaciones (solo solicitudes)
const totalNotificaciones = computed(() => {
    return notificationStore.solicitudes_pendientes.length || 0;
});

async function exit() {
    await storeAccount.logout(router)
}

// Función para formatear la fecha
const formatRelativeTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};
</script>

<style scoped>
.sidebar {
    margin-left: 15rem;
}

/* Estilos mejorados para notificaciones */
.notification-badge {
    position: absolute;
    top: -6px;
    right: -5px;
    font-size: 0.7rem;
    padding: 0.25em 0.4em;
}

.dropdown-menu {
    position: absolute;
    top: 10px !important;
    right: -3px !important;
    width: 380px;
    border: none;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
}

.notification-card {
    border: none;
    border-radius: 12px;
    overflow: hidden;
}

.notification-header {
    background-color: #4361ee;
    color: white;
    padding: 15px 20px;
    border-bottom: none;
}

.notification-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.notification-item {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    cursor: pointer;
}

.notification-item:hover {
    background-color: #f8f9ff;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #f72585;
}

.notification-code {
    font-weight: 600;
    color: #4361ee;
    margin-bottom: 4px;
}

.notification-department {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 6px;
}

.notification-details {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.notification-tag {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
}

.notification-type {
    background-color: #e9ecef;
    color: #495057;
}

.notification-reason {
    background-color: #dbeafe;
    color: #4361ee;
}

.notification-date {
    font-size: 0.75rem;
    color: #adb5bd;
    margin-top: 4px;
}

.empty-notifications {
    padding: 40px 20px;
    text-align: center;
    color: #6c757d;
}

.empty-icon {
    font-size: 2rem;
    color: #dee2e6;
    margin-bottom: 15px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e9ecef;
    background-size: cover;
    background-position: center;
}

.user-info {
    margin-left: 12px;
}

.username {
    font-weight: 600;
    margin-bottom: 2px;
}

.user-email {
    font-size: 0.875rem;
    color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
    .dropdown-menu {
        width: 320px;
    }

    .sidebar {
        margin-left: 0;
    }
}
</style>