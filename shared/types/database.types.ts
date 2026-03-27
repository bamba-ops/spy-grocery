export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      product_prices: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_pct: number | null
          id: string
          observed_at: string
          on_sale: boolean | null
          package_sizing: string | null
          pre_price_text: string | null
          price_num: number | null
          price_raw: string | null
          price_text: string | null
          pricing_units: string | null
          product_id: string
          sale_expiry: string | null
          sale_label: string | null
          sale_text: string | null
          sale_type: string | null
          store: string
          store_id: string | null
          unit_price_full: string | null
          was_price_num: number | null
          was_price_raw: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_pct?: number | null
          id?: string
          observed_at: string
          on_sale?: boolean | null
          package_sizing?: string | null
          pre_price_text?: string | null
          price_num?: number | null
          price_raw?: string | null
          price_text?: string | null
          pricing_units?: string | null
          product_id: string
          sale_expiry?: string | null
          sale_label?: string | null
          sale_text?: string | null
          sale_type?: string | null
          store: string
          store_id?: string | null
          unit_price_full?: string | null
          was_price_num?: number | null
          was_price_raw?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_pct?: number | null
          id?: string
          observed_at?: string
          on_sale?: boolean | null
          package_sizing?: string | null
          pre_price_text?: string | null
          price_num?: number | null
          price_raw?: string | null
          price_text?: string | null
          pricing_units?: string | null
          product_id?: string
          sale_expiry?: string | null
          sale_label?: string | null
          sale_text?: string | null
          sale_type?: string | null
          store?: string
          store_id?: string | null
          unit_price_full?: string | null
          was_price_num?: number | null
          was_price_raw?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'product_prices_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      lists: {
        Row: {
          created_at: string
          id: string
          items_json: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items_json: Json
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items_json?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lists_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      products: {
        Row: {
          article_number: string | null
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_pct: number | null
          external_id: string
          id: string
          image_url: string | null
          image_urls: string[]
          is_sponsored: boolean | null
          list_name: string | null
          on_sale: boolean | null
          package_sizing: string | null
          position: number | null
          pre_price_text: string | null
          price_num: number | null
          price_raw: string | null
          price_text: string | null
          pricing_units: string | null
          product_key: string
          raw_payload: Json | null
          sale_expiry: string | null
          sale_label: string | null
          sale_text: string | null
          sale_type: string | null
          scraped_at: string
          search_results_count: number | null
          search_term: string | null
          slug: string
          source: string
          source_url: string
          store: string
          store_id: string | null
          title: string | null
          unit_price_full: string | null
          uom: string | null
          url: string | null
          was_price_num: number | null
          was_price_raw: string | null
        }
        Insert: {
          article_number?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_pct?: number | null
          external_id: string
          id?: string
          image_url?: string | null
          image_urls?: string[]
          is_sponsored?: boolean | null
          list_name?: string | null
          on_sale?: boolean | null
          package_sizing?: string | null
          position?: number | null
          pre_price_text?: string | null
          price_num?: number | null
          price_raw?: string | null
          price_text?: string | null
          pricing_units?: string | null
          product_key: string
          raw_payload?: Json | null
          sale_expiry?: string | null
          sale_label?: string | null
          sale_text?: string | null
          sale_type?: string | null
          scraped_at: string
          search_results_count?: number | null
          search_term?: string | null
          slug: string
          source: string
          source_url: string
          store: string
          store_id?: string | null
          title?: string | null
          unit_price_full?: string | null
          uom?: string | null
          url?: string | null
          was_price_num?: number | null
          was_price_raw?: string | null
        }
        Update: {
          article_number?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_pct?: number | null
          external_id?: string
          id?: string
          image_url?: string | null
          image_urls?: string[]
          is_sponsored?: boolean | null
          list_name?: string | null
          on_sale?: boolean | null
          package_sizing?: string | null
          position?: number | null
          pre_price_text?: string | null
          price_num?: number | null
          price_raw?: string | null
          price_text?: string | null
          pricing_units?: string | null
          product_key?: string
          raw_payload?: Json | null
          sale_expiry?: string | null
          sale_label?: string | null
          sale_text?: string | null
          sale_type?: string | null
          scraped_at?: string
          search_results_count?: number | null
          search_term?: string | null
          slug?: string
          source?: string
          source_url?: string
          store?: string
          store_id?: string | null
          title?: string | null
          unit_price_full?: string | null
          uom?: string | null
          url?: string | null
          was_price_num?: number | null
          was_price_raw?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
