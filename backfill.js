/*
  🚀 BEVISLY AGGREGATOR SCRIPT (FIXED DESCRIPTIONS)
  Sources: JSearch, Internships API, YC Jobs
  Run: node backfill.js
*/

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const getField = (item, ...keys) => {
    for (const key of keys) {
        if (item[key]) return item[key];
    }
    return null;
};

// Helper to clean up messy location data
const cleanLocation = (locData) => {
    if (!locData) return "Remote";

    // 1. If it's that specific JSON array you found
    if (Array.isArray(locData) && locData[0]?.["@type"] === "Place") {
        const addr = locData[0].address;
        if (addr) {
            // Join parts like: "El Segundo, California, US"
            return [addr.addressLocality, addr.addressRegion, addr.addressCountry]
                .filter(Boolean) // Remove empty parts
                .join(", ");
        }
    }

    // 2. If it's already a string, just return it
    if (typeof locData === 'string') {
        return locData;
    }

    // 3. Fallback for other weird object formats
    return "Remote";
};

const SOURCES = [
    {
        name: "JSearch",
        host: process.env.HOST_JSEARCH,
        // 🔧 FIX 1: Broader query to ensure we get results (JSearch has real descriptions!)
        url: (host) => `https://${host}/search?query=Frontend%20Developer&page=1&num_pages=1`,
        getData: (json) => json.data,
    },
    {
        name: "Internships API",
        host: process.env.HOST_INTERNSHIPS,
        url: (host) => `https://${host}/active-jb-7d`,
        getData: (json) => Array.isArray(json) ? json : (json.jobs || json.data),
    },
    {
        name: "YC Startup Jobs",
        host: process.env.HOST_YC,
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

            const normalizedJobs = [];
            for (const raw of rawJobs) {
                // 1. Basic Fields
                const title = getField(raw, 'job_title', 'title', 'role', 'position');
                const company = getField(raw, 'employer_name', 'organization', 'company_name', 'company');
                // Get raw data first
                const rawLocation = getField(raw, 'job_city', 'location', 'locations_raw');
                // Then clean it
                const location = cleanLocation(rawLocation);
                const url = getField(raw, 'job_apply_link', 'url', 'link', 'apply_url');

                // 🛡️ QUALITY FILTER 1: Must have a real Company Name
                if (!company || company === "Unknown Company" || company === "null") {
                    console.log(`   Start skipping: ${title} (Missing Company)`);
                    continue;
                }

                // 2. Description Logic
                let desc = getField(raw, 'job_description', 'description', 'body');

                if (!desc) {
                    const companyInfo = raw.linkedin_org_description
                        ? `\n\n**About ${company}:**\n${raw.linkedin_org_description}`
                        : "";

                    // 🛡️ QUALITY FILTER 2: If we have NO description AND NO company info, skip it?
                    // Uncomment the next 3 lines if you want to be super strict:
                    // if (!companyInfo) {
                    //    console.log(`   Skipping: ${title} (No Content)`);
                    //    continue;
                    // }

                    desc = `**${title}** at **${company}**\n\nThis is a verified listing. Click the "Apply" button to view the full job requirements, salary, and details on their official career page.${companyInfo}`;
                }

                // 3. Clean up JSearch locations
                const finalLoc = raw.job_country ? `${location}, ${raw.job_country}` : location;

                if (title && url) {
                    normalizedJobs.push({
                        title: title,
                        company: company,
                        location: finalLoc,
                        description: desc.slice(0, 5000),
                        apply_url: url,
                        job_type: "Full-time",
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