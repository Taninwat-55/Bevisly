const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Bevisly <hello@bevisly.com>";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { to, subject, html, text, reply_to } = await req.json();

        if (!RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY");
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text,
                reply_to: reply_to || "hello@bevisly.com",
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            const detail = data?.message ?? data?.name ?? JSON.stringify(data);
            throw new Error(`Resend ${res.status}: ${detail}`);
        }

        return new Response(JSON.stringify({ id: data.id }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : "Internal Server Error";
        // Always return 200 so the client can read the error body
        return new Response(JSON.stringify({ error: message }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
