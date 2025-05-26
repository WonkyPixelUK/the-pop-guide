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
      achievements: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_group_members: {
        Row: {
          friend_id: string
          group_id: string
          id: string
        }
        Insert: {
          friend_id: string
          group_id: string
          id?: string
        }
        Update: {
          friend_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_group_members_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "friend_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funko_pops: {
        Row: {
          average_price_30d: number | null
          base_estimated_value: number | null
          created_at: string
          data_sources: string[] | null
          description: string | null
          ean: string | null
          estimated_value: number | null
          exclusive_to: string | null
          id: string
          image_url: string | null
          is_chase: boolean | null
          is_exclusive: boolean | null
          is_stickered: boolean | null
          is_vaulted: boolean | null
          last_price_update: string | null
          name: string
          number: string | null
          price_trend: string | null
          rarity: string | null
          release_date: string | null
          series: string
          sticker_condition: string | null
          sticker_multiplier: number | null
          sticker_type: string | null
          updated_at: string
          variant: string | null
        }
        Insert: {
          average_price_30d?: number | null
          base_estimated_value?: number | null
          created_at?: string
          data_sources?: string[] | null
          description?: string | null
          ean?: string | null
          estimated_value?: number | null
          exclusive_to?: string | null
          id?: string
          image_url?: string | null
          is_chase?: boolean | null
          is_exclusive?: boolean | null
          is_stickered?: boolean | null
          is_vaulted?: boolean | null
          last_price_update?: string | null
          name: string
          number?: string | null
          price_trend?: string | null
          rarity?: string | null
          release_date?: string | null
          series: string
          sticker_condition?: string | null
          sticker_multiplier?: number | null
          sticker_type?: string | null
          updated_at?: string
          variant?: string | null
        }
        Update: {
          average_price_30d?: number | null
          base_estimated_value?: number | null
          created_at?: string
          data_sources?: string[] | null
          description?: string | null
          ean?: string | null
          estimated_value?: number | null
          exclusive_to?: string | null
          id?: string
          image_url?: string | null
          is_chase?: boolean | null
          is_exclusive?: boolean | null
          is_stickered?: boolean | null
          is_vaulted?: boolean | null
          last_price_update?: string | null
          name?: string
          number?: string | null
          price_trend?: string | null
          rarity?: string | null
          release_date?: string | null
          series?: string
          sticker_condition?: string | null
          sticker_multiplier?: number | null
          sticker_type?: string | null
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
      price_history: {
        Row: {
          condition: string | null
          created_at: string
          date_scraped: string
          funko_pop_id: string
          id: string
          listing_url: string | null
          price: number
          source: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          date_scraped?: string
          funko_pop_id: string
          id?: string
          listing_url?: string | null
          price: number
          source: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          date_scraped?: string
          funko_pop_id?: string
          id?: string
          listing_url?: string | null
          price?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_funko_pop_id_fkey"
            columns: ["funko_pop_id"]
            isOneToOne: false
            referencedRelation: "funko_pops"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_activities: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          ended_at: string | null
          id: string
          image_url: string | null
          is_current: boolean | null
          platform: string
          started_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          ended_at?: string | null
          id?: string
          image_url?: string | null
          is_current?: boolean | null
          platform: string
          started_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          ended_at?: string | null
          id?: string
          image_url?: string | null
          is_current?: boolean | null
          platform?: string
          started_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          discord_username: string | null
          display_name: string | null
          ebay_store_url: string | null
          id: string
          instagram_handle: string | null
          is_public: boolean
          nintendo_friend_code: string | null
          playstation_username: string | null
          spotify_username: string | null
          steam_username: string | null
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          username: string | null
          xbox_gamertag: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_username?: string | null
          display_name?: string | null
          ebay_store_url?: string | null
          id?: string
          instagram_handle?: string | null
          is_public?: boolean
          nintendo_friend_code?: string | null
          playstation_username?: string | null
          spotify_username?: string | null
          steam_username?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          xbox_gamertag?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_username?: string | null
          display_name?: string | null
          ebay_store_url?: string | null
          id?: string
          instagram_handle?: string | null
          is_public?: boolean
          nintendo_friend_code?: string | null
          playstation_username?: string | null
          spotify_username?: string | null
          steam_username?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          xbox_gamertag?: string | null
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          funko_pop_id: string
          id: string
          last_scraped: string | null
          next_scrape_due: string | null
          retry_count: number | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          funko_pop_id: string
          id?: string
          last_scraped?: string | null
          next_scrape_due?: string | null
          retry_count?: number | null
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          funko_pop_id?: string
          id?: string
          last_scraped?: string | null
          next_scrape_due?: string | null
          retry_count?: number | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraping_jobs_funko_pop_id_fkey"
            columns: ["funko_pop_id"]
            isOneToOne: false
            referencedRelation: "funko_pops"
            referencedColumns: ["id"]
          },
        ]
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
      retailer_products: {
        Row: {
          id: string;
          retailer_id: string;
          funko_pop_id: string;
          name: string;
          price: number;
          image_url: string | null;
          is_deal: boolean | null;
          is_incoming: boolean | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          retailer_id: string;
          funko_pop_id: string;
          name: string;
          price: number;
          image_url?: string | null;
          is_deal?: boolean | null;
          is_incoming?: boolean | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          retailer_id?: string;
          funko_pop_id?: string;
          name?: string;
          price?: number;
          image_url?: string | null;
          is_deal?: boolean | null;
          is_incoming?: boolean | null;
          created_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "retailer_products_retailer_id_fkey",
            columns: ["retailer_id"],
            isOneToOne: false,
            referencedRelation: "retailers",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_products_funko_pop_id_fkey",
            columns: ["funko_pop_id"],
            isOneToOne: false,
            referencedRelation: "funko_pops",
            referencedColumns: ["id"]
          }
        ]
      },
      retailer_analytics: {
        Row: {
          id: string;
          retailer_id: string;
          clicks: number;
          last_click: string | null;
          impressions: number;
          views: number;
          followers: number;
          created_at: string;
        }
        Insert: {
          id?: string;
          retailer_id: string;
          clicks?: number;
          last_click?: string | null;
          impressions?: number;
          views?: number;
          followers?: number;
          created_at?: string;
        }
        Update: {
          id?: string;
          retailer_id?: string;
          clicks?: number;
          last_click?: string | null;
          impressions?: number;
          views?: number;
          followers?: number;
          created_at?: string;
        }
        Relationships: [
          {
            foreignKeyName: "retailer_analytics_retailer_id_fkey",
            columns: ["retailer_id"],
            isOneToOne: false,
            referencedRelation: "retailers",
            referencedColumns: ["id"]
          }
        ]
      },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_average_price: {
        Args: { pop_id: string; days_back?: number }
        Returns: number
      }
      calculate_sticker_aware_price: {
        Args: { pop_id: string; days_back?: number }
        Returns: number
      }
      get_sticker_multiplier: {
        Args: { sticker_type: string }
        Returns: number
      }
      update_funko_pricing: {
        Args: { pop_id: string }
        Returns: undefined
      }
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
