import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useTipoBienStore = defineStore('tipoBien', {
    state: () => ({
        tiposBien: [],
        tipoBien: null,
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
        async fetchTiposBien(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/catalogo-bienes/tipos_bien?page=${page}&search=${searchTerm}`);
                this.tiposBien = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createTipoBien(tipoBien) {
            this.loading = true;
            try {
                const response = await axios.post('/auxiliares/catalogo-bienes/tipos_bien', tipoBien);
                this.fetchTiposBien(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateTipoBien(id, tipoBien) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/catalogo-bienes/tipos_bien/${id}`, tipoBien);
                this.fetchTiposBien(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteTipoBien(id) {
            this.loading = true;
            try {
                await axios.delete(`/auxiliares/catalogo-bienes/tipos_bien/${id}`);
                this.fetchTiposBien(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
