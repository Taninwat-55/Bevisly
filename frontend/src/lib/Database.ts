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
      ai_usage_logs: {
        Row: {
          ip_address: string
          last_request_at: string | null
          request_count: number | null
        }
        Insert: {
          ip_address: string
          last_request_at?: string | null
          request_count?: number | null
        }
        Update: {
          ip_address?: string
          last_request_at?: string | null
          request_count?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          culture: string | null
          description: string | null
          id: string
          logo_url: string | null
          mission: string | null
          name: string
          owner_id: string | null
          responsibility_score: number | null
          slug: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          culture?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          name: string
          owner_id?: string | null
          responsibility_score?: number | null
          slug?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          culture?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          name?: string
          owner_id?: string | null
          responsibility_score?: number | null
          slug?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          invited_by: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reason: string
          related_entity_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reason: string
          related_entity_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string
          related_entity_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      invitations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string | null
          company: string | null
          company_id: string | null
          created_at: string | null
          department: string | null
          description: string | null
          employer_id: string | null
          expires_at: string | null
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
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          show_salary_range: boolean | null
          status: string | null
          title: string
          updated_at: string | null
          work_mode: string | null
        }
        Insert: {
          apply_url?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          employer_id?: string | null
          expires_at?: string | null
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
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          show_salary_range?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_mode?: string | null
        }
        Update: {
          apply_url?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          employer_id?: string | null
          expires_at?: string | null
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
          requirements?: string | null
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
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_submissions: {
        Row: {
          ai_feedback: string | null
          ai_improvements: string | null
          ai_score: number | null
          ai_strengths: string | null
          created_at: string | null
          credits_awarded: number | null
          graded_at: string | null
          id: string
          practice_task_id: string
          submission_content: string | null
          submission_link: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_improvements?: string | null
          ai_score?: number | null
          ai_strengths?: string | null
          created_at?: string | null
          credits_awarded?: number | null
          graded_at?: string | null
          id?: string
          practice_task_id: string
          submission_content?: string | null
          submission_link?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_improvements?: string | null
          ai_score?: number | null
          ai_strengths?: string | null
          created_at?: string | null
          credits_awarded?: number | null
          graded_at?: string | null
          id?: string
          practice_task_id?: string
          submission_content?: string | null
          submission_link?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_submissions_practice_task_id_fkey"
            columns: ["practice_task_id"]
            isOneToOne: false
            referencedRelation: "practice_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_tasks: {
        Row: {
          category: string
          created_at: string | null
          description: string
          difficulty: string
          expected_time: string
          id: string
          skills: string[] | null
          submission_format: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          difficulty?: string
          expected_time?: string
          id?: string
          skills?: string[] | null
          submission_format?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          expected_time?: string
          id?: string
          skills?: string[] | null
          submission_format?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_jobs_count: number | null
          avatar_url: string | null
          bevisly_score: number
          billing_period_end: string | null
          billing_period_start: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          credits: number | null
          email: string | null
          full_name: string | null
          github_url: string | null
          id: string
          is_public: boolean | null
          is_verified: boolean
          languages: string[] | null
          linkedin_url: string | null
          monthly_job_posts_count: number | null
          reliability_score: number | null
          resume_updated_at: string | null
          resume_url: string | null
          role: string
          skills: string[] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier_enum"]
            | null
          username: string | null
          website_url: string | null
          work_status: string | null
        }
        Insert: {
          active_jobs_count?: number | null
          avatar_url?: string | null
          bevisly_score?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          credits?: number | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          is_public?: boolean | null
          is_verified?: boolean
          languages?: string[] | null
          linkedin_url?: string | null
          monthly_job_posts_count?: number | null
          reliability_score?: number | null
          resume_updated_at?: string | null
          resume_url?: string | null
          role?: string
          skills?: string[] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier_enum"]
            | null
          username?: string | null
          website_url?: string | null
          work_status?: string | null
        }
        Update: {
          active_jobs_count?: number | null
          avatar_url?: string | null
          bevisly_score?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          credits?: number | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean
          languages?: string[] | null
          linkedin_url?: string | null
          monthly_job_posts_count?: number | null
          reliability_score?: number | null
          resume_updated_at?: string | null
          resume_url?: string | null
          role?: string
          skills?: string[] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier_enum"]
            | null
          username?: string | null
          website_url?: string | null
          work_status?: string | null
        }
        Relationships: []
      }
      proof_tasks: {
        Row: {
          ai_generated: boolean | null
          ai_tools_allowed: boolean | null
          attachments: string[] | null
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
          attachments?: string[] | null
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
          attachments?: string[] | null
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
      saved_jobs: {
        Row: {
          created_at: string | null
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "employer_job_summary"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          employer_notes: string | null
          file_url: string | null
          hiring_stage: string | null
          id: string
          is_fast_pass: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          job_id: string | null
          offer_email_sent: boolean
          proof_link: string | null
          proof_task_id: string | null
          reflection: string | null
          rejection_email_sent: boolean
          resume_metadata: Json | null
          resume_url: string | null
          score: number | null
          started_at: string | null
          status: string | null
          submission_link: string | null
          text_response: string | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          employer_notes?: string | null
          file_url?: string | null
          hiring_stage?: string | null
          id?: string
          is_fast_pass?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          job_id?: string | null
          offer_email_sent?: boolean
          proof_link?: string | null
          proof_task_id?: string | null
          reflection?: string | null
          rejection_email_sent?: boolean
          resume_metadata?: Json | null
          resume_url?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          submission_link?: string | null
          text_response?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          employer_notes?: string | null
          file_url?: string | null
          hiring_stage?: string | null
          id?: string
          is_fast_pass?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          job_id?: string | null
          offer_email_sent?: boolean
          proof_link?: string | null
          proof_task_id?: string | null
          reflection?: string | null
          rejection_email_sent?: boolean
          resume_metadata?: Json | null
          resume_url?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          submission_link?: string | null
          text_response?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
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
          company_id: string | null
          employer_id: string | null
          job_id: string | null
          submissions_count: number | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          company_name: string | null
          id: string | null
          improvements: string | null
          is_featured: boolean | null
          is_public: boolean | null
          job_title: string | null
          rating: number | null
          reviewed_at: string | null
          share_url: string | null
          strengths: string | null
          submission_id: string | null
          task_title: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
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
    Functions: {
      check_ai_rate_limit: {
        Args: { p_ip: string; p_limit?: number }
        Returns: boolean
      }
      check_invite_code: { Args: { invite_code: string }; Returns: boolean }
      claim_invite_code: { Args: { invite_code: string }; Returns: undefined }
      compute_bevisly_score: { Args: { p_user_id: string }; Returns: number }
      compute_reliability_score: {
        Args: { p_user_id: string }
        Returns: number
      }
      compute_responsibility_score: {
        Args: { p_company_id: string }
        Returns: number
      }
      deduct_credits: {
        Args: { amount: number; user_id_input: string }
        Returns: boolean
      }
      delete_user_account: { Args: never; Returns: undefined }
      distribute_credits: {
        Args: {
          p_amount: number
          p_entity_id?: string
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_credit_balance: { Args: { p_user_id: string }; Returns: number }
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
      get_platform_stats: { Args: never; Returns: Json }
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
          submission_id: string
        }[]
      }
      get_user_rank: { Args: { user_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_company_admin_or_owner: {
        Args: { p_company_id: string }
        Returns: boolean
      }
      is_company_member: { Args: { p_company_id: string }; Returns: boolean }
      is_demo_admin: { Args: never; Returns: boolean }
      spend_credits: {
        Args: {
          p_amount: number
          p_entity_id?: string
          p_reason: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      subscription_tier_enum: "free" | "pro_saas"
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
      subscription_tier_enum: ["free", "pro_saas"],
    },
  },
} as const
