import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useEstadoFisicoStore = defineStore('estadoFisico', {
    state: () => ({
        estadosFisicos: [],
        estadoFisico: null,
        loading: false,
        error: null,
        searchTerm: '',
        paginacion: {
            total: 0,
            paginas: 1,
            pagina_actual: 1,
            anterior: false,
            siguiente: false,
        },
    }),
    actions: {
        async fetchEstadosFisicos(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/catalogo-bienes/estados_fisicos?page=${page}&search=${searchTerm}`);
                this.estadosFisicos = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createEstadoFisico(estadoFisico) {
            this.loading = true;
            try {
                const response = await axios.post('/auxiliares/catalogo-bienes/estados_fisicos', estadoFisico);
                this.fetchEstadosFisicos(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateEstadoFisico(id, estadoFisico) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/catalogo-bienes/estados_fisicos/${id}`, estadoFisico);
                this.fetchEstadosFisicos(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteEstadoFisico(id) {
            this.loading = true;
            try {
                await axios.delete(`/auxiliares/catalogo-bienes/estados_fisicos/${id}`);
                this.fetchEstadosFisicos(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
