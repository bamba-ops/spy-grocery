export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client: {
        Row: {
          created_at: string
          email: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prices: {
        Row: {
          created_at: string
          created_date: string | null
          id: string
          is_promo: boolean | null
          price: number | null
          price_un: number | null
          product_id: string | null
          quantity: number | null
          store_id: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          created_date?: string | null
          id?: string
          is_promo?: boolean | null
          price?: number | null
          price_un?: number | null
          product_id?: string | null
          quantity?: number | null
          store_id?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          created_date?: string | null
          id?: string
          is_promo?: boolean | null
          price?: number | null
          price_un?: number | null
          product_id?: string | null
          quantity?: number | null
          store_id?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          created_at: string
          created_date: string | null
          id: string
          image_url: string | null
          link: string | null
          name: string | null
          slug: string | null
          store_id: string | null
          unit: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          created_date?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          name?: string | null
          slug?: string | null
          store_id?: string | null
          unit?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          created_date?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          name?: string | null
          slug?: string | null
          store_id?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          api_url: string | null
          cookies: string | null
          cookies_json: Json | null
          created_at: string
          id: string
          image_url: string | null
          name: string | null
          slug: string | null
          wait_for_selector: string | null
        }
        Insert: {
          api_url?: string | null
          cookies?: string | null
          cookies_json?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          slug?: string | null
          wait_for_selector?: string | null
        }
        Update: {
          api_url?: string | null
          cookies?: string | null
          cookies_json?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          slug?: string | null
          wait_for_selector?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      latest_price: {
        Row: {
          created_at: string | null
          created_date: string | null
          is_promo: boolean | null
          price: number | null
          price_un: number | null
          product_id: string | null
          quantity: number | null
          store_id: string | null
          unit: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
