import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useEstatusStore = defineStore('estatus', {
    state: () => ({
        estatusList: [], // Renamed to avoid conflict with single 'estatus'
        estatus: null,
        loading: false,
        error: null,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchEstatus(page = 1, pageSize = 10, searchTerm = '', tipo = null) {
            this.loading = true;
            try {
                let url = `${BASE_URL}auxiliares/catalogo-bienes/estatus?page=${page}&page_size=${pageSize}&q=${searchTerm}`;
                if (tipo) {
                    url += `&tipo=${tipo}`;
                }
                const response = await axios.get(url);
                this.estatusList = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createEstatus(estatus) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/estatus`, estatus);
                this.fetchEstatus(1, 10, '');
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
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/estatus/${id}`, estatus);
                this.fetchEstatus(1, 10, '');
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
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/estatus/${id}`);
                this.fetchEstatus(1, 10, '');
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
