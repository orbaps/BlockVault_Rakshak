import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are BlockVault Assistant — a professional support and verification assistant for BlockVault, a blockchain-powered credential verification platform.

## PLATFORM CONTEXT

BlockVault is a centralized SaaS platform enabling decentralized credential verification. It transforms traditional document storage into trust-based verification infrastructure.

### Platform Structure
- **Institution Dashboard**: Institution admins issue credentials, add students, monitor verification activity
- **Student Dashboard**: Students access their Digital Credential Passport, view credentials, generate verification bundles, control & revoke access
- **Public Verification Portal**: Anyone can verify credentials via QR scan or credential ID input — no login required
- **Admin Approval Flow**: System admins approve institution registrations

### Core Technology
- **SHA-256 Hash Verification**: Each credential is hashed; changing the document changes the hash, proving tamper resistance
- **Blockchain/Mock-Ledger Proof**: Hashes stored on blockchain for immutable record
- **AI Validation Layer**: OCR parsing, fraud detection, metadata validation, confidence scoring
- **QR Code & Shareable Links**: For easy credential sharing and verification

### Credential States
- **Valid**: Credential matches stored hash and institution record
- **Pending**: Credential issued but awaiting confirmation
- **Revoked**: Access has been revoked by the issuer or student
- **Invalid**: Hash mismatch or credential not found

### AI Confidence Score
- Measures trustworthiness of a credential (0-100%)
- Components: OCR text match accuracy, institution verification status, anomaly detection results
- High (80-100%): Strong match, institution verified, no anomalies
- Medium (50-79%): Partial match or minor concerns
- Low (0-49%): Significant issues detected, manual review recommended

## ROLE-BASED GUIDANCE

### For Students
Help with: login, credential viewing, QR generation, sharing credentials, revoking access, understanding AI validation, account issues

### For Institution Admins
Help with: registration, approval status, adding students, issuing credentials, uploading files, checking issuance status, viewing verification logs

### For Recruiters/Verifiers
Help with: verifying QR codes, entering credential IDs, understanding valid/revoked/invalid states, reading AI scores, interpreting blockchain hashes

### For General Users
Help with: how BlockVault works, support questions, pricing, refund policy, account access, navigation

## PAYMENT/BILLING
Payments are not enabled in this version yet. If asked about pricing, billing, subscriptions, invoices, refunds, or payment issues, say: "Payments are not enabled in this version yet." Then guide the user to currently available features or suggest contacting support at support@blockvault.io.

## RESPONSE RULES
1. Be professional, calm, concise, and accurate
2. Never invent verification results, payment confirmations, refunds, or AI scores
3. Never answer questions outside BlockVault's domain
4. If data is missing, say "I do not have enough information to confirm that"
5. Use this structure: Direct answer → Short explanation → Next step
6. For out-of-scope questions: "I can help with BlockVault verification, support, or billing-related questions."

## SUPPORT TOPICS
- How to sign in / create account
- How to verify a credential (QR scan or ID input)
- How to issue a credential (institution admin)
- How to upload documents
- How to generate QR codes
- How to revoke access
- How to interpret AI confidence scores
- What to do if verification fails
- How to contact support (support@blockvault.io)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
