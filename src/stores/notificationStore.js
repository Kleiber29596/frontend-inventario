import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    solicitudes_pendientes: [], // Ahora es un array para guardar las tarjetas
    loading: false,
    // Para controlar el intervalo de actualización
    pollingInterval: null,
  }),

  actions: {
    async fetchSummary() {
      this.loading = true;
      try {
        // Este es el endpoint que tu backend debe tener para que esto funcione
        const response = await axios.get(`${BASE_URL}notificaciones/resumen`); // El backend ahora debe devolver un array
        this.solicitudes_pendientes = Array.isArray(response.data.solicitudes_pendientes) ? response.data.solicitudes_pendientes : [];
      } catch (error) {
        console.error("Error al obtener el resumen de notificaciones:", error);
        // Reseteamos los contadores en caso de error para no mostrar datos viejos
        this.solicitudes_pendientes = [];
      } finally {
        this.loading = false;
      }
    },

    startPolling(interval = 30000) { // Actualiza cada 30 segundos
      this.fetchSummary(); // Llama una vez al inicio
      this.pollingInterval = setInterval(() => this.fetchSummary(), interval);
    },

    stopPolling() {
      clearInterval(this.pollingInterval);
    },
  },
});