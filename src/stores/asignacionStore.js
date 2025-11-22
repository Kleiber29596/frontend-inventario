import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';
import { useSolicitudStore } from '@/stores/solicitudStore';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAsignacionStore = defineStore('asignacion', {
  state: () => ({
    asignaciones: [],
    asignacionSeleccionada: null, // Para el modal de detalles
    bienes: [],
    searchTerm: '',
    totalItems: 0,
    currentPage: 1,

    loading: false,
    searchTerm: '',
    catalogs: {
      personas: [],
      departamentos: [],
      estatus: [], // For assignments
      estatusBienes: [], // For assets
      motivos_asignacion: [],
      motivos_devolucion: [],
      estadosFisicos: [],
    },
  }),
  actions: {
    async fetchAsignaciones(page = 1, pageSize, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}asignaciones/asignaciones`, {
          params: {
            page,
            pageSize,
            q: search,
          },

        });
        this.asignaciones = response.data.results || [];
        this.totalItems = response.data.total || 0;
        this.currentPage = response.data.current_page || 1;
      } catch (error) {
        console.error("Error al obtener asignaciones:", error);
        this.asignaciones = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchBienes() {
      this.loading = true;
      try {
      const response = await axios.get(`${BASE_URL}bienes/para-select`);
      this.bienes = response.data;
      } catch (error) {
      console.error("Error al obtener bienes:", error);
      this.bienes = [];
      } finally {
      this.loading = false;
      }
    },

     

    async createAsignacion(asignacion) {
      this.loading = true;
      try {
        const estatus = this.catalogs.estatus.find(e => e.descripcion === 'Activa' && e.tipo_estatus === 'Asignacion');
        if (estatus) asignacion.estatus_id = estatus.id;
        const response = await axios.post(`${BASE_URL}asignaciones/crear`, asignacion);
        
        // Lógica para aprobar la solicitud original si la asignación se creó desde una.
        
        if (asignacion.solicitud_id && response.status >= 200 && response.status < 300) {
          const solicitudStore = useSolicitudStore();
          await solicitudStore.aprobarSolicitud(asignacion.solicitud_id);
        }

        await this.fetchAsignaciones(); // Refresh list
        useToast().showToast('Asignación creada exitosamente');
        return response; // Devolver la respuesta para poder redirigir
      } catch (error) {
        console.error("Error al crear la asignación:", error);
        useToast().showToast('Error al crear la asignación', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async updateAsignacion(id, asignacion) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}asignaciones/actualizar/${id}`, asignacion);
        await this.fetchAsignaciones(); // Refresh list
        useToast().showToast('Asignación actualizada exitosamente');
      } catch (error) {
        console.error("Error al actualizar la asignación:", error);
        useToast().showToast('Error al actualizar la asignación', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAsignacionById(id) {
      try {
        const response = await axios.get(`${BASE_URL}asignaciones/asignaciones/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener la asignación ${id}:`, error);
        throw error;
      }
    },

    async setupEditAsignacion(id) {
      this.loading = true;
      try {
        // 1. Cargar catálogos, bienes y la asignación específica en paralelo
        const [_, __, asignacionData] = await Promise.all([
          this.fetchCatalogos(),
          this.fetchBienes(), // Aseguramos que la lista de bienes para el select esté cargada
          this.fetchAsignacionById(id)
        ]);
  
        // 2. Cargar las personas DESPUÉS de saber el departamento
        if (asignacionData.departamento_id) {
          await this.fetchPersonasPorDepartamento(asignacionData.departamento_id);
        }
  
        // 3. Devolver los datos de la asignación para que el componente los use
        return asignacionData;
      } catch (error) {
        console.error("Error al configurar la edición de la asignación:", error);
        throw error; // Propagar el error para que el componente pueda manejarlo
      } finally {
        this.loading = false;
      }
    },

    async fetchAsignacionConDetalles(id) {
      this.loading = true;
      this.asignacionSeleccionada = null;
      try {
        // Este endpoint debe devolver la asignación con sus relaciones: detalles, bienes, devoluciones, etc.
        const response = await axios.get(`${BASE_URL}asignaciones/asignaciones/${id}/detallado`);
        this.asignacionSeleccionada = response.data;
      } catch (error) {
        console.error(`Error al obtener los detalles completos de la asignación ${id}:`, error);
        useToast().showToast('Error al cargar los detalles', 'error');
      } finally {
        this.loading = false;
      }
    },


    async fetchCatalogos() {
      // No es necesario 'this.loading' aquí si la acción principal ya lo gestiona
      try {
        const [departamentosRes, estatusAsignacionRes, estatusBienesRes, motivosAsignacionRes, motivosDevolucionRes, estadosFisicosRes] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/dependencias/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/select?tipo_estatus=Asignacion`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/select?tipo=Bienes`),
          axios.get(`${BASE_URL}auxiliares/motivos/select?tipo=Asignacion`),
          axios.get(`${BASE_URL}auxiliares/motivos/select?tipo=Devolucion`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/select`)
        ]);
        this.catalogs.departamentos = Array.isArray(departamentosRes.data) ? departamentosRes.data : [];
        this.catalogs.estatus       = Array.isArray(estatusAsignacionRes.data) ? estatusAsignacionRes.data : [];
        this.catalogs.estatusBienes = Array.isArray(estatusBienesRes.data) ? estatusBienesRes.data : [];
        this.catalogs.motivos_asignacion = Array.isArray(motivosAsignacionRes.data) ? motivosAsignacionRes.data : [];
        this.catalogs.motivos_devolucion = Array.isArray(motivosDevolucionRes.data) ? motivosDevolucionRes.data : [];
        this.catalogs.estadosFisicos = Array.isArray(estadosFisicosRes.data) ? estadosFisicosRes.data : [];
        this.catalogs.personas = []; // Personas se cargarán dinámicamente
      } catch (error) {
        console.error("Error al obtener catálogos:", error);
        this.catalogs.departamentos = [];
        this.catalogs.estatus = [];
        this.catalogs.estatusBienes = [];
        this.catalogs.motivos = [];
        this.catalogs.estadosFisicos = [];
      }
    },

    async fetchPersonasPorDepartamento(departamentoId) {
      if (!departamentoId) {
        this.catalogs.personas = [];
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}personas/select`, {
          params: { departamento_id: departamentoId },
        });
        this.catalogs.personas = Array.isArray(response.data) ? response.data : response.data.items || [];
      } catch (error) {
        console.error("Error al obtener personas por departamento:", error);
        this.catalogs.personas = [];
      }
    },

    async createDevolucion(payload) {
      this.loading = true;
      try {
        const response = await axios.post(`${BASE_URL}asignaciones/devolucion`, payload, {
            // headers: { 'Authorization': `Bearer ${this.authStore.token}` } // Si usas autenticación
        });
        useToast().showToast('Devolución registrada correctamente.');
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error al registrar la devolución.';
        useToast().showToast(errorMessage, 'error');
        console.error('Error en createDevolucion:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchAsignacionDetalles(asignacionId) {
      try {
        const response = await axios.get(`${BASE_URL}asignaciones/${asignacionId}/detalles`);
        return response.data;
      } catch (error) {
        console.error("Error al obtener los detalles de la asignación:", error);
        return [];
      }
    },
    
  },
});