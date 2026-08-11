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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          area: string
          created_at: string
          disaster_id: string | null
          expires_at: string | null
          headline: string
          id: string
          issued_at: string
          issued_by: string
          message: string
          severity: Database["public"]["Enums"]["severity_level"]
        }
        Insert: {
          area: string
          created_at?: string
          disaster_id?: string | null
          expires_at?: string | null
          headline: string
          id?: string
          issued_at?: string
          issued_by?: string
          message?: string
          severity?: Database["public"]["Enums"]["severity_level"]
        }
        Update: {
          area?: string
          created_at?: string
          disaster_id?: string | null
          expires_at?: string | null
          headline?: string
          id?: string
          issued_at?: string
          issued_by?: string
          message?: string
          severity?: Database["public"]["Enums"]["severity_level"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_disaster_id_fkey"
            columns: ["disaster_id"]
            isOneToOne: false
            referencedRelation: "disasters"
            referencedColumns: ["id"]
          },
        ]
      }
      disaster_reports: {
        Row: {
          affected_estimate: number
          area: string
          created_at: string
          description: string
          disaster_id: string | null
          id: string
          latitude: number
          longitude: number
          reporter_email: string | null
          reporter_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["report_status"]
          title: string
          type: string
        }
        Insert: {
          affected_estimate?: number
          area: string
          created_at?: string
          description?: string
          disaster_id?: string | null
          id?: string
          latitude: number
          longitude: number
          reporter_email?: string | null
          reporter_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["report_status"]
          title: string
          type: string
        }
        Update: {
          affected_estimate?: number
          area?: string
          created_at?: string
          description?: string
          disaster_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          reporter_email?: string | null
          reporter_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "disaster_reports_disaster_id_fkey"
            columns: ["disaster_id"]
            isOneToOne: false
            referencedRelation: "disasters"
            referencedColumns: ["id"]
          },
        ]
      }
      disaster_updates: {
        Row: {
          author_email: string | null
          author_id: string | null
          created_at: string
          disaster_id: string
          id: string
          note: string
          severity: Database["public"]["Enums"]["severity_level"] | null
          status: Database["public"]["Enums"]["disaster_status"] | null
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          created_at?: string
          disaster_id: string
          id?: string
          note?: string
          severity?: Database["public"]["Enums"]["severity_level"] | null
          status?: Database["public"]["Enums"]["disaster_status"] | null
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          created_at?: string
          disaster_id?: string
          id?: string
          note?: string
          severity?: Database["public"]["Enums"]["severity_level"] | null
          status?: Database["public"]["Enums"]["disaster_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "disaster_updates_disaster_id_fkey"
            columns: ["disaster_id"]
            isOneToOne: false
            referencedRelation: "disasters"
            referencedColumns: ["id"]
          },
        ]
      }
      disasters: {
        Row: {
          affected_people: number
          area: string
          created_at: string
          description: string
          id: string
          latitude: number
          longitude: number
          occurred_at: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["disaster_status"]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          affected_people?: number
          area: string
          created_at?: string
          description?: string
          id?: string
          latitude: number
          longitude: number
          occurred_at?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["disaster_status"]
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          affected_people?: number
          area?: string
          created_at?: string
          description?: string
          id?: string
          latitude?: number
          longitude?: number
          occurred_at?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["disaster_status"]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string
          available_beds: number
          contact_phone: string | null
          created_at: string
          emergency_capable: boolean
          id: string
          latitude: number
          longitude: number
          name: string
          specialities: string[]
          total_beds: number
          updated_at: string
        }
        Insert: {
          address: string
          available_beds?: number
          contact_phone?: string | null
          created_at?: string
          emergency_capable?: boolean
          id?: string
          latitude: number
          longitude: number
          name: string
          specialities?: string[]
          total_beds?: number
          updated_at?: string
        }
        Update: {
          address?: string
          available_beds?: number
          contact_phone?: string | null
          created_at?: string
          emergency_capable?: boolean
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          specialities?: string[]
          total_beds?: number
          updated_at?: string
        }
        Relationships: []
      }
      ngos: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          coverage_area: string
          created_at: string
          description: string
          focus_areas: string[]
          id: string
          name: string
          verified: boolean
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          coverage_area: string
          created_at?: string
          description?: string
          focus_areas?: string[]
          id?: string
          name: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          coverage_area?: string
          created_at?: string
          description?: string
          focus_areas?: string[]
          id?: string
          name?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      rescue_team_updates: {
        Row: {
          author_email: string | null
          author_id: string | null
          created_at: string
          disaster_id: string | null
          id: string
          note: string
          status: Database["public"]["Enums"]["rescue_team_status"]
          team_id: string
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          created_at?: string
          disaster_id?: string | null
          id?: string
          note?: string
          status: Database["public"]["Enums"]["rescue_team_status"]
          team_id: string
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          created_at?: string
          disaster_id?: string | null
          id?: string
          note?: string
          status?: Database["public"]["Enums"]["rescue_team_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rescue_team_updates_disaster_id_fkey"
            columns: ["disaster_id"]
            isOneToOne: false
            referencedRelation: "disasters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rescue_team_updates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "rescue_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rescue_teams: {
        Row: {
          available: boolean
          base_area: string
          capabilities: string[]
          contact_phone: string | null
          created_at: string
          disaster_id: string | null
          id: string
          members: number
          name: string
          notes: string
          organisation: string
          status: Database["public"]["Enums"]["rescue_team_status"]
          updated_at: string
        }
        Insert: {
          available?: boolean
          base_area: string
          capabilities?: string[]
          contact_phone?: string | null
          created_at?: string
          disaster_id?: string | null
          id?: string
          members?: number
          name: string
          notes?: string
          organisation?: string
          status?: Database["public"]["Enums"]["rescue_team_status"]
          updated_at?: string
        }
        Update: {
          available?: boolean
          base_area?: string
          capabilities?: string[]
          contact_phone?: string | null
          created_at?: string
          disaster_id?: string | null
          id?: string
          members?: number
          name?: string
          notes?: string
          organisation?: string
          status?: Database["public"]["Enums"]["rescue_team_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rescue_teams_disaster_id_fkey"
            columns: ["disaster_id"]
            isOneToOne: false
            referencedRelation: "disasters"
            referencedColumns: ["id"]
          },
        ]
      }
      shelters: {
        Row: {
          address: string
          capacity: number
          contact_phone: string | null
          created_at: string
          facilities: string[]
          id: string
          latitude: number
          longitude: number
          name: string
          occupancy: number
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          capacity?: number
          contact_phone?: string | null
          created_at?: string
          facilities?: string[]
          id?: string
          latitude: number
          longitude: number
          name: string
          occupancy?: number
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          capacity?: number
          contact_phone?: string | null
          created_at?: string
          facilities?: string[]
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          occupancy?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "citizen" | "responder" | "admin"
      disaster_status:
        | "REPORTED"
        | "VERIFIED"
        | "ACTIVE"
        | "CONTAINED"
        | "RESOLVED"
      report_status: "PENDING" | "VERIFIED" | "REJECTED"
      rescue_team_status:
        | "AVAILABLE"
        | "DISPATCHED"
        | "ON_THE_WAY"
        | "ON_SITE"
        | "RESCUING"
        | "COMPLETED"
      severity_level: "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
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
      app_role: ["citizen", "responder", "admin"],
      disaster_status: [
        "REPORTED",
        "VERIFIED",
        "ACTIVE",
        "CONTAINED",
        "RESOLVED",
      ],
      report_status: ["PENDING", "VERIFIED", "REJECTED"],
      rescue_team_status: [
        "AVAILABLE",
        "DISPATCHED",
        "ON_THE_WAY",
        "ON_SITE",
        "RESCUING",
        "COMPLETED",
      ],
      severity_level: ["CRITICAL", "HIGH", "MODERATE", "LOW"],
    },
  },
} as const
