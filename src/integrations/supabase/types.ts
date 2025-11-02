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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_reviews: {
        Row: {
          after_service_image_url: string
          ai_summary: string
          appointment_id: string
          comparison_image_url: string
          comparison_type: string
          created_at: string
          id: string
          is_published: boolean | null
          provider_id: string
          similarity_score: number
          updated_at: string
        }
        Insert: {
          after_service_image_url: string
          ai_summary: string
          appointment_id: string
          comparison_image_url: string
          comparison_type: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          provider_id: string
          similarity_score: number
          updated_at?: string
        }
        Update: {
          after_service_image_url?: string
          ai_summary?: string
          appointment_id?: string
          comparison_image_url?: string
          comparison_type?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          provider_id?: string
          similarity_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          client_calendar_event_id: string | null
          client_id: string
          created_at: string
          id: string
          inspiration_image_url: string | null
          notes: string | null
          preview_image_url: string | null
          provider_calendar_event_id: string | null
          provider_id: string
          service_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          client_calendar_event_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          inspiration_image_url?: string | null
          notes?: string | null
          preview_image_url?: string | null
          provider_calendar_event_id?: string | null
          provider_id: string
          service_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          client_calendar_event_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          inspiration_image_url?: string | null
          notes?: string | null
          preview_image_url?: string | null
          provider_calendar_event_id?: string | null
          provider_id?: string
          service_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_time_slots: {
        Row: {
          blocked_date: string
          created_at: string
          end_time: string
          id: string
          provider_id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          end_time: string
          id?: string
          provider_id: string
          reason?: string | null
          start_time: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          end_time?: string
          id?: string
          provider_id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: []
      }
      calendar_sync_settings: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          provider: string
          refresh_token: string | null
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          provider: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          provider?: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          google_calendar_enabled: boolean | null
          google_calendar_refresh_token: string | null
          id: string
          phone: string | null
          phone_calendar_enabled: boolean | null
          terms_accepted: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          google_calendar_enabled?: boolean | null
          google_calendar_refresh_token?: string | null
          id: string
          phone?: string | null
          phone_calendar_enabled?: boolean | null
          terms_accepted?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          google_calendar_enabled?: boolean | null
          google_calendar_refresh_token?: string | null
          id?: string
          phone?: string | null
          phone_calendar_enabled?: boolean | null
          terms_accepted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          availability_status: string | null
          bank_account_holder_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          branch_code: string | null
          business_address: string | null
          business_description: string | null
          business_logo_url: string | null
          business_name: string | null
          city: string | null
          created_at: string
          gallery_images: string[] | null
          id: string
          is_public: boolean | null
          payout_date: number | null
          payout_frequency: string | null
          payout_start_date: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          service_categories: string[] | null
          suburb: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          branch_code?: string | null
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          gallery_images?: string[] | null
          id?: string
          is_public?: boolean | null
          payout_date?: number | null
          payout_frequency?: string | null
          payout_start_date?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          service_categories?: string[] | null
          suburb?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string | null
          bank_account_holder_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          branch_code?: string | null
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          gallery_images?: string[] | null
          id?: string
          is_public?: boolean | null
          payout_date?: number | null
          payout_frequency?: string | null
          payout_start_date?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          service_categories?: string[] | null
          suburb?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_working_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          provider_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          provider_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          provider_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          appointment_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_trends: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          trend_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          trend_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          trend_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_trends_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_available: boolean | null
          name: string
          price: number
          provider_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_available?: boolean | null
          name: string
          price: number
          provider_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trends: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          popularity_score: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          popularity_score?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          popularity_score?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          max_previews: number
          previews_used: number
          role: Database["public"]["Enums"]["user_role"]
          subscription_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_previews?: number
          previews_used?: number
          role: Database["public"]["Enums"]["user_role"]
          subscription_status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_previews?: number
          previews_used?: number
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      client_visible_provider_profiles: {
        Row: {
          availability_status: string | null
          business_address: string | null
          business_description: string | null
          business_logo_url: string | null
          business_name: string | null
          city: string | null
          created_at: string | null
          gallery_images: string[] | null
          id: string | null
          is_public: boolean | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          suburb: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: string | null
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_public?: boolean | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          suburb?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: string | null
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_public?: boolean | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          suburb?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_provider_profiles: {
        Row: {
          availability_status: string | null
          business_address: string | null
          business_description: string | null
          business_logo_url: string | null
          business_name: string | null
          city: string | null
          created_at: string | null
          gallery_images: string[] | null
          id: string | null
          is_public: boolean | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          suburb: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: string | null
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_public?: boolean | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          suburb?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: string | null
          business_address?: string | null
          business_description?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          gallery_images?: string[] | null
          id?: string | null
          is_public?: boolean | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          suburb?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_calendar_sync_status: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          id: string
          is_enabled: boolean
          provider: string
          token_expiry: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_calendar_tokens: {
        Args: {
          _access_token: string
          _provider: string
          _refresh_token: string
          _token_expiry: string
          _user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      user_role: "client" | "provider"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      user_role: ["client", "provider"],
    },
  },
} as const
