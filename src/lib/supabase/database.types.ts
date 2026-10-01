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
      assets: {
        Row: {
          byte_size: number | null
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          original_filename: string | null
          public_key: string | null
          restaurant_id: string
          status: string
          storage_key: string
          updated_at: string
        }
        Insert: {
          byte_size?: number | null
          content_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          original_filename?: string | null
          public_key?: string | null
          restaurant_id: string
          status?: string
          storage_key: string
          updated_at?: string
        }
        Update: {
          byte_size?: number | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          original_filename?: string | null
          public_key?: string | null
          restaurant_id?: string
          status?: string
          storage_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          name: string
          position: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          name: string
          position?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          name?: string
          position?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          camera_orbit: string | null
          category_id: string
          created_at: string
          created_by: string | null
          currency: string
          depth_cm: number | null
          description: string
          glb_asset_id: string | null
          height_cm: number | null
          id: string
          is_test_item: boolean
          is_visible: boolean
          lock_scale_in_ar: boolean
          name: string
          position: number
          poster_asset_id: string | null
          price: number | null
          restaurant_id: string
          scale_source: string
          scale_verified: boolean
          slug: string
          thumbnail_asset_id: string | null
          updated_at: string
          usdz_asset_id: string | null
          width_cm: number | null
        }
        Insert: {
          camera_orbit?: string | null
          category_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          depth_cm?: number | null
          description?: string
          glb_asset_id?: string | null
          height_cm?: number | null
          id?: string
          is_test_item?: boolean
          is_visible?: boolean
          lock_scale_in_ar?: boolean
          name: string
          position?: number
          poster_asset_id?: string | null
          price?: number | null
          restaurant_id: string
          scale_source?: string
          scale_verified?: boolean
          slug: string
          thumbnail_asset_id?: string | null
          updated_at?: string
          usdz_asset_id?: string | null
          width_cm?: number | null
        }
        Update: {
          camera_orbit?: string | null
          category_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          depth_cm?: number | null
          description?: string
          glb_asset_id?: string | null
          height_cm?: number | null
          id?: string
          is_test_item?: boolean
          is_visible?: boolean
          lock_scale_in_ar?: boolean
          name?: string
          position?: number
          poster_asset_id?: string | null
          price?: number | null
          restaurant_id?: string
          scale_source?: string
          scale_verified?: boolean
          slug?: string
          thumbnail_asset_id?: string | null
          updated_at?: string
          usdz_asset_id?: string | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_fk"
            columns: ["category_id", "restaurant_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id", "restaurant_id"]
          },
          {
            foreignKeyName: "menu_items_glb_fk"
            columns: ["glb_asset_id", "restaurant_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id", "restaurant_id"]
          },
          {
            foreignKeyName: "menu_items_poster_fk"
            columns: ["poster_asset_id", "restaurant_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id", "restaurant_id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_thumbnail_fk"
            columns: ["thumbnail_asset_id", "restaurant_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id", "restaurant_id"]
          },
          {
            foreignKeyName: "menu_items_usdz_fk"
            columns: ["usdz_asset_id", "restaurant_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id", "restaurant_id"]
          },
        ]
      }
      menu_versions: {
        Row: {
          id: string
          published_at: string
          published_by: string | null
          restaurant_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          id?: string
          published_at?: string
          published_by?: string | null
          restaurant_id: string
          snapshot: Json
          version: number
        }
        Update: {
          id?: string
          published_at?: string
          published_by?: string | null
          restaurant_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_versions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      published_menus: {
        Row: {
          published_at: string
          restaurant_id: string
          slug: string
          snapshot: Json
          version_id: string
        }
        Insert: {
          published_at?: string
          restaurant_id: string
          slug: string
          snapshot: Json
          version_id: string
        }
        Update: {
          published_at?: string
          restaurant_id?: string
          slug?: string
          snapshot?: Json
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_menus_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "menu_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_members: {
        Row: {
          created_at: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          accent: string | null
          catalog_title: string
          created_at: string
          created_by: string | null
          id: string
          indexable: boolean
          logo_asset_id: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          accent?: string | null
          catalog_title?: string
          created_at?: string
          created_by?: string | null
          id?: string
          indexable?: boolean
          logo_asset_id?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          accent?: string | null
          catalog_title?: string
          created_at?: string
          created_by?: string | null
          id?: string
          indexable?: boolean
          logo_asset_id?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_logo_asset_fk"
            columns: ["logo_asset_id", "id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id", "restaurant_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      publish_menu: {
        Args: { p_restaurant_id: string }
        Returns: {
          published_at: string
          restaurant_id: string
          slug: string
          snapshot: Json
          version_id: string
        }
        SetofOptions: {
          from: "*"
          to: "published_menus"
          isOneToOne: true
          isSetofReturn: false
        }
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
    Enums: {},
  },
} as const
