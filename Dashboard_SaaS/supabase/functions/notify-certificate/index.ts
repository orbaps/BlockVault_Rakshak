import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader || "" } } }
    );

    const { type, certificate_id } = await req.json();

    // Fetch certificate with student info
    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("*, students(full_name, email, student_id)")
      .eq("id", certificate_id)
      .single();

    if (certErr || !cert) {
      return new Response(
        JSON.stringify({ error: "Certificate not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch workspace info
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", cert.workspace_id)
      .single();

    let notification;

    if (type === "issued") {
      notification = {
        event: "certificate_issued",
        recipient: cert.students?.email || null,
        student_name: cert.students?.full_name,
        certificate_title: cert.title,
        cert_id: cert.cert_id,
        issuer: workspace?.name || "Unknown Institution",
        tx_hash: cert.tx_hash,
        issued_at: cert.issued_at,
        message: `Certificate "${cert.title}" has been issued to ${cert.students?.full_name} by ${workspace?.name || "your institution"}.`,
      };
    } else if (type === "verified") {
      notification = {
        event: "certificate_verified",
        certificate_title: cert.title,
        cert_id: cert.cert_id,
        student_name: cert.students?.full_name,
        verified_at: new Date().toISOString(),
        message: `Certificate "${cert.title}" for ${cert.students?.full_name} was verified successfully.`,
      };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid notification type. Use 'issued' or 'verified'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the notification (in production, integrate with email service like Resend)
    console.log(`[NOTIFICATION] ${type}:`, JSON.stringify(notification));

    return new Response(
      JSON.stringify({ success: true, notification }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
