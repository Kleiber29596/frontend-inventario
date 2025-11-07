import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useTipoBienStore = defineStore('tipoBien', {
    state: () => ({
        tiposBien: [],
        tipoBien: null,
        loading: false,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchTiposBien(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipos_bien`, {
                    params: { page, page_size: pageSize, q: searchTerm }
                });
                this.tiposBien = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                useToast().showToast('Error al obtener los tipos de bien', 'error');
            } finally {
                this.loading = false;
            }
        },
        async createTipoBien(tipoBien) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/tipos_bien`, tipoBien);
                await this.fetchTiposBien(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Tipo de bien creado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al crear el tipo de bien', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateTipoBien(id, tipoBien) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/tipos_bien/${id}`, tipoBien);
                await this.fetchTiposBien(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Tipo de bien actualizado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al actualizar el tipo de bien', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteTipoBien(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/tipos_bien/${id}`);
                await this.fetchTiposBien(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Tipo de bien eliminado exitosamente');
            } catch (error) {
                useToast().showToast('Error al eliminar el tipo de bien', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
