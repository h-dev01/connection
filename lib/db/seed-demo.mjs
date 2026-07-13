/**
 * One-off demo data seed for Study Hub, Marketplace and Ad Banners.
 * Run with: tsx lib/db/seed-demo.mjs (from repo root, using the workspace's tsx binary)
 * Safe to re-run: skips insertion if the tables are already non-empty.
 */
import { db, studyMaterialsTable, listingsTable, localListingsTable, bannersTable } from "./src/index.ts";
import { sql } from "drizzle-orm";

async function countOf(table) {
  const [{ c }] = await db.select({ c: sql`count(*)` }).from(table);
  return Number(c);
}

async function seedStudyMaterials() {
  if ((await countOf(studyMaterialsTable)) > 0) { console.log("study_materials already seeded, skipping"); return; }
  const rows = [
    { title: "Data Structures — Complete Notes", subject: "Data Structures", course: "CS301", semester: "sem3", fileType: "notes", fileSizeMb: 4.2, downloads: 312, rating: 4.7, ratingCount: 58, verified: true, status: "approved", uploadedBy: "Ananya Rao" },
    { title: "Operating Systems Mid-Sem PYQs (2021-2024)", subject: "Operating Systems", course: "CS401", semester: "sem4", fileType: "pyq", fileSizeMb: 2.1, downloads: 480, rating: 4.9, ratingCount: 91, verified: true, status: "approved", uploadedBy: "Rohit Mehta" },
    { title: "DBMS Lab Manual — All Experiments", subject: "Database Management Systems", course: "CS302", semester: "sem3", fileType: "lab", fileSizeMb: 6.8, downloads: 210, rating: 4.5, ratingCount: 34, verified: true, status: "approved", uploadedBy: "Sana Iqbal" },
    { title: "Computer Networks Slides — Unit 1 to 5", subject: "Computer Networks", course: "CS405", semester: "sem4", fileType: "ppt", fileSizeMb: 12.4, downloads: 156, rating: 4.3, ratingCount: 22, verified: true, status: "approved", uploadedBy: "Karan Verma" },
    { title: "Thermodynamics — Assignment Solutions", subject: "Thermodynamics", course: "ME301", semester: "sem3", fileType: "assignment", fileSizeMb: 1.6, downloads: 98, rating: 4.1, ratingCount: 15, verified: true, status: "approved", uploadedBy: "Priya Nair" },
    { title: "Digital Electronics Syllabus & Reference Books", subject: "Digital Electronics", course: "EE401", semester: "sem4", fileType: "syllabus", fileSizeMb: 0.4, downloads: 64, rating: 4.0, ratingCount: 9, verified: true, status: "approved", uploadedBy: "Moderator Team" },
    { title: "Structural Analysis — Chapter Notes", subject: "Structural Analysis", course: "CE301", semester: "sem3", fileType: "notes", fileSizeMb: 3.3, downloads: 77, rating: 4.4, ratingCount: 12, verified: true, status: "approved", uploadedBy: "Divya Shah" },
    { title: "Genetics & Molecular Biology PDF", subject: "Genetics", course: "BT201", semester: "sem2", fileType: "pdf", fileSizeMb: 5.5, downloads: 143, rating: 4.6, ratingCount: 27, verified: true, status: "approved", uploadedBy: "Arjun Kapoor" },
    { title: "Operating Systems — Doubt Session Recording Notes", subject: "Operating Systems", course: "CS401", semester: "sem4", fileType: "notes", fileSizeMb: 1.9, downloads: 41, rating: 4.2, ratingCount: 7, verified: false, status: "pending", uploadedBy: "New Contributor" },
  ];
  await db.insert(studyMaterialsTable).values(rows);
  console.log(`Seeded ${rows.length} study_materials rows`);
}

async function seedListings() {
  if ((await countOf(listingsTable)) > 0) { console.log("listings already seeded, skipping"); return; }
  const rows = [
    // buy_sell
    { title: "TI-84 Graphing Calculator", description: "Barely used, perfect for engineering courses.", price: 1800, priceUnit: "", category: "ELECTRONICS", listingType: "buy_sell", imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&q=80", sellerName: "Ishaan Gupta", sellerRating: 4.8, sellerVerified: true, location: "Boys Hostel Block C", condition: "Good", featured: true },
    { title: "Data Structures Textbook (Cormen)", description: "3rd edition, minimal highlighting.", price: 650, priceUnit: "", category: "TEXTBOOKS", listingType: "buy_sell", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80", sellerName: "Meera Joshi", sellerRating: 4.6, sellerVerified: true, location: "Girls Hostel Block A", condition: "Like New" },
    { title: "Study Table + Chair Combo", description: "Moving out sale, pickup only.", price: 2200, priceUnit: "", category: "FURNITURE", listingType: "buy_sell", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", sellerName: "Aditya Singh", sellerRating: 4.4, sellerVerified: false, location: "Off-Campus PG", condition: "Fair" },
    { title: "Mountain Bike — 21 Speed", description: "Great condition, serviced last month.", price: 4500, priceUnit: "", category: "CYCLES", listingType: "buy_sell", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", sellerName: "Neha Kulkarni", sellerRating: 4.9, sellerVerified: true, location: "Main Gate Parking", condition: "Good", featured: true },
    // housing
    { title: "Sunrise PG — Single Room Near Campus", description: "AC room, WiFi, food included. 5 min walk to college.", price: 8500, priceUnit: "/mo", category: "PG", listingType: "housing", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", sellerName: "Sunrise PG Owner", sellerRating: 4.5, sellerVerified: true, location: "College Road", condition: null },
    { title: "Shared 2BHK Flat — Furnished", description: "Looking for one more flatmate, all amenities included.", price: 6000, priceUnit: "/mo", category: "Flat", listingType: "housing", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80", sellerName: "Rahul Verma", sellerRating: 4.3, sellerVerified: false, location: "Green Park Colony", condition: null },
    // roommate
    { title: "Looking for a Roommate — Non-Smoker Preferred", description: "2BHK near campus, splitting rent + utilities.", price: 5000, priceUnit: "/mo", category: "Roommate", listingType: "roommate", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", sellerName: "Yash Kumar", sellerRating: 4.7, sellerVerified: true, location: "Lake View Apartments", condition: null },
  ];
  await db.insert(listingsTable).values(rows);
  console.log(`Seeded ${rows.length} listings rows`);
}

async function seedLocalListings() {
  if ((await countOf(localListingsTable)) > 0) { console.log("local_listings already seeded, skipping"); return; }
  const rows = [
    // restaurants
    { category: "restaurant", name: "Spice Garden", photos: JSON.stringify(["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"]), description: "North Indian & Chinese, student discounts on weekdays.", address: "College Road, Opp. Gate 2", contactNumber: "+91 98765 43210", metadata: JSON.stringify({ cuisineTypes: ["Indian", "Chinese"], deliveryAvailable: true }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 10 },
    { category: "restaurant", name: "Campus Cafe", photos: JSON.stringify(["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"]), description: "Coffee, sandwiches, and late-night snacks.", address: "Student Center", contactNumber: "+91 98765 11223", metadata: JSON.stringify({ cuisineTypes: ["Cafe", "Fast Food"], deliveryAvailable: false }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 5 },
    { category: "restaurant", name: "Punjabi Rasoi", photos: JSON.stringify(["https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80"]), description: "Home-style thalis, quick delivery to hostels.", address: "Market Street", contactNumber: "+91 98765 99887", metadata: JSON.stringify({ cuisineTypes: ["Indian"], deliveryAvailable: true }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 8 },
    // housing
    { category: "housing", name: "Sunrise PG", photos: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"]), description: "AC rooms, WiFi, home food. Boys & girls wings available.", address: "College Road", contactNumber: "+91 98765 22334", metadata: JSON.stringify({ roomType: "Single", gender: "Unisex", rentMin: 7500, rentMax: 9500 }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 9 },
    { category: "housing", name: "Green Valley Hostel", photos: JSON.stringify(["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80"]), description: "Budget-friendly hostel with mess facility.", address: "Behind Gate 3", contactNumber: "+91 98765 55667", metadata: JSON.stringify({ roomType: "Double", gender: "Boys", rentMin: 5000, rentMax: 6500 }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 6 },
    // local services
    { category: "local_service", name: "QuickPrint Xerox & Stationery", photos: JSON.stringify(["https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80"]), description: "Printing, binding, and all stationery needs.", address: "Near Main Gate", contactNumber: "+91 98765 33445", metadata: JSON.stringify({ serviceType: "Printing Shop" }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 7 },
    { category: "local_service", name: "CleanCare Laundry", photos: JSON.stringify(["https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80"]), description: "Same-day laundry & dry cleaning, hostel pickup available.", address: "Market Street", contactNumber: "+91 98765 66778", metadata: JSON.stringify({ serviceType: "Laundry" }), status: "approved", addedByModerator: "Moderator Team", priorityScore: 4 },
  ];
  await db.insert(localListingsTable).values(rows);
  console.log(`Seeded ${rows.length} local_listings rows`);
}

async function seedBanners() {
  if ((await countOf(bannersTable)) > 0) { console.log("banners already seeded, skipping"); return; }
  const rows = [
    { title: "Spice Garden — 20% Off This Week", subtitle: "Show your student ID for a discount on all North Indian & Chinese orders.", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80", placement: "both", linkType: "restaurant", durationMs: 5000, status: "active", addedByModerator: "Moderator Team" },
    { title: "Sunrise PG — Rooms Filling Fast", subtitle: "AC single rooms with WiFi & food, 5 minutes from campus.", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80", placement: "both", linkType: "pg", durationMs: 6000, status: "active", addedByModerator: "Moderator Team" },
    { title: "QuickPrint — Free Binding on Orders Above ₹100", subtitle: "Your one-stop shop for printing, binding and stationery.", imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&q=80", placement: "both", linkType: "local_service", durationMs: 5000, status: "active", addedByModerator: "Moderator Team" },
  ];
  await db.insert(bannersTable).values(rows);
  console.log(`Seeded ${rows.length} banners rows`);
}

await seedStudyMaterials();
await seedListings();
await seedLocalListings();
await seedBanners();
console.log("Done.");
process.exit(0);
