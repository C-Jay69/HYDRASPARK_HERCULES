import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseSupabaseQueryOptions {
  realtime?: boolean;
  realtimeEvent?: "INSERT" | "UPDATE" | "DELETE" | "*";
}

export function useSupabaseQuery<T>(
  table: string,
  query: (q: any) => any,
  options: UseSupabaseQueryOptions = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await query(supabase.from(table));

        if (result.error) {
          throw result.error;
        }

        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup real-time subscription if enabled
    if (options.realtime) {
      const realtimeChannel = supabase
        .channel(`${table}:*`)
        .on(
          "postgres_changes",
          {
            event: options.realtimeEvent || "*",
            schema: "public",
            table: table,
          },
          (payload) => {
            // Re-fetch data on changes
            fetchData();
          }
        )
        .subscribe();

      setChannel(realtimeChannel);

      return () => {
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
        }
      };
    }
  }, [table, options.realtime, options.realtimeEvent]);

  return { data, loading, error };
}

export function useSupabaseSingleQuery<T>(
  table: string,
  id: string,
  options: UseSupabaseQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .single();

        if (err) {
          throw err;
        }

        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();

      // Setup real-time subscription if enabled
      if (options.realtime) {
        const realtimeChannel = supabase
          .channel(`${table}:id=eq.${id}`)
          .on(
            "postgres_changes",
            {
              event: options.realtimeEvent || "*",
              schema: "public",
              table: table,
              filter: `id=eq.${id}`,
            },
            (payload) => {
              // Update data on changes
              if (payload.new) {
                setData(payload.new as T);
              }
            }
          )
          .subscribe();

        setChannel(realtimeChannel);

        return () => {
          if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
          }
        };
      }
    }
  }, [table, id, options.realtime, options.realtimeEvent]);

  return { data, loading, error };
}
