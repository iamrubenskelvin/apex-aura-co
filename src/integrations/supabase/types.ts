export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          processed_at: string | null
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          processed_at?: string | null
          reason?: string
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          processed_at?: string | null
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          cep: string
          city: string
          complement: string
          created_at: string
          district: string
          id: string
          is_default: boolean
          label: string
          number: string
          recipient: string
          state: string
          street: string
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string
          created_at?: string
          district: string
          id?: string
          is_default?: boolean
          label?: string
          number: string
          recipient: string
          state: string
          street: string
          user_id?: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string
          created_at?: string
          district?: string
          id?: string
          is_default?: boolean
          label?: string
          number?: string
          recipient?: string
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          discount_type: string
          expires_at: string | null
          first_purchase_only: boolean
          max_uses_per_user: number
          min_subtotal: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string
          discount_type?: string
          expires_at?: string | null
          first_purchase_only?: boolean
          max_uses_per_user?: number
          min_subtotal?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          expires_at?: string | null
          first_purchase_only?: boolean
          max_uses_per_user?: number
          min_subtotal?: number
          value?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image: string
          name: string
          order_id: string
          product_id: string
          qty: number
          unit_price: number
          variant: string | null
        }
        Insert: {
          id?: string
          image?: string
          name: string
          order_id: string
          product_id: string
          qty: number
          unit_price: number
          variant?: string | null
        }
        Update: {
          id?: string
          image?: string
          name?: string
          order_id?: string
          product_id?: string
          qty?: number
          unit_price?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json
          approved_at: string | null
          coupon_code: string | null
          created_at: string
          customer_email: string
          delivered_at: string | null
          discount: number
          id: string
          number: number
          payment_method: string
          shipped_at: string | null
          shipping: number
          status: string
          subtotal: number
          total: number
          tracking_code: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json
          approved_at?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_email?: string
          delivered_at?: string | null
          discount?: number
          id?: string
          number?: never
          payment_method?: string
          shipped_at?: string | null
          shipping?: number
          status?: string
          subtotal: number
          total: number
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json
          approved_at?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_email?: string
          delivered_at?: string | null
          discount?: number
          id?: string
          number?: never
          payment_method?: string
          shipped_at?: string | null
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          product_id: string
          rating: number
          status: string
          title: string
          user_id: string
        }
        Insert: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          status?: string
          title?: string
          user_id?: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          best_seller: boolean
          brand: string
          category: string
          created_at: string
          description: string
          featured: boolean
          flavors: string[]
          goals: string[]
          id: string
          image: string
          is_new: boolean
          name: string
          old_price: number | null
          price: number
          rating: number
          reviews: number
          sales: number
          sku: string
          slug: string
          sort_order: number
          status: string
          stock: number
          stock_total: number | null
          subcategory: string
          tag: string
          tags: string[]
          updated_at: string
          weights: string[]
        }
        Insert: {
          badge?: string | null
          best_seller?: boolean
          brand: string
          category: string
          created_at?: string
          description?: string
          featured?: boolean
          flavors?: string[]
          goals?: string[]
          id: string
          image?: string
          is_new?: boolean
          name: string
          old_price?: number | null
          price: number
          rating?: number
          reviews?: number
          sales?: number
          sku?: string
          slug: string
          sort_order?: number
          status?: string
          stock?: number
          stock_total?: number | null
          subcategory?: string
          tag?: string
          tags?: string[]
          updated_at?: string
          weights?: string[]
        }
        Update: {
          badge?: string | null
          best_seller?: boolean
          brand?: string
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          flavors?: string[]
          goals?: string[]
          id?: string
          image?: string
          is_new?: boolean
          name?: string
          old_price?: number | null
          price?: number
          rating?: number
          reviews?: number
          sales?: number
          sku?: string
          slug?: string
          sort_order?: number
          status?: string
          stock?: number
          stock_total?: number | null
          subcategory?: string
          tag?: string
          tags?: string[]
          updated_at?: string
          weights?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          cpf: string
          created_at: string
          email_notifications: boolean
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          cpf?: string
          created_at?: string
          email_notifications?: boolean
          full_name?: string
          id: string
          phone?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          cpf?: string
          created_at?: string
          email_notifications?: boolean
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
