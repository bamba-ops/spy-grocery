// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Import via bare specifier thanks to the import_map.json file.
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// Import du client Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Hello from Stripe Webhook!')

Deno.serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text()
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }
  console.log(`🔔 Event received: ${event.id}, type: ${event.type}`)

  switch (event.type) {
    case 'invoice.paid':
      {
        const invoicePaid = event.data.object
        console.log("Le invoice paid !", invoicePaid)

        const email = invoicePaid.customer_email

        // Chercher dans la table "client" si un enregistrement avec cet email existe déjà.
        const { data: existingClient, error: selectError } = await supabase
          .from('client')
          .select('*')
          .eq('email', email)
          .maybeSingle(); // retourne null si aucune ligne n'est trouvée

        if (selectError) {
          console.error("Erreur lors de la sélection du client:", selectError.message);
          return new Response("Erreur lors de la sélection du client", { status: 500 });
        }

        if (!existingClient) {
          // Aucun client trouvé pour cet email, on crée un user puis un client.

          // 1. Création de l'utilisateur dans la table "users"
          let { data, error } = await supabase.auth.signInWithOtp({
            email: email
          })

          if (error) {
            console.error("Erreur lors de la création du user:", error.message);
            return new Response("Erreur lors de la création du user", { status: 500 });
          }
          console.log("Nouveau user créé");

          // 2. Création du client dans la table "client" en associant le Stripe ID et (optionnellement) l'ID du user
          const { data: newClient, error: errorClient } = await supabase
            .from('client')
            .insert([{ email, stripe_id: invoicePaid.customer, is_paid: true }])
            .select()
            .maybeSingle();
          if (errorClient) {
            console.error("Erreur lors de la création du client:", errorClient.message);
            return new Response("Erreur lors de la création du client", { status: 500 });
          }
          console.log("Nouveau client créé:", newClient);
        } else {
          // Un client existe déjà : on met à jour sa colonne stripe_id
          const { data: updatedClient, error: errorUpdate } = await supabase
            .from('client')
            .update({ stripe_id: invoicePaid.customer, is_paid: true })
            .eq('email', email)
            .select()
            .maybeSingle();
          if (errorUpdate) {
            console.error("Erreur lors de la mise à jour du client:", errorUpdate.message);
            return new Response("Erreur lors de la mise à jour du client", { status: 500 });
          }
          console.log("Client mis à jour avec le nouveau stripe_id:", updatedClient);
        }
        break;
      }
    default:
      //console.log(`Événement non géré : ${event.type}`)
      break;
  }

  //console.log(`🔔 Event received: ${receivedEvent.id}`)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})