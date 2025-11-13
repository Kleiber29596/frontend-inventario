import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';
import { useSolicitudStore } from '@/stores/solicitudStore';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useDesincorporacionStore = defineStore('desincorporacion', {
  state: () => ({
    solicitud: null, // Contendrá los datos de la solicitud original
    loading: false,
    catalogs: {
      estadosFisicos: [], // Para la "Condición Final" de los bienes
    },
  }),
  actions: {
    /**
     * Carga los datos de la solicitud de desincorporación para pre-rellenar el formulario.
     * @param {number} solicitudId - El ID de la solicitud a procesar.
     */
    async fetchSolicitudParaDesincorporar(solicitudId) {
      if (!solicitudId) {
        this.solicitud = null;
        return;
      }
      this.loading = true;
      const solicitudStore = useSolicitudStore();
      try {
        // Reutilizamos la acción del store de solicitudes para obtener los datos
        const data = await solicitudStore.fetchSolicitudById(solicitudId);
        this.solicitud = data;
        // Cargamos los catálogos necesarios para el formulario
        await this.fetchCatalogos();
      } catch (error) {
        console.error("Error al obtener la solicitud para desincorporar:", error);
        this.solicitud = null;
        useToast().showToast('Error al cargar los datos de la solicitud', 'error');
      } finally {
        this.loading = false;
      }
    },

    /**
     * Carga los catálogos necesarios para el formulario de desincorporación.
     */
    async fetchCatalogos() {
      try {
        const estadosFisicosRes = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/select`);
        this.catalogs.estadosFisicos = Array.isArray(estadosFisicosRes.data) ? estadosFisicosRes.data : [];
      } catch (error) {
        console.error("Error al obtener catálogos para desincorporación:", error);
      }
    },

    /**
     * Envía los datos del formulario para crear el registro de desincorporación.
     * @param {object} payload - Los datos del formulario.
     */
    async createDesincorporacion(payload) {
      this.loading = true;
      try {
        const response = await axios.post(`${BASE_URL}desincorporaciones/crear`, payload);
        
        // Si la creación es exitosa, aprobamos la solicitud original
        if (payload.solicitud_id && response.status >= 200 && response.status < 300) {
          const solicitudStore = useSolicitudStore();
          await solicitudStore.aprobarSolicitud(payload.solicitud_id);
        }

        useToast().showToast('Desincorporación registrada exitosamente');
        return response;
      } catch (error) {
        console.error("Error al crear la desincorporación:", error);
        useToast().showToast(error.response?.data?.detail || 'Error al registrar la desincorporación', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});