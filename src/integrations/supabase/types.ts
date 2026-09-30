export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_hash: string | null;
          metadata: Json;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_hash?: string | null;
          metadata?: Json;
          user_id?: string | null;
        };
        Relationships: [];
      };
      case_embeddings: {
        Row: {
          content_hash: string;
          created_at: string;
          embedding: string;
          embedding_model: string;
          historical_case_id: string;
          id: string;
        };
        Insert: {
          content_hash: string;
          created_at?: string;
          embedding: string;
          embedding_model: string;
          historical_case_id: string;
          id?: string;
        };
        Update: {
          content_hash?: string;
          created_at?: string;
          embedding?: string;
          embedding_model?: string;
          historical_case_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_embeddings_historical_case_id_fkey";
            columns: ["historical_case_id"];
            isOneToOne: false;
            referencedRelation: "historical_cases";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluations: {
        Row: {
          analysis_id: string;
          clarity_score: number | null;
          completeness_score: number | null;
          created_at: string;
          disclaimer_score: number | null;
          explanation: Json | null;
          grounding_score: number | null;
          id: string;
          judge_model: string | null;
          overall_score: number | null;
          status: string;
          unsupported_claim_score: number | null;
        };
        Insert: {
          analysis_id: string;
          clarity_score?: number | null;
          completeness_score?: number | null;
          created_at?: string;
          disclaimer_score?: number | null;
          explanation?: Json | null;
          grounding_score?: number | null;
          id?: string;
          judge_model?: string | null;
          overall_score?: number | null;
          status: string;
          unsupported_claim_score?: number | null;
        };
        Update: {
          analysis_id?: string;
          clarity_score?: number | null;
          completeness_score?: number | null;
          created_at?: string;
          disclaimer_score?: number | null;
          explanation?: Json | null;
          grounding_score?: number | null;
          id?: string;
          judge_model?: string | null;
          overall_score?: number | null;
          status?: string;
          unsupported_claim_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "transaction_analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      historical_cases: {
        Row: {
          amount: number;
          case_id: string;
          country: string;
          created_at: string;
          currency: string;
          description: string;
          device_new: boolean;
          id: string;
          international: boolean;
          merchant_category: string;
          risk_level: Database["public"]["Enums"]["risk_level"];
          source_type: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          case_id: string;
          country: string;
          created_at?: string;
          currency?: string;
          description: string;
          device_new: boolean;
          id?: string;
          international: boolean;
          merchant_category: string;
          risk_level: Database["public"]["Enums"]["risk_level"];
          source_type?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          case_id?: string;
          country?: string;
          created_at?: string;
          currency?: string;
          description?: string;
          device_new?: boolean;
          id?: string;
          international?: boolean;
          merchant_category?: string;
          risk_level?: Database["public"]["Enums"]["risk_level"];
          source_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kyc_profiles: {
        Row: {
          account_age_days: number;
          created_at: string;
          customer_id: string;
          display_name: string;
          id: string;
          is_synthetic: boolean;
          known_device_count: number;
          risk_context: string;
          typical_max_amount: number;
          typical_min_amount: number;
          updated_at: string;
          usual_country: string;
        };
        Insert: {
          account_age_days: number;
          created_at?: string;
          customer_id: string;
          display_name: string;
          id?: string;
          is_synthetic?: boolean;
          known_device_count: number;
          risk_context: string;
          typical_max_amount: number;
          typical_min_amount: number;
          updated_at?: string;
          usual_country: string;
        };
        Update: {
          account_age_days?: number;
          created_at?: string;
          customer_id?: string;
          display_name?: string;
          id?: string;
          is_synthetic?: boolean;
          known_device_count?: number;
          risk_context?: string;
          typical_max_amount?: number;
          typical_min_amount?: number;
          updated_at?: string;
          usual_country?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      retrieved_cases: {
        Row: {
          analysis_id: string;
          created_at: string;
          historical_case_id: string;
          id: string;
          rank: number;
          similarity_score: number;
        };
        Insert: {
          analysis_id: string;
          created_at?: string;
          historical_case_id: string;
          id?: string;
          rank: number;
          similarity_score: number;
        };
        Update: {
          analysis_id?: string;
          created_at?: string;
          historical_case_id?: string;
          id?: string;
          rank?: number;
          similarity_score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "retrieved_cases_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "transaction_analyses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "retrieved_cases_historical_case_id_fkey";
            columns: ["historical_case_id"];
            isOneToOne: false;
            referencedRelation: "historical_cases";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_reports: {
        Row: {
          analysis_id: string;
          created_at: string;
          id: string;
          notes: string | null;
          report_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analysis_id: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          report_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analysis_id?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          report_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_reports_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "transaction_analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      security_events: {
        Row: {
          analysis_id: string | null;
          created_at: string;
          details: Json;
          event_type: string;
          field_name: string | null;
          id: string;
          matched_pattern: string | null;
          neutralized: boolean;
          severity: string;
          transaction_id: string | null;
        };
        Insert: {
          analysis_id?: string | null;
          created_at?: string;
          details?: Json;
          event_type: string;
          field_name?: string | null;
          id?: string;
          matched_pattern?: string | null;
          neutralized?: boolean;
          severity: string;
          transaction_id?: string | null;
        };
        Update: {
          analysis_id?: string | null;
          created_at?: string;
          details?: Json;
          event_type?: string;
          field_name?: string | null;
          id?: string;
          matched_pattern?: string | null;
          neutralized?: boolean;
          severity?: string;
          transaction_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "security_events_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "transaction_analyses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "security_events_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction_analyses: {
        Row: {
          ai_model: string | null;
          created_at: string;
          created_by: string | null;
          duration_ms: number | null;
          fallback_reason: string | null;
          id: string;
          kyc_snapshot: Json | null;
          narrative: string;
          narrative_source: string;
          prompt_injection_detected: boolean;
          reason_codes: string[];
          recommended_action: string;
          report: Json;
          risk_level: Database["public"]["Enums"]["risk_level"];
          risk_score: number;
          stages: Json;
          supporting_evidence: Json;
          transaction_id: string;
          validation_status: string;
        };
        Insert: {
          ai_model?: string | null;
          created_at?: string;
          created_by?: string | null;
          duration_ms?: number | null;
          fallback_reason?: string | null;
          id?: string;
          kyc_snapshot?: Json | null;
          narrative: string;
          narrative_source: string;
          prompt_injection_detected?: boolean;
          reason_codes?: string[];
          recommended_action: string;
          report: Json;
          risk_level: Database["public"]["Enums"]["risk_level"];
          risk_score: number;
          stages?: Json;
          supporting_evidence?: Json;
          transaction_id: string;
          validation_status: string;
        };
        Update: {
          ai_model?: string | null;
          created_at?: string;
          created_by?: string | null;
          duration_ms?: number | null;
          fallback_reason?: string | null;
          id?: string;
          kyc_snapshot?: Json | null;
          narrative?: string;
          narrative_source?: string;
          prompt_injection_detected?: boolean;
          reason_codes?: string[];
          recommended_action?: string;
          report?: Json;
          risk_level?: Database["public"]["Enums"]["risk_level"];
          risk_score?: number;
          stages?: Json;
          supporting_evidence?: Json;
          transaction_id?: string;
          validation_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_analyses_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          country: string;
          created_at: string;
          created_by: string | null;
          currency: string;
          customer_id: string;
          device_id: string | null;
          device_new: boolean;
          id: string;
          international: boolean;
          is_sample: boolean;
          memo: string;
          merchant_category: string;
          status: string;
          transaction_id: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          country: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          customer_id: string;
          device_id?: string | null;
          device_new: boolean;
          id?: string;
          international: boolean;
          is_sample?: boolean;
          memo?: string;
          merchant_category: string;
          status?: string;
          transaction_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          country?: string;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          customer_id?: string;
          device_id?: string | null;
          device_new?: boolean;
          id?: string;
          international?: boolean;
          is_sample?: boolean;
          memo?: string;
          merchant_category?: string;
          status?: string;
          transaction_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_write: { Args: { _user_id: string }; Returns: boolean };
      has_any_role: { Args: { _user_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      match_cases: {
        Args: { match_count: number; model: string; query_embedding: string };
        Returns: {
          historical_case_id: string;
          similarity: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "analyst" | "viewer";
      risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "analyst", "viewer"],
      risk_level: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
  },
} as const;
