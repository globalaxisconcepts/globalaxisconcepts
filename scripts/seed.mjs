// One-time seed of sample companies into Firestore via the client SDK.
// Respects security rules: signs in as a seed user, writes companies it "owns".
// Run with:  node scripts/seed.mjs
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgpEJjfDlkAqo304_smp6snqeWZ-oiC8o",
  authDomain: "global-axis-concepts.firebaseapp.com",
  projectId: "global-axis-concepts",
  storageBucket: "global-axis-concepts.firebasestorage.app",
  messagingSenderId: "741437097339",
  appId: "1:741437097339:web:510a15c1e4bf7657b9e9de",
};

const SEED_EMAIL = "seed-bot@globalaxisconcepts.dev";
const SEED_PASSWORD = "Seed!Bot-2026-gac";

const COMPANIES = [
  { slug: "glow-studio", name: "Glow Studio", category: "beauty-and-wellness", country: "United Kingdom", details: "Skincare, facials & lash treatments in central London." },
  { slug: "bright-minds-academy", name: "Bright Minds Academy", category: "educations", country: "United States", details: "1-on-1 tutoring and group classes for every level." },
  { slug: "northside-dental", name: "Northside Dental Care", category: "medical", country: "Canada", details: "Friendly family dentistry and routine check-ups." },
  { slug: "peak-fitness", name: "Peak Fitness Co.", category: "sport-and-gym", country: "Australia", details: "Personal training, classes and recovery sessions." },
  { slug: "lawbridge-partners", name: "Lawbridge Partners", category: "law-and-consultancy", country: "Singapore", details: "Corporate, immigration & contract law consultations." },
  { slug: "eventcraft", name: "EventCraft", category: "events-and-entertainment", country: "Spain", details: "Book DJs, photographers and event planners." },
  { slug: "serenity-spa", name: "Serenity Spa & Massage", category: "beauty-and-wellness", country: "United Arab Emirates", details: "Deep tissue, hot stone and aromatherapy massage." },
  { slug: "mindspace-therapy", name: "MindSpace Therapy", category: "personal-meetings", country: "Germany", details: "Confidential 1-on-1 counselling, online or in person." },
  { slug: "codeforge-mentors", name: "CodeForge Mentors", category: "educations", country: "India", details: "Software mentorship and mock-interview sessions." },
  { slug: "vital-physio", name: "Vital Physiotherapy", category: "medical", country: "Ireland", details: "Sports injury rehab and movement assessments." },
  { slug: "summit-consulting", name: "Summit Business Consulting", category: "law-and-consultancy", country: "United States", details: "Strategy, finance and growth advisory calls." },
  { slug: "halo-hair-co", name: "Halo Hair Co.", category: "beauty-and-wellness", country: "France", details: "Cuts, colour and styling by award-winning stylists." },
];

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Signed in as existing seed user.");
  } catch {
    cred = await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASSWORD);
    console.log("Created seed user.");
  }
  const uid = cred.user.uid;

  let created = 0;
  let skipped = 0;
  for (const c of COMPANIES) {
    const exists = (await getDoc(doc(db, "slugs", c.slug))).exists();
    if (exists) {
      skipped++;
      console.log(`• skip ${c.slug} (already exists)`);
      continue;
    }
    const batch = writeBatch(db);
    batch.set(doc(db, "companies", c.slug), {
      slug: c.slug,
      name: c.name,
      category: c.category,
      country: c.country,
      details: c.details,
      plan: "free",
      ownerUid: uid,
      seeded: true,
    });
    batch.set(doc(db, "slugs", c.slug), { companyId: c.slug });
    await batch.commit();
    created++;
    console.log(`✓ created ${c.slug}`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e?.code || e?.message || e);
  process.exit(1);
});
