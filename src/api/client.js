/**
 * Service pour la gestion des requêtes liées aux prix
 */
import { API_BASE_URL } from '@/api/config.js'
import { supabase } from '@/api/supabase'

export const ClientService = {

    async updateLimitUsageClient({ client }) {
        try {
            // Récupération du client existant
            const { data: getClient, error: getError } = await supabase
                .from('client')
                .select('*')
                .eq('user_id', client.user_id)
                .single();

            if (getError) throw getError;
            client.limit_usage--;
            // Vérification de la condition de limite
            if (getClient.limit_usage > client.limit_usage) {
                // Mise à jour avec supabase directement
                const { data: updatedClient, error: updateError } = await supabase
                    .from('client')
                    .update({ limit_usage: client.limit_usage })
                    .eq('user_id', client.user_id)
                    .single();

                if (updateError) throw updateError;
                return updatedClient;
            }

            return getClient;

        } catch (error) {
            console.error("Erreur dans ClientService.updateLimitUsageClient:", error);
            throw error;
        }
    },
    async setClient() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.id) throw new Error("Utilisateur non authentifié");

            // Vérification de l'existence du client
            const { data: existingClient, error: getError } = await supabase
                .from('client')
                .select('*')
                .eq('user_id', user.id)
                .single();

            let resultClient;

            if (existingClient) {
                resultClient = existingClient;
            } else {
                // Création d'un nouveau client
                const { data: newClient, error: createError } = await supabase
                    .from('client')
                    .insert([{
                        user_id: user.id,
                        email: user.email,
                        limit_usage: 5
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                resultClient = newClient;
            }

            return resultClient;

        } catch (error) {
            console.error("Erreur dans ClientService.setClient:", error);
            throw error;
        }
    },
};
