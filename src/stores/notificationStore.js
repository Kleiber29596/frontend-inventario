import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

export const useNotificationStore = defineStore('notification', () => {
    const router = useRouter();

    const unreadCount = ref(0);
    const notifications = ref([]);
    const loading = ref(false);
    let pollingInterval = null;

    /**
     * Obtiene el número de notificaciones no leídas desde la API.
     */
    async function fetchUnreadCount() {
        try {
            const response = await axios.get('/notificaciones/unread_count');
            unreadCount.value = response.data.count;
        } catch (error) {
            console.error('Error al obtener el conteo de notificaciones:', error);
            // Opcional: podrías mostrar una alerta si falla repetidamente
        }
    }

    /**
     * Obtiene la lista de notificaciones no leídas.
     */
    async function fetchNotifications() {
        loading.value = true;
        try {
            const response = await axios.get('/notificaciones/');
            notifications.value = response.data;
        } catch (error) {
            console.error('Error al obtener las notificaciones:', error);
            useToast().showToast('No se pudieron cargar las notificaciones.', 'error');
            notifications.value = [];
        } finally {
            loading.value = false;
        }
    }

    /**
     * Marca una notificación como leída y navega a la URL relacionada.
     * @param {object} notification - El objeto de notificación.
     */
    async function markAsReadAndNavigate(notification) {
        // Optimistic UI update: remove notification from list immediately
        const index = notifications.value.findIndex(n => n.id === notification.id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
        if (unreadCount.value > 0) {
            unreadCount.value--;
        }

        try {
            await axios.post(`/notificaciones/${notification.id}/marcar-leida`);
            // La navegación ocurre después de que la API confirma
            if (notification.url_relacionada) {
                router.push(notification.url_relacionada);
            }
        } catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
            useToast().showToast('Error al actualizar la notificación.', 'error');
            // Revertir si falla (opcional, pero bueno para la consistencia de datos)
            fetchNotifications();
            fetchUnreadCount();
        }
    }

    /**
     * Inicia el polling para verificar nuevas notificaciones periódicamente.
     */
    function startPolling() {
        // Asegurarse de que no haya un intervalo anterior en ejecución
        if (pollingInterval) clearInterval(pollingInterval);

        fetchUnreadCount(); // Llamada inicial
        pollingInterval = setInterval(fetchUnreadCount, 60000); // Cada 60 segundos
    }

    /**
     * Detiene el polling.
     */
    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    return {
        unreadCount, notifications, loading,
        fetchUnreadCount, fetchNotifications, markAsReadAndNavigate,
        startPolling, stopPolling
    };
});