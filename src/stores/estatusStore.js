import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useEstatusStore = defineStore('estatus', {
    state: () => ({
        estatusList: [], // Renamed to avoid conflict with single 'estatus'
        estatus: null,
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
        async fetchEstatus(page = 1, searchTerm = '', tipo = null) {
            this.loading = true;
            try {
                let url = `/auxiliares/catalogo-bienes/estatus?page=${page}&search=${searchTerm}`;
                if (tipo) {
                    url += `&tipo=${tipo}`;
                }
                const response = await axios.get(url);
                this.estatusList = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createEstatus(estatus) {
            this.loading = true;
            try {
                const response = await axios.post('/auxiliares/catalogo-bienes/estatus', estatus);
                this.fetchEstatus(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateEstatus(id, estatus) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/catalogo-bienes/estatus/${id}`, estatus);
                this.fetchEstatus(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteEstatus(id) {
            this.loading = true;
            try {
                await axios.delete(`/auxiliares/catalogo-bienes/estatus/${id}`);
                this.fetchEstatus(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
