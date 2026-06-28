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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brand_unicorn: {
        Row: {
          biggest_challenges: string | null
          created_at: string
          id: string
          last_refined_at: string | null
          lights_her_up: string | null
          name: string | null
          unicorn_signal: string | null
          updated_at: string
          what_she_desires: string | null
          what_she_tried: string | null
          who_she_is: string | null
        }
        Insert: {
          biggest_challenges?: string | null
          created_at?: string
          id?: string
          last_refined_at?: string | null
          lights_her_up?: string | null
          name?: string | null
          unicorn_signal?: string | null
          updated_at?: string
          what_she_desires?: string | null
          what_she_tried?: string | null
          who_she_is?: string | null
        }
        Update: {
          biggest_challenges?: string | null
          created_at?: string
          id?: string
          last_refined_at?: string | null
          lights_her_up?: string | null
          name?: string | null
          unicorn_signal?: string | null
          updated_at?: string
          what_she_desires?: string | null
          what_she_tried?: string | null
          who_she_is?: string | null
        }
        Relationships: []
      }
      gumdrop_trail: {
        Row: {
          coach_notes_loved: string | null
          coach_notes_misaligned: string | null
          created_at: string
          flavor_color: string | null
          framework_id: string | null
          id: string
          landing_page_copy: string | null
          launch_plan: Json | null
          launched_at: string | null
          linked_sexy_unicorn_offer_id: string | null
          name: string
          offer_length: string | null
          price: number | null
          sales_page_copy: string | null
          status: string
          tagline: string | null
          trail_avatar: Json | null
          updated_at: string
          welcome_email_body: string | null
          welcome_email_subject: string | null
        }
        Insert: {
          coach_notes_loved?: string | null
          coach_notes_misaligned?: string | null
          created_at?: string
          flavor_color?: string | null
          framework_id?: string | null
          id?: string
          landing_page_copy?: string | null
          launch_plan?: Json | null
          launched_at?: string | null
          linked_sexy_unicorn_offer_id?: string | null
          name?: string
          offer_length?: string | null
          price?: number | null
          sales_page_copy?: string | null
          status?: string
          tagline?: string | null
          trail_avatar?: Json | null
          updated_at?: string
          welcome_email_body?: string | null
          welcome_email_subject?: string | null
        }
        Update: {
          coach_notes_loved?: string | null
          coach_notes_misaligned?: string | null
          created_at?: string
          flavor_color?: string | null
          framework_id?: string | null
          id?: string
          landing_page_copy?: string | null
          launch_plan?: Json | null
          launched_at?: string | null
          linked_sexy_unicorn_offer_id?: string | null
          name?: string
          offer_length?: string | null
          price?: number | null
          sales_page_copy?: string | null
          status?: string
          tagline?: string | null
          trail_avatar?: Json | null
          updated_at?: string
          welcome_email_body?: string | null
          welcome_email_subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gumdrop_trail_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "rainbow_road"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gumdrop_trail_linked_sexy_unicorn_offer_id_fkey"
            columns: ["linked_sexy_unicorn_offer_id"]
            isOneToOne: false
            referencedRelation: "sexy_unicorn_offer"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_gumdrop: {
        Row: {
          created_at: string
          drool_factor: string | null
          embodiment_notes: string | null
          id: string
          last_refined_at: string | null
          name: string | null
          tagline_10x: string | null
          unique_mechanism: string | null
          updated_at: string
          x_factor_statement: string | null
        }
        Insert: {
          created_at?: string
          drool_factor?: string | null
          embodiment_notes?: string | null
          id?: string
          last_refined_at?: string | null
          name?: string | null
          tagline_10x?: string | null
          unique_mechanism?: string | null
          updated_at?: string
          x_factor_statement?: string | null
        }
        Update: {
          created_at?: string
          drool_factor?: string | null
          embodiment_notes?: string | null
          id?: string
          last_refined_at?: string | null
          name?: string | null
          tagline_10x?: string | null
          unique_mechanism?: string | null
          updated_at?: string
          x_factor_statement?: string | null
        }
        Relationships: []
      }
      metamorphosis_entry: {
        Row: {
          ai_reflection_prompt: string | null
          created_at: string
          entry_date: string
          entry_text: string
          id: string
        }
        Insert: {
          ai_reflection_prompt?: string | null
          created_at?: string
          entry_date?: string
          entry_text: string
          id?: string
        }
        Update: {
          ai_reflection_prompt?: string | null
          created_at?: string
          entry_date?: string
          entry_text?: string
          id?: string
        }
        Relationships: []
      }
      rainbow_road: {
        Row: {
          bridge_gap: string | null
          created_at: string
          id: string
          linked_sexy_unicorn_offer_id: string | null
          name: string
          steps: Json | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          bridge_gap?: string | null
          created_at?: string
          id?: string
          linked_sexy_unicorn_offer_id?: string | null
          name: string
          steps?: Json | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          bridge_gap?: string | null
          created_at?: string
          id?: string
          linked_sexy_unicorn_offer_id?: string | null
          name?: string
          steps?: Json | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "rainbow_road_linked_sexy_unicorn_offer_id_fkey"
            columns: ["linked_sexy_unicorn_offer_id"]
            isOneToOne: false
            referencedRelation: "sexy_unicorn_offer"
            referencedColumns: ["id"]
          },
        ]
      }
      sexy_unicorn_offer: {
        Row: {
          created_at: string
          curriculum_overview: string | null
          format: string | null
          id: string
          length: string | null
          name: string
          price: number | null
          pricing_tiers: Json | null
          status: string
          tagline: string | null
          transformation: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curriculum_overview?: string | null
          format?: string | null
          id?: string
          length?: string | null
          name: string
          price?: number | null
          pricing_tiers?: Json | null
          status?: string
          tagline?: string | null
          transformation?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curriculum_overview?: string | null
          format?: string | null
          id?: string
          length?: string | null
          name?: string
          price?: number | null
          pricing_tiers?: Json | null
          status?: string
          tagline?: string | null
          transformation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trail_performance: {
        Row: {
          conversion_rate: number | null
          engagement_metrics: Json | null
          id: string
          recorded_at: string
          revenue: number | null
          signups: number | null
          trail_id: string
        }
        Insert: {
          conversion_rate?: number | null
          engagement_metrics?: Json | null
          id?: string
          recorded_at?: string
          revenue?: number | null
          signups?: number | null
          trail_id: string
        }
        Update: {
          conversion_rate?: number | null
          engagement_metrics?: Json | null
          id?: string
          recorded_at?: string
          revenue?: number | null
          signups?: number | null
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_performance_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "gumdrop_trail"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_profile: {
        Row: {
          blacklist_words: Json | null
          created_at: string
          edit_corrections: Json | null
          id: string
          last_synthesized_at: string | null
          self_descriptors: Json | null
          signature_words: Json | null
          signoff: string | null
          swearing_level: string | null
          synthesized_voice_summary: string | null
          updated_at: string
          writing_samples: Json | null
        }
        Insert: {
          blacklist_words?: Json | null
          created_at?: string
          edit_corrections?: Json | null
          id?: string
          last_synthesized_at?: string | null
          self_descriptors?: Json | null
          signature_words?: Json | null
          signoff?: string | null
          swearing_level?: string | null
          synthesized_voice_summary?: string | null
          updated_at?: string
          writing_samples?: Json | null
        }
        Update: {
          blacklist_words?: Json | null
          created_at?: string
          edit_corrections?: Json | null
          id?: string
          last_synthesized_at?: string | null
          self_descriptors?: Json | null
          signature_words?: Json | null
          signoff?: string | null
          swearing_level?: string | null
          synthesized_voice_summary?: string | null
          updated_at?: string
          writing_samples?: Json | null
        }
        Relationships: []
      }
      leap_decisions: {
        Row: {
          id: string
          decision_text: string
          q1_expands_vision: string | null
          q2_requires_genius: string | null
          q3_comfort_or_calling: string | null
          q4_self_abandonment: string | null
          q5_future_self: string | null
          output: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          decision_text: string
          q1_expands_vision?: string | null
          q2_requires_genius?: string | null
          q3_comfort_or_calling?: string | null
          q4_self_abandonment?: string | null
          q5_future_self?: string | null
          output?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          decision_text?: string
          q1_expands_vision?: string | null
          q2_requires_genius?: string | null
          q3_comfort_or_calling?: string | null
          q4_self_abandonment?: string | null
          q5_future_self?: string | null
          output?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      leap_os: {
        Row: {
          id: string
          current_version: string
          expansion_goal: string | null
          wins: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          current_version?: string
          expansion_goal?: string | null
          wins?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          current_version?: string
          expansion_goal?: string | null
          wins?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leap_progress: {
        Row: {
          id: string
          installation_id: string
          step_key: string
          response: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          installation_id: string
          step_key: string
          response?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          installation_id?: string
          step_key?: string
          response?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leap_weekly_audit: {
        Row: {
          id: string
          week_date: string
          alignment_score: number | null
          energy_score: number | null
          calling_score: number | null
          expansion_score: number | null
          self_abandonment_score: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          week_date?: string
          alignment_score?: number | null
          energy_score?: number | null
          calling_score?: number | null
          expansion_score?: number | null
          self_abandonment_score?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          week_date?: string
          alignment_score?: number | null
          energy_score?: number | null
          calling_score?: number | null
          expansion_score?: number | null
          self_abandonment_score?: number | null
          notes?: string | null
          created_at?: string
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
    Enums: {},
  },
} as const
