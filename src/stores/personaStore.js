import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const usePersonaStore = defineStore('persona', {
    state: () => ({
        personas: [],
        persona: null,
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
        async fetchPersonas(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/personas/listar?page=${page}&search=${searchTerm}`);
                this.personas = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createPersona(persona) {
            this.loading = true;
            try {
                const response = await axios.post('/personas/crear', persona);
                this.fetchPersonas(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updatePersona(id, persona) {
            this.loading = true;
            try {
                const response = await axios.put(`/personas/actualizar/${id}`, persona);
                this.fetchPersonas(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deletePersona(id) {
            this.loading = true;
            try {
                await axios.delete(`/personas/Eliminar/${id}`);
                this.fetchPersonas(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
