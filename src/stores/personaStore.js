import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const usePersonaStore = defineStore('persona', {
    state: () => ({
        personas: [],
        persona: null,
        loading: false,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchPersonas(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}personas/listar`, {
                    params: { page, page_size: pageSize, q: searchTerm }
                });
                this.personas = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                useToast().showToast('Error al obtener las personas', 'error');
            } finally {
                this.loading = false;
            }
        },
        async createPersona(persona) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}personas/crear`, persona);
                await this.fetchPersonas(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Persona creada exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al crear la persona', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updatePersona(id, persona) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}personas/actualizar/${id}`, persona);
                await this.fetchPersonas(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Persona actualizada exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al actualizar la persona', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deletePersona(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}personas/eliminar/${id}`);
                await this.fetchPersonas(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Persona eliminada exitosamente');
            } catch (error) {
                useToast().showToast('Error al eliminar la persona', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
