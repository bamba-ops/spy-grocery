// stores/authStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase';
import { ClientService } from '@/api/client';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        email: '',
        message: '',
        error: '',
        isLoading: false,
        session: null,
        client: null,
        isEditing: false,
        newEmail: '',
        emailError: '',
    }),
    actions: {

        handleUserEndSession() {
            supabase.auth.signOut().then(() => {
                this.session = null;
            })
        },

        startEditEmail(email) {
            this.newEmail = email
            this.isEditing = true
            this.emailError = ''
        },

        cancelEditEmail() {
            this.isEditing = false
            this.emailError = ''
        },

        async updateEmailUser() {
            if (!this.newEmail) {
                this.emailError = "L'email ne peut pas être vide"
                return
            }

            if (!this.newEmail.includes('@') || !this.newEmail.includes('.')) {
                this.emailError = "Veuillez entrer un email valide"
                return
            }

            const { data, error } = await supabase.auth.updateUser({
                email: this.newEmail
            })

            if (!data) this.emailError = 'Erreur lors de la modification'

            this.isEditing = false;

        },

        async updateLimitUsageClient() {
            if (!this.client && !this.session) return;

            try {
                if (this.client.limit_usage <= 0) return;

                const response = await ClientService.updateLimitUsageClient({
                    session: this.session,
                    client: this.client
                })

                if (!response) return;

                this.client = response
            } catch (error) {
                console.log('Erreur lors de la mise à jour du client', error)
            }
        },

        async initClientAfterSignUp() {
            if (this.client) return;

            if (!this.session) return;

            try {
                const response = await ClientService.setClient();

                if (!response) return;

                this.client = response
            } catch (error) {
                console.log('Erreur lors de la création du client:', error);
            }
        },

        async initUserSession() {
            const { data: { session } } = await supabase.auth.getSession();
            this.session = session
            supabase.auth.onAuthStateChange(async (event, session) => {
                this.session = session
            })
        },

        async handleUserSession(t) {
            try {
                this.isLoading = true
                this.message = ""
                this.error = ""
                const { error: signInError } = await supabase.auth.signInWithOtp({
                    email: this.email,
                    options: { emailRedirectTo: '/' },
                });

                if (signInError) throw signInError;

                this.message = t("Auth.message");
                this.email = "";
            } catch (error) {
                this.error = error.message
            } finally {
                this.isLoading = false
            }
        }

    }
})