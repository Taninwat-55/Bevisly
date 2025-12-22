/*
  🚀 BEVISLY AGGREGATOR SCRIPT (FINAL FIX)
  Sources: JSearch, Internships API, YC Jobs
  Run: node backfill.js
*/

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// 1. SETUP
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Helper to pick the first valid value from a list of keys
const getField = (item, ...keys) => {
    for (const key of keys) {
        if (item[key]) return item[key];
    }
    return null;
};

// 2. DEFINE SOURCES
const SOURCES = [
    {
        name: "JSearch",
        host: process.env.HOST_JSEARCH,
        // ✅ CORRECT: Uses /search endpoint
        url: (host) => `https://${host}/search?query=Junior%20Frontend%20Developer%20in%20Europe&page=1&num_pages=1`,
        // JSearch returns { data: [...] }
        getData: (json) => json.data,
    },
    {
        name: "Internships API",
        host: process.env.HOST_INTERNSHIPS,
        // ✅ CORRECT: Uses the endpoint you found
        url: (host) => `https://${host}/active-jb-7d`,
        // These APIs usually return the array directly or inside 'jobs'
        getData: (json) => Array.isArray(json) ? json : (json.jobs || json.data),
    },
    {
        name: "YC Startup Jobs",
        host: process.env.HOST_YC,
        // ✅ CORRECT: Uses the endpoint you found
        url: (host) => `https://${host}/active-jb-7d`,
        getData: (json) => Array.isArray(json) ? json : (json.jobs || json.data),
    }
];

async function runAggregator() {
    console.log("⚡ Starting Job Aggregation...");

    for (const source of SOURCES) {
        if (!source.host) {
            console.log(`⚠️ Skipping ${source.name}: No Host defined in .env`);
            continue;
        }

        console.log(`\n📡 Fetching from: ${source.name}...`);

        try {
            const endpoint = source.url(source.host);
            const res = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                    'X-RapidAPI-Host': source.host
                }
            });

            if (!res.ok) {
                console.error(`❌ API Error (${source.name}): ${res.status}`);
                continue;
            }

            const responseBody = await res.json();
            const rawJobs = source.getData(responseBody) || [];

            if (rawJobs.length === 0) {
                console.log(`⚠️ No jobs found for ${source.name}`);
                continue;
            }

            // 🔍 DEBUG: Log the first item to see the real structure
            console.log(`🔍 DEBUG (${source.name}) First Item Keys:`, Object.keys(rawJobs[0]));

            const normalizedJobs = [];
            for (const raw of rawJobs) {
                // SMART MAPPING: Tries multiple variations of field names
                const title = getField(raw, 'job_title', 'title', 'role', 'position');
                const company = getField(raw, 'employer_name', 'company_name', 'company', 'organization');
                const location = getField(raw, 'job_city', 'location', 'city') || "Remote";
                const url = getField(raw, 'job_apply_link', 'url', 'link', 'apply_url', 'application_url');
                const desc = getField(raw, 'job_description', 'description', 'body') || "Check link for details.";

                // JSearch specific location fix
                const finalLoc = raw.job_country ? `${location}, ${raw.job_country}` : location;

                if (title && url) {
                    normalizedJobs.push({
                        title: title,
                        company: company || "Unknown Company", // Still unknown? Check the DEBUG log above!
                        location: finalLoc,
                        description: desc.slice(0, 5000),
                        apply_url: url,
                        job_type: "Full-time", // Default
                        is_public: true
                    });
                }
            }

            console.log(`✅ Found ${normalizedJobs.length} valid jobs. Inserting...`);

            if (normalizedJobs.length > 0) {
                const { error } = await supabase.from("jobs").insert(normalizedJobs);
                if (error) console.error("❌ DB Insert Error:", error.message);
                else console.log(`🎉 Success! Added ${normalizedJobs.length} jobs.`);
            }

        } catch (err) {
            console.error(`❌ Critical Error in ${source.name}:`, err.message);
        }
    }

    console.log("\n🏁 Aggregation Complete.");
}

runAggregator();