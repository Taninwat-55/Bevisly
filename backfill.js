/*
  🚀 BEVISLY AGGREGATOR (Diverse Roles + Limit 5)
  Run: node backfill.js
*/

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🌍 CONFIG: Diverse Roles & Industries
const JSEARCH_QUERIES = [
    // 🎨 Design & Product
    "UX UI Designer in Copenhagen",
    "Product Manager in Denmark",

    // 💼 Business & Sales
    "Business Development Manager Denmark",
    "Sales Representative in Copenhagen",
    "Account Manager in Sweden",

    // 📣 Marketing & HR
    "Digital Marketing Specialist Remote",
    "Social Media Manager in Denmark",
    "HR Specialist in Copenhagen",

    // 💻 Tech (Keep some tech)
    "Frontend Developer in Denmark",
    "Software Engineer Remote",

    // Global Fallback
    "Frontend Developer",
    "Software Engineer",
    "Product Manager",
    "Product Designer",
    "UX UI Designer",
    "Business Development Manager",
    "Sales Representative",
    "Account Manager",
    "Digital Marketing Specialist",
    "Social Media Manager",
    "HR Specialist",
    "Frontend Developer",
    "Software Engineer",
    "Product Manager",
    "Product Designer",
    "UX UI Designer",
    "Business Development Manager",
    "Sales Representative",
    "Account Manager",
    "Digital Marketing Specialist",
    "Social Media Manager",
    "HR Specialist"
];

const getField = (item, ...keys) => {
    for (const key of keys) {
        if (item[key]) return item[key];
    }
    return null;
};

const cleanLocation = (locData) => {
    if (!locData) return "Remote";
    if (Array.isArray(locData) && locData[0]?.["@type"] === "Place") {
        const addr = locData[0].address;
        if (addr) {
            return [addr.addressLocality, addr.addressRegion, addr.addressCountry]
                .filter(Boolean)
                .join(", ");
        }
    }
    if (typeof locData === 'string') return locData;
    return "Remote";
};

async function runAggregator() {
    console.log("⚡ Starting Diverse Job Aggregation (Limit: 5 per category)...");

    for (const query of JSEARCH_QUERIES) {
        console.log(`\n📡 Searching: "${query}"...`);

        try {
            // date_posted=month ensures we get results even if volume is low
            const url = `https://${process.env.HOST_JSEARCH}/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&date_posted=month`;

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                    'X-RapidAPI-Host': process.env.HOST_JSEARCH
                }
            });

            if (!res.ok) {
                console.error(`   ❌ API Error: ${res.status}`);
                continue;
            }

            const json = await res.json();
            // ✂️ LIMIT TO 5 RESULTS HERE
            const rawJobs = (json.data || []).slice(0, 5);

            if (rawJobs.length === 0) {
                console.log(`   ⚠️ No results found.`);
                continue;
            }

            const jobsToInsert = [];
            for (const raw of rawJobs) {
                const title = getField(raw, 'job_title', 'title');
                const company = getField(raw, 'employer_name', 'company');
                const rawLoc = getField(raw, 'job_city', 'location', 'locations_raw');
                const location = cleanLocation(rawLoc);
                const url = getField(raw, 'job_apply_link', 'url', 'apply_url');
                const desc = getField(raw, 'job_description', 'description') || "Check link for details.";

                if (!company || company === "Unknown Company") continue;

                if (title && url) {
                    jobsToInsert.push({
                        title: title,
                        company: company,
                        location: location,
                        description: desc.slice(0, 5000),
                        apply_url: url,
                        job_type: "Full-time",
                        is_public: true,
                        // Add a tag so we know it's a backfilled job
                        department: query.split(" ")[0] // simple category guess
                    });
                }
            }

            if (jobsToInsert.length > 0) {
                const { error } = await supabase.from("jobs").insert(jobsToInsert);
                if (error) console.error("   ❌ DB Insert Error:", error.message);
                else console.log(`   🎉 Added ${jobsToInsert.length} jobs.`);
            }

        } catch (err) {
            console.error(`   ❌ Critical Error:`, err.message);
        }
    }

    console.log("\n🏁 Aggregation Complete.");
}

runAggregator();