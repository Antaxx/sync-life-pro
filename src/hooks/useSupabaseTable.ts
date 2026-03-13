import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];
type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

interface UseSupabaseTableOptions {
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  realtime?: boolean;
}

export function useSupabaseTable<T extends TableName>(
  table: T,
  options: UseSupabaseTableOptions = {}
) {
  const [data, setData] = useState<Row<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      let query = supabase.from(table).select("*") as any;

      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (error: any) {
      console.error(`Error fetching ${table}:`, error);
      toast({ title: "❌ Erreur", description: `Erreur lors du chargement: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, table, JSON.stringify(options.filter), options.orderBy?.column, options.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime
  useEffect(() => {
    if (!options.realtime || !user) return;

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: table as string, filter: `user_id=eq.${user.id}` },
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [options.realtime, user, table, fetchData]);

  const insert = useCallback(async (item: Omit<Insert<T>, "user_id">) => {
    if (!user) return null;
    try {
      const { data: result, error } = await (supabase.from(table) as any)
        .insert({ ...item, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "✓ Sauvegardé" });
      if (!options.realtime) fetchData();
      return result as Row<T>;
    } catch (error: any) {
      toast({ title: "❌ Erreur", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, table, fetchData, options.realtime]);

  const update = useCallback(async (id: string, updates: Partial<Update<T>>) => {
    try {
      const { error } = await (supabase.from(table) as any)
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      toast({ title: "✓ Sauvegardé" });
      if (!options.realtime) fetchData();
    } catch (error: any) {
      toast({ title: "❌ Erreur", description: error.message, variant: "destructive" });
    }
  }, [table, fetchData, options.realtime]);

  const remove = useCallback(async (id: string) => {
    try {
      const { error } = await (supabase.from(table) as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "✓ Supprimé" });
      if (!options.realtime) fetchData();
    } catch (error: any) {
      toast({ title: "❌ Erreur", description: error.message, variant: "destructive" });
    }
  }, [table, fetchData, options.realtime]);

  return { data, loading, refetch: fetchData, insert, update, remove };
}
