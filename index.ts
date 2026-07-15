import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { swiperId, swipedId, direction } = await req.json();

    // Validate input
    if (!swiperId || !swipedId || !direction) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert the swipe
    const { data: swipe, error: swipeError } = await supabase
      .from("swipes")
      .insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        direction,
      })
      .select();

    if (swipeError) {
      throw swipeError;
    }

    // Check if this creates a match (only for "like" swipes)
    if (direction === "like") {
      // Check if there's a reciprocal like
      const { data: reciprocalSwipe, error: reciprocalError } = await supabase
        .from("swipes")
        .select("*")
        .eq("swiper_id", swipedId)
        .eq("swiped_id", swiperId)
        .eq("direction", "like")
        .single();

      if (!reciprocalError && reciprocalSwipe) {
        // Create a match
        const { data: match, error: matchError } = await supabase
          .from("matches")
          .insert({
            profile1_id: swiperId,
            profile2_id: swipedId,
            is_active: true,
          })
          .select();

        if (matchError) {
          throw matchError;
        }

        // Broadcast match event via Realtime
        const channel = supabase.channel(`match:${swiperId}:${swipedId}`);
        await channel.send({
          type: "broadcast",
          event: "new_match",
          payload: { match },
        });

        return new Response(
          JSON.stringify({
            success: true,
            swipe,
            match,
            isNewMatch: true,
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        swipe,
        isNewMatch: false,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
