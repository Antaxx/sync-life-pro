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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          mrr: number | null
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          mrr?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          mrr?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          author: string | null
          content_type: string
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          content_type?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          content_type?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finances: {
        Row: {
          amount: number
          category: string
          client_id: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          recurring: boolean | null
          scope: string
          tool_id: string | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          client_id?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          recurring?: boolean | null
          scope?: string
          tool_id?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          recurring?: boolean | null
          scope?: string
          tool_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finances_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string
          difficulty: string
          id: string
          next_review: string
          question: string
          review_count: number
          subject_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          difficulty?: string
          id?: string
          next_review?: string
          question: string
          review_count?: number
          subject_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          difficulty?: string
          id?: string
          next_review?: string
          question?: string
          review_count?: number
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          coefficient: number
          created_at: string
          date: string
          grade: number
          id: string
          max_grade: number
          subject_id: string
          title: string
          user_id: string
        }
        Insert: {
          coefficient?: number
          created_at?: string
          date?: string
          grade: number
          id?: string
          max_grade?: number
          subject_id: string
          title: string
          user_id: string
        }
        Update: {
          coefficient?: number
          created_at?: string
          date?: string
          grade?: number
          id?: string
          max_grade?: number
          subject_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          created_at: string
          id: string
          sleep_goal_hours: number
          sport_sessions_goal: number
          steps_goal: number
          updated_at: string
          user_id: string
          water_goal_ml: number
        }
        Insert: {
          created_at?: string
          id?: string
          sleep_goal_hours?: number
          sport_sessions_goal?: number
          steps_goal?: number
          updated_at?: string
          user_id: string
          water_goal_ml?: number
        }
        Update: {
          created_at?: string
          id?: string
          sleep_goal_hours?: number
          sport_sessions_goal?: number
          steps_goal?: number
          updated_at?: string
          user_id?: string
          water_goal_ml?: number
        }
        Relationships: []
      }
      health_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          notes: string | null
          sleep_hours: number | null
          sport_done: boolean | null
          sport_duration_min: number | null
          sport_type: string | null
          steps: number | null
          updated_at: string
          user_id: string
          water_ml: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number | null
          sport_done?: boolean | null
          sport_duration_min?: number | null
          sport_type?: string | null
          steps?: number | null
          updated_at?: string
          user_id: string
          water_ml?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number | null
          sport_done?: boolean | null
          sport_duration_min?: number | null
          sport_type?: string | null
          steps?: number | null
          updated_at?: string
          user_id?: string
          water_ml?: number | null
        }
        Relationships: []
      }
      highlights: {
        Row: {
          article_id: string | null
          color: string | null
          content_item_id: string | null
          created_at: string
          id: string
          note: string | null
          text: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          color?: string | null
          content_item_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          text: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          color?: string | null
          content_item_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlights_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "rss_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlights_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: string
          status: string
          subject_id: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          status?: string
          subject_id: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          status?: string
          subject_id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      life_buckets: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      long_term_goals: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          life_bucket_id: string | null
          name: string
          progress: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          life_bucket_id?: string | null
          name: string
          progress?: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          life_bucket_id?: string | null
          name?: string
          progress?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "long_term_goals_life_bucket_id_fkey"
            columns: ["life_bucket_id"]
            isOneToOne: false
            referencedRelation: "life_buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      note_links: {
        Row: {
          created_at: string
          id: string
          source_note_id: string
          target_note_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_note_id: string
          target_note_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_note_id?: string
          target_note_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_links_source_note_id_fkey"
            columns: ["source_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_links_target_note_id_fkey"
            columns: ["target_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          note_type: string
          source_content_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          note_type?: string
          source_content_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          note_type?: string
          source_content_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_source_content_id_fkey"
            columns: ["source_content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          life_bucket_id: string | null
          name: string
          progress: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          life_bucket_id?: string | null
          name: string
          progress?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          life_bucket_id?: string | null
          name?: string
          progress?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_life_bucket_id_fkey"
            columns: ["life_bucket_id"]
            isOneToOne: false
            referencedRelation: "life_buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          tasks: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          tasks?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          tasks?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rss_articles: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          feed_id: string | null
          id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          feed_id?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          feed_id?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rss_articles_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          created_at: string
          favicon_url: string | null
          id: string
          name: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favicon_url?: string | null
          id?: string
          name: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          favicon_url?: string | null
          id?: string
          name?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          recurrent: boolean
          room: string | null
          start_time: string
          subject_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          recurrent?: boolean
          room?: string | null
          start_time: string
          subject_id: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          recurrent?: boolean
          room?: string | null
          start_time?: string
          subject_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          session_date: string
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          notes?: string | null
          session_date?: string
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          last_session_date: string | null
          level: string
          name: string
          progress: number
          streak_days: number | null
          total_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          last_session_date?: string | null
          level?: string
          name: string
          progress?: number
          streak_days?: number | null
          total_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          last_session_date?: string | null
          level?: string
          name?: string
          progress?: number
          streak_days?: number | null
          total_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          coefficient: number
          color: string
          created_at: string
          id: string
          name: string
          teacher: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coefficient?: number
          color?: string
          created_at?: string
          id?: string
          name: string
          teacher?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coefficient?: number
          color?: string
          created_at?: string
          id?: string
          name?: string
          teacher?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          important: boolean
          life_bucket_id: string | null
          move_the_needle: boolean
          project_id: string | null
          sort_order: number
          state_of_mind: string | null
          text: string
          updated_at: string
          urgent: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          important?: boolean
          life_bucket_id?: string | null
          move_the_needle?: boolean
          project_id?: string | null
          sort_order?: number
          state_of_mind?: string | null
          text: string
          updated_at?: string
          urgent?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          important?: boolean
          life_bucket_id?: string | null
          move_the_needle?: boolean
          project_id?: string | null
          sort_order?: number
          state_of_mind?: string | null
          text?: string
          updated_at?: string
          urgent?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_life_bucket_id_fkey"
            columns: ["life_bucket_id"]
            isOneToOne: false
            referencedRelation: "life_buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          favicon_url: string | null
          id: string
          name: string
          price_monthly: number | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          favicon_url?: string | null
          id?: string
          name: string
          price_monthly?: number | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          favicon_url?: string | null
          id?: string
          name?: string
          price_monthly?: number | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          challenges: string[] | null
          created_at: string
          energy_level: number | null
          id: string
          lessons: string[] | null
          next_week_focus: string[] | null
          user_id: string
          week_start: string
          wins: string[] | null
        }
        Insert: {
          challenges?: string[] | null
          created_at?: string
          energy_level?: number | null
          id?: string
          lessons?: string[] | null
          next_week_focus?: string[] | null
          user_id: string
          week_start: string
          wins?: string[] | null
        }
        Update: {
          challenges?: string[] | null
          created_at?: string
          energy_level?: number | null
          id?: string
          lessons?: string[] | null
          next_week_focus?: string[] | null
          user_id?: string
          week_start?: string
          wins?: string[] | null
        }
        Relationships: []
      }
      youtube_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_ideas: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          potential_score: number
          proposed_by: string
          title: string
          voters: string[] | null
          votes: number
          workspace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          potential_score?: number
          proposed_by: string
          title: string
          voters?: string[] | null
          votes?: number
          workspace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          potential_score?: number
          proposed_by?: string
          title?: string
          voters?: string[] | null
          votes?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_ideas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "youtube_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_members: {
        Row: {
          email: string | null
          id: string
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          email?: string | null
          id?: string
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          email?: string | null
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "youtube_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_scripts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          updated_at: string
          video_id: string
          word_count: number
          workspace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          video_id: string
          word_count?: number
          workspace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          video_id?: string
          word_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_scripts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_scripts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "youtube_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          video_id: string | null
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          video_id?: string | null
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          video_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_tasks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "youtube_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          priority: string
          publish_date: string | null
          status: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          priority?: string
          publish_date?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          priority?: string
          publish_date?: string | null
          status?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "youtube_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_workspaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
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
