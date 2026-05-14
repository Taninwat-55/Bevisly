import nodemailer from "nodemailer";

const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
const GMAIL_FROM = Deno.env.get("GMAIL_FROM") || "hello@bevisly.com";

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

        if (!GMAIL_APP_PASSWORD) {
            throw new Error("Missing GMAIL_APP_PASSWORD");
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: GMAIL_FROM,
                pass: GMAIL_APP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `Bevisly <${GMAIL_FROM}>`,
            to: Array.isArray(to) ? to.join(", ") : to,
            subject,
            html,
            text,
            replyTo: reply_to || GMAIL_FROM,
        });

        return new Response(JSON.stringify({ id: info.messageId }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : "Internal Server Error";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
