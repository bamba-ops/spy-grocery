// stores/authStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        email: '',
        message: '',
        error: '',
        isLoading: false,
        session: null,
    }),
    actions: {

        handleUserEndSession() {
            supabase.auth.signOut().then(() => {
                this.session = null;
            })
        },

        async initUserSession() {
            const { data: { session } } = await supabase.auth.getSession();
            this.session = session
            supabase.auth.onAuthStateChange((event, session) => {
                console.log(session)
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