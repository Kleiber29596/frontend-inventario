import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useMarcaStore = defineStore('marca', {
    state: () => ({
        marcas: [],
        marca: null,
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
        async fetchMarcas(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/catalogo-bienes/marcas?page=${page}&search=${searchTerm}`);
                this.marcas = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createMarca(marca) {
            this.loading = true;
            try {
                const response = await axios.post('/auxiliares/catalogo-bienes/marcas', marca);
                this.fetchMarcas(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateMarca(id, marca) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/catalogo-bienes/marcas/${id}`, marca);
                this.fetchMarcas(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteMarca(id) {
            this.loading = true;
            try {
                await axios.delete(`/auxiliares/catalogo-bienes/marcas/${id}`);
                this.fetchMarcas(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
