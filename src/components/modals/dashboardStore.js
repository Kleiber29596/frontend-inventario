import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';
import { format } from 'date-fns';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    // Estado rediseñado para las nuevas APIs
    stats: {
      operacionesPorEstatus: [], // Para la gráfica de estatus de bienes
      resumenOperaciones: {      // Para las tarjetas y la nueva gráfica de solicitudes
        solicitudes: [],
        asignaciones: 0,
        desincorporaciones: 0,
        devoluciones: 0,
      },
      tendenciaBienes: [], // Para la nueva gráfica lineal
    },
  }),
  actions: {
    /**
     * Busca todas las estadísticas del dashboard para un rango de fechas específico.
     * @param {Date} fechaInicio - La fecha de inicio del rango.
     * @param {Date} fechaFin - La fecha de fin del rango.
     */
    async fetchDashboardStats(fechaInicio, fechaFin) {
      this.loading = true;
      // Formateamos las fechas al formato YYYY-MM-DD que espera la API
      const params = {
        fecha_inicio: format(fechaInicio, 'yyyy-MM-dd'),
        fecha_fin: format(fechaFin, 'yyyy-MM-dd'),
      };

      try {
        // Hacemos las dos nuevas llamadas en paralelo
        const [operacionesRes, resumenRes, tendenciaRes] = await Promise.all([
          axios.get(`${BASE_URL}dashboard/estadisticas/operaciones`, { params }),
          axios.get(`${BASE_URL}dashboard/estadisticas/resumen_operaciones`, { params }),
          axios.get(`${BASE_URL}dashboard/estadisticas/tendencia_bienes`, { params }),
        ]);

        // Transformamos la respuesta de 'operaciones' al formato que necesita la gráfica
        const datosOperaciones = operacionesRes.data;
        this.stats.operacionesPorEstatus = [
          { label: 'Disponibles', total: datosOperaciones.bienes_disponibles || 0 },
          { label: 'Asignados', total: datosOperaciones.bienes_asignados || 0 },
          { label: 'Desincorporados', total: datosOperaciones.bienes_desincorporados || 0 },
        ];

        this.stats.resumenOperaciones = resumenRes.data;
        this.stats.tendenciaBienes = tendenciaRes.data;

      } catch (error) {
        console.error("Error al obtener las estadísticas del dashboard:", error);
        useToast().showToast('No se pudieron cargar las estadísticas.', 'error');
        // Reseteamos los datos en caso de error para evitar mostrar información incorrecta
        this.stats.operacionesPorEstatus = [];
        this.stats.resumenOperaciones = { solicitudes: [], asignaciones: 0, desincorporaciones: 0, devoluciones: 0 };
        this.stats.tendenciaBienes = [];
      } finally {
        this.loading = false;
      }
    },
  },
});