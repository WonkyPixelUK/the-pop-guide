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
      custom_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      funko_pops: {
        Row: {
          created_at: string
          description: string | null
          estimated_value: number | null
          exclusive_to: string | null
          id: string
          image_url: string | null
          is_chase: boolean | null
          is_exclusive: boolean | null
          is_vaulted: boolean | null
          name: string
          number: string | null
          release_date: string | null
          series: string
          updated_at: string
          variant: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          exclusive_to?: string | null
          id?: string
          image_url?: string | null
          is_chase?: boolean | null
          is_exclusive?: boolean | null
          is_vaulted?: boolean | null
          name: string
          number?: string | null
          release_date?: string | null
          series: string
          updated_at?: string
          variant?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          exclusive_to?: string | null
          id?: string
          image_url?: string | null
          is_chase?: boolean | null
          is_exclusive?: boolean | null
          is_vaulted?: boolean | null
          name?: string
          number?: string | null
          release_date?: string | null
          series?: string
          updated_at?: string
          variant?: string | null
        }
        Relationships: []
      }
      list_items: {
        Row: {
          created_at: string
          funko_pop_id: string
          id: string
          list_id: string
        }
        Insert: {
          created_at?: string
          funko_pop_id: string
          id?: string
          list_id: string
        }
        Update: {
          created_at?: string
          funko_pop_id?: string
          id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_funko_pop_id_fkey"
            columns: ["funko_pop_id"]
            isOneToOne: false
            referencedRelation: "funko_pops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "custom_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_collections: {
        Row: {
          condition: string | null
          created_at: string
          custom_images: string[] | null
          funko_pop_id: string
          id: string
          personal_notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          custom_images?: string[] | null
          funko_pop_id: string
          id?: string
          personal_notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          custom_images?: string[] | null
          funko_pop_id?: string
          id?: string
          personal_notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_funko_pop_id_fkey"
            columns: ["funko_pop_id"]
            isOneToOne: false
            referencedRelation: "funko_pops"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          funko_pop_id: string
          id: string
          max_price: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          funko_pop_id: string
          id?: string
          max_price?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          funko_pop_id?: string
          id?: string
          max_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_funko_pop_id_fkey"
            columns: ["funko_pop_id"]
            isOneToOne: false
            referencedRelation: "funko_pops"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
