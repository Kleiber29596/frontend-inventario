import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useEstatusStore = defineStore('estatus', {
    state: () => ({
        estatusList: [], // Renamed to avoid conflict with single 'estatus'
        estatus: null,
        loading: false,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchEstatus(page = 1, pageSize = 10, searchTerm = '', tipo = null) {
            this.loading = true;
            try {
                const params = { page, page_size: pageSize, q: searchTerm, tipo };
                const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/`, { params });
                this.estatusList = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                useToast().showToast('Error al obtener los estatus', 'error');
            } finally {
                this.loading = false;
            }
        },
        async createEstatus(estatus) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/estatus/`, estatus);
                await this.fetchEstatus(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Estatus creado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al crear el estatus', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateEstatus(id, estatus) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/estatus/${id}/`, estatus);
                await this.fetchEstatus(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Estatus actualizado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al actualizar el estatus', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteEstatus(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/estatus/${id}/`);
                await this.fetchEstatus(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Estatus eliminado exitosamente');
            } catch (error) {
                useToast().showToast('Error al eliminar el estatus', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
