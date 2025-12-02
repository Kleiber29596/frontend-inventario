import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useEstadisticasStore = defineStore('estadisticas', {
  state: () => ({
    statsPorCondicion: {
      labels: [],
      series: [],
    },
    statsPorEstatus: {
      labels: [],
      series: [],
    },
    loading: false,
  }),
  actions: {
    async fetchEstadisticas() {
      if (this.loading) return;
      this.loading = true;
      try {
        // Hacemos las dos peticiones en paralelo para mayor eficiencia
        const [resCondicion, resEstatus] = await Promise.all([
          axios.get(`${BASE_URL}estadisticas/bienes-por-condicion`),
          axios.get(`${BASE_URL}estadisticas/bienes-por-estatus`),
        ]);

        this.statsPorCondicion = resCondicion.data;
        this.statsPorEstatus = resEstatus.data;

      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        // Opcional: mostrar un toast de error
      } finally {
        this.loading = false;
      }
    },
  },
});