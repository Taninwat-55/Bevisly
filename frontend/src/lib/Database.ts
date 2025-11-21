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
      feedback: {
        Row: {
          ai_summary: string | null
          comments: string | null
          created_at: string | null
          employer_id: string | null
          id: string
          improvements: string | null
          rating: number | null
          reviewer_id: string | null
          stars: number | null
          strengths: string | null
          submission_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          comments?: string | null
          created_at?: string | null
          employer_id?: string | null
          id?: string
          improvements?: string | null
          rating?: number | null
          reviewer_id?: string | null
          stars?: number | null
          strengths?: string | null
          submission_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          comments?: string | null
          created_at?: string | null
          employer_id?: string | null
          id?: string
          improvements?: string | null
          rating?: number | null
          reviewer_id?: string | null
          stars?: number | null
          strengths?: string | null
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "proof_cards"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_messages: {
        Row: {
          category: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string
          page: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          page?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          page?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string | null
          created_at: string | null
          department: string | null
          description: string | null
          employer_id: string | null
          featured: boolean | null
          id: string
          is_public: boolean | null
          job_type: string | null
          location: string | null
          paid: boolean | null
          pay_period: string | null
          payment_amount: number | null
          payment_currency: string | null
          required_skills: string[] | null
          salary_max: number | null
          salary_min: number | null
          show_salary_range: boolean | null
          status: string | null
          title: string
          updated_at: string | null
          work_mode: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          employer_id?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          job_type?: string | null
          location?: string | null
          paid?: boolean | null
          pay_period?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          show_salary_range?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_mode?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          employer_id?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          job_type?: string | null
          location?: string | null
          paid?: boolean | null
          pay_period?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          show_salary_range?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          credits: number | null
          email: string | null
          full_name: string | null
          id: string
          resume_updated_at: string | null
          resume_url: string | null
          role: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          credits?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          resume_updated_at?: string | null
          resume_url?: string | null
          role?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          credits?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          resume_updated_at?: string | null
          resume_url?: string | null
          role?: string
        }
        Relationships: []
      }
      proof_tasks: {
        Row: {
          ai_generated: boolean | null
          ai_tools_allowed: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          expected_time: string | null
          id: string
          instructions: string | null
          job_id: string | null
          recommended_platform: string | null
          submission_format: string | null
          submission_type: string | null
          title: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_tools_allowed?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          expected_time?: string | null
          id?: string
          instructions?: string | null
          job_id?: string | null
          recommended_platform?: string | null
          submission_format?: string | null
          submission_type?: string | null
          title: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_tools_allowed?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          expected_time?: string | null
          id?: string
          instructions?: string | null
          job_id?: string | null
          recommended_platform?: string | null
          submission_format?: string | null
          submission_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "employer_job_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "proof_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          employer_notes: string | null
          hiring_stage: string | null
          id: string
          job_id: string | null
          proof_link: string | null
          proof_task_id: string | null
          reflection: string | null
          resume_metadata: Json | null
          resume_url: string | null
          score: number | null
          started_at: string | null
          status: string | null
          submission_link: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          employer_notes?: string | null
          hiring_stage?: string | null
          id?: string
          job_id?: string | null
          proof_link?: string | null
          proof_task_id?: string | null
          reflection?: string | null
          resume_metadata?: Json | null
          resume_url?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          submission_link?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          employer_notes?: string | null
          hiring_stage?: string | null
          id?: string
          job_id?: string | null
          proof_link?: string | null
          proof_task_id?: string | null
          reflection?: string | null
          resume_metadata?: Json | null
          resume_url?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          submission_link?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "employer_job_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_proof_task_id_fkey"
            columns: ["proof_task_id"]
            isOneToOne: false
            referencedRelation: "proof_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employer_job_summary: {
        Row: {
          avg_score: number | null
          employer_id: string | null
          job_id: string | null
          submissions_count: number | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_cards: {
        Row: {
          candidate_name: string | null
          comments: string | null
          id: string | null
          job_title: string | null
          rating: number | null
          reviewed_at: string | null
          share_url: string | null
          submission_id: string | null
          task_title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_user_account: { Args: never; Returns: undefined }
      get_job_detail: {
        Args: { job_id_input: string }
        Returns: {
          ai_tools_allowed: boolean
          company: string
          created_at: string
          description: string
          duration_minutes: number
          expected_time: string
          id: string
          paid: boolean
          proof_task_instructions: string
          proof_task_title: string
          submission_format: string
          title: string
        }[]
      }
      get_public_jobs: {
        Args: never
        Returns: {
          company: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          paid: boolean
          proof_task: string
          title: string
        }[]
      }
      get_recent_activity: {
        Args: { user_id: string }
        Returns: {
          comments: string
          id: string
          job_title: string
          rating: number
          reviewed_at: string
        }[]
      }
      get_user_rank: { Args: { user_id: string }; Returns: number }
      is_admin: { Args: { uid: string }; Returns: boolean }
      promote_to_admin: { Args: never; Returns: undefined }
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
