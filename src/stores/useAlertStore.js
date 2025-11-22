import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alerts: [], // Aquí se guardarán todas las alertas activas
  }),
  actions: {
    /**
     * Añade una nueva alerta a la lista.
     * @param {object} alert - El objeto de la alerta.
     * @param {string} alert.type - 'success', 'info', 'warning', 'danger'.
     * @param {string} alert.title - El título de la alerta.
     * @param {string} alert.message - El mensaje de la alerta.
     * @param {string} alert.scope - Dónde debe mostrarse la alerta (ej: 'login', 'profile').
     * @param {number} [duration=5000] - Duración en ms antes de desaparecer.
     */
    showAlert({ type, title, message, scope = 'global', duration = 5000 }) {
      const id = Date.now();
      this.alerts.push({ id, type, title, message, scope });

      // Elimina la alerta después de la duración especificada
      setTimeout(() => this.removeAlert(id), duration);
    },
    removeAlert(id) {
      this.alerts = this.alerts.filter(alert => alert.id !== id);
    },
  },
});