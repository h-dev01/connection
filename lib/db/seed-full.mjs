/**
 * Full demo-data seed for CollegeConnect.
 * Covers: colleges, courses, semesters, users, posts, clubs, communities,
 *         events, internships, Q&A, and links existing marketplace/study rows
 *         to the seeded college.
 *
 * Password for ALL demo accounts: Demo@123
 * Run: npx tsx lib/db/seed-full.mjs
 * Safe to re-run: each section skips if data already exists.
 */
import {
  db,
  collegesTable, coursesTable, courseSemestersTable, subjectsTable,
  usersTable,
  postsTable, qaTable,
  clubsTable, communitiesTable, eventsTable, internshipsTable,
  listingsTable, localListingsTable, studyMaterialsTable, bannersTable,
} from "./src/index.ts";
import { sql, eq, isNull } from "drizzle-orm";
/* ─── helpers ────────────────────────────────────────────────── */
async function countOf(table) {
  const [{ c }] = await db.select({ c: sql`count(*)` }).from(table);
  return Number(c);
}

// Pre-computed bcrypt hash for "Demo@123" (rounds=10)
const PW_HASH = "$2b$10$B8zVgTNtNmG2kDo2oEUIBu.9URN8C9gPzpIoiL954FI9M/uvtt/0W";

/* ─── 1. College ─────────────────────────────────────────────── */
let collegeId;
{
  const existing = await db.select({ id: collegesTable.id }).from(collegesTable).limit(1);
  if (existing.length > 0) {
    collegeId = existing[0].id;
    console.log(`colleges already seeded (id=${collegeId}), skipping`);
  } else {
    const [row] = await db.insert(collegesTable).values({
      name: "Demo Engineering College",
      code: "DEC01",
      slug: "demo-engineering-college",
      emailDomain: "dec.edu",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      logoUrl: "https://ui-avatars.com/api/?name=DEC&background=6366f1&color=fff&size=128&bold=true",
      status: "active",
    }).returning({ id: collegesTable.id });
    collegeId = row.id;
    console.log(`Seeded college id=${collegeId}`);
  }
}

/* ─── 2. Courses ─────────────────────────────────────────────── */
let cseId, ecId, mbaId;
{
  const existing = await db.select().from(coursesTable).where(eq(coursesTable.collegeId, collegeId));
  if (existing.length > 0) {
    const byCode = Object.fromEntries(existing.map(c => [c.code, c.id]));
    cseId = byCode["CSE"]; ecId = byCode["ECE"]; mbaId = byCode["MBA"];
    console.log(`courses already seeded, skipping`);
  } else {
    const rows = await db.insert(coursesTable).values([
      { collegeId, name: "B.Tech Computer Science & Engineering", code: "CSE", durationSemesters: 8 },
      { collegeId, name: "B.Tech Electronics & Communication", code: "ECE", durationSemesters: 8 },
      { collegeId, name: "Master of Business Administration", code: "MBA", durationSemesters: 4 },
    ]).returning({ id: coursesTable.id, code: coursesTable.code });
    const byCode = Object.fromEntries(rows.map(r => [r.code, r.id]));
    cseId = byCode["CSE"]; ecId = byCode["ECE"]; mbaId = byCode["MBA"];
    console.log(`Seeded 3 courses`);
  }
}

/* ─── 3. Course semesters ────────────────────────────────────── */
// Build a map: courseId → array of 8 (or 4) semester IDs
const semesterMap = {}; // { cseId: [sem1Id, sem2Id, ...], ... }
{
  const existing = await db.select().from(courseSemestersTable);
  if (existing.length > 0) {
    for (const row of existing) {
      if (!semesterMap[row.courseId]) semesterMap[row.courseId] = [];
      semesterMap[row.courseId][row.number - 1] = row.id;
    }
    console.log(`course_semesters already seeded, skipping`);
  } else {
    for (const [courseId, numSem] of [[cseId, 8], [ecId, 8], [mbaId, 4]]) {
      const rows = await db.insert(courseSemestersTable).values(
        Array.from({ length: numSem }, (_, i) => ({
          courseId,
          number: i + 1,
          name: `Semester ${i + 1}`,
          status: i < 4 ? "active" : "upcoming",
        }))
      ).returning({ id: courseSemestersTable.id, number: courseSemestersTable.number });
      semesterMap[courseId] = [];
      for (const r of rows) semesterMap[courseId][r.number - 1] = r.id;
    }
    console.log(`Seeded course semesters for 3 courses`);
  }
}

// Convenient shorthands: CSE sem 3 = semesterMap[cseId][2]
const cseSem = (n) => semesterMap[cseId]?.[n - 1];
const eceSem = (n) => semesterMap[ecId]?.[n - 1];
const mbaSem = (n) => semesterMap[mbaId]?.[n - 1];

/* ─── 4. Subjects ────────────────────────────────────────────── */
{
  const existing = await db.select({ id: subjectsTable.id }).from(subjectsTable).limit(1);
  if (existing.length > 0) {
    console.log(`subjects already seeded, skipping`);
  } else {
    await db.insert(subjectsTable).values([
      // CSE Sem 1
      { semesterId: cseSem(1), name: "Engineering Mathematics I", code: "MA101", credits: 4 },
      { semesterId: cseSem(1), name: "Programming in C", code: "CS101", credits: 4 },
      { semesterId: cseSem(1), name: "Digital Logic Design", code: "CS102", credits: 3 },
      // CSE Sem 2
      { semesterId: cseSem(2), name: "Data Structures", code: "CS201", credits: 4 },
      { semesterId: cseSem(2), name: "Discrete Mathematics", code: "MA201", credits: 3 },
      // CSE Sem 3
      { semesterId: cseSem(3), name: "Design & Analysis of Algorithms", code: "CS301", credits: 4 },
      { semesterId: cseSem(3), name: "Database Management Systems", code: "CS302", credits: 4 },
      { semesterId: cseSem(3), name: "Object Oriented Programming", code: "CS303", credits: 3 },
      // CSE Sem 4
      { semesterId: cseSem(4), name: "Operating Systems", code: "CS401", credits: 4 },
      { semesterId: cseSem(4), name: "Computer Networks", code: "CS402", credits: 4 },
      { semesterId: cseSem(4), name: "Software Engineering", code: "CS403", credits: 3 },
      // CSE Sem 5
      { semesterId: cseSem(5), name: "Web Technologies", code: "CS501", credits: 4 },
      { semesterId: cseSem(5), name: "Machine Learning", code: "CS502", credits: 4 },
      { semesterId: cseSem(5), name: "Compiler Design", code: "CS503", credits: 3 },
      // ECE Sem 3
      { semesterId: eceSem(3), name: "Digital Electronics", code: "EC301", credits: 4 },
      { semesterId: eceSem(3), name: "Signals & Systems", code: "EC302", credits: 4 },
      // MBA Sem 1
      { semesterId: mbaSem(1), name: "Financial Management", code: "MB101", credits: 4 },
      { semesterId: mbaSem(1), name: "Marketing Management", code: "MB102", credits: 4 },
    ]);
    console.log(`Seeded subjects`);
  }
}

/* ─── 5. Users ───────────────────────────────────────────────── */
let userIdMap = {}; // name → id
{
  const existing = await db.select().from(usersTable).where(eq(usersTable.collegeId, collegeId));
  if (existing.length > 0) {
    for (const u of existing) userIdMap[u.name] = u.id;
    console.log(`users already seeded (${existing.length}), skipping`);
  } else {
    const userData = [
      // ── Admin ──
      {
        name: "Admin User", email: "admin@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Administration",
        collegeId, courseId: cseId, semesterId: cseSem(1),
        year: 1, role: "admin", reputationScore: 500, reputationLevel: "platinum",
        verified: true, bio: "Platform administrator.",
        avatarUrl: "https://ui-avatars.com/api/?name=Admin+User&background=ef4444&color=fff&bold=true",
      },
      // ── Moderators ──
      {
        name: "Moderator Priya", email: "priya.mod@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Computer Science",
        collegeId, courseId: cseId, semesterId: cseSem(5),
        year: 3, role: "moderator", reputationScore: 320, reputationLevel: "gold",
        verified: true, bio: "CSE moderator. I manage study materials & events.",
        avatarUrl: "https://ui-avatars.com/api/?name=Priya+Mod&background=8b5cf6&color=fff&bold=true",
      },
      // ── Students ──
      {
        name: "Arjun Verma", email: "arjun.verma@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Computer Science",
        collegeId, courseId: cseId, semesterId: cseSem(5),
        year: 3, role: "student", reputationScore: 240, reputationLevel: "silver",
        verified: true, cgpa: 8.7, attendance: 85,
        bio: "CSE 3rd year. Coding, open source & hackathons. Currently looking for internships.",
        avatarUrl: "https://ui-avatars.com/api/?name=Arjun+Verma&background=6366f1&color=fff&bold=true",
      },
      {
        name: "Neha Kulkarni", email: "neha.kulkarni@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Computer Science",
        collegeId, courseId: cseId, semesterId: cseSem(3),
        year: 2, role: "student", reputationScore: 180, reputationLevel: "silver",
        verified: true, cgpa: 9.1, attendance: 91,
        bio: "2nd year CSE. Love DSA, competitive programming and painting.",
        avatarUrl: "https://ui-avatars.com/api/?name=Neha+Kulkarni&background=ec4899&color=fff&bold=true",
      },
      {
        name: "Rohan Desai", email: "rohan.desai@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Computer Science",
        collegeId, courseId: cseId, semesterId: cseSem(7),
        year: 4, role: "student", reputationScore: 310, reputationLevel: "gold",
        verified: true, cgpa: 8.2, attendance: 78,
        bio: "Final year CS. Full-stack dev, building startups on the side.",
        avatarUrl: "https://ui-avatars.com/api/?name=Rohan+Desai&background=0ea5e9&color=fff&bold=true",
      },
      {
        name: "Ananya Rao", email: "ananya.rao@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Computer Science",
        collegeId, courseId: cseId, semesterId: cseSem(3),
        year: 2, role: "student", reputationScore: 95, reputationLevel: "bronze",
        verified: true, cgpa: 8.8, attendance: 88,
        bio: "Interested in ML and UI design.",
        avatarUrl: "https://ui-avatars.com/api/?name=Ananya+Rao&background=f59e0b&color=fff&bold=true",
      },
      {
        name: "Karan Mehta", email: "karan.mehta@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Electronics",
        collegeId, courseId: ecId, semesterId: eceSem(3),
        year: 2, role: "student", reputationScore: 70, reputationLevel: "bronze",
        verified: false, cgpa: 7.5, attendance: 72,
        bio: "ECE 2nd year. Electronics tinkerer.",
        avatarUrl: "https://ui-avatars.com/api/?name=Karan+Mehta&background=10b981&color=fff&bold=true",
      },
      {
        name: "Sanya Gupta", email: "sanya.gupta@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Computer Science",
        collegeId, courseId: cseId, semesterId: cseSem(1),
        year: 1, role: "student", reputationScore: 20, reputationLevel: "bronze",
        verified: false, cgpa: null, attendance: 80,
        bio: "Fresher! Excited to be here.",
        avatarUrl: "https://ui-avatars.com/api/?name=Sanya+Gupta&background=f43f5e&color=fff&bold=true",
      },
      {
        name: "Ishaan Patel", email: "ishaan.patel@dec.edu", passwordHash: PW_HASH,
        college: "Demo Engineering College", department: "Business",
        collegeId, courseId: mbaId, semesterId: mbaSem(1),
        year: 1, role: "student", reputationScore: 55, reputationLevel: "bronze",
        verified: true, cgpa: 7.9, attendance: 83,
        bio: "MBA 1st year. Aspiring entrepreneur and finance enthusiast.",
        avatarUrl: "https://ui-avatars.com/api/?name=Ishaan+Patel&background=7c3aed&color=fff&bold=true",
      },
    ];
    const inserted = await db.insert(usersTable).values(userData).returning({ id: usersTable.id, name: usersTable.name });
    for (const u of inserted) userIdMap[u.name] = u.id;
    console.log(`Seeded ${inserted.length} users`);
  }
}

/* ─── 6. Posts ───────────────────────────────────────────────── */
{
  if ((await countOf(postsTable)) > 0) {
    console.log(`posts already seeded, skipping`);
  } else {
    await db.insert(postsTable).values([
      {
        collegeId,
        authorId: userIdMap["Rohan Desai"],
        authorName: "Rohan Desai",
        authorAvatar: "https://ui-avatars.com/api/?name=Rohan+Desai&background=0ea5e9&color=fff&bold=true",
        authorDept: "Computer Science",
        authorLevel: "4th Year",
        content: "Just got my GSoC offer from Mozilla! 🎉 3 months of working on Firefox DevTools. For anyone applying next year — start early, contribute to small issues first, and write a really detailed proposal. Happy to share mine if it helps!",
        category: "academics",
        likes: 142,
        commentsCount: 38,
        anonymous: false,
        status: "active",
      },
      {
        collegeId,
        authorId: userIdMap["Neha Kulkarni"],
        authorName: "Neha Kulkarni",
        authorAvatar: "https://ui-avatars.com/api/?name=Neha+Kulkarni&background=ec4899&color=fff&bold=true",
        authorDept: "Computer Science",
        authorLevel: "2nd Year",
        content: "DBMS mid-sem paper was brutal 😭 Who else found the normalization and ER diagram questions way out of scope? Please can someone share good revision notes for the end-semester? Study group in library Room 204 tomorrow at 6pm — all welcome!",
        category: "academics",
        likes: 89,
        commentsCount: 24,
        anonymous: false,
        status: "active",
      },
      {
        collegeId,
        authorName: "Anonymous",
        authorDept: "Unknown",
        authorLevel: "Student",
        content: "Hot take: the canteen food quality has dropped 40% since the new contractor took over. The dal is watery, rotis are always half-cooked, and prices went UP. Can the student council actually do something about this??",
        category: "campus_life",
        likes: 234,
        commentsCount: 67,
        anonymous: true,
        status: "active",
      },
      {
        collegeId,
        authorId: userIdMap["Arjun Verma"],
        authorName: "Arjun Verma",
        authorAvatar: "https://ui-avatars.com/api/?name=Arjun+Verma&background=6366f1&color=fff&bold=true",
        authorDept: "Computer Science",
        authorLevel: "3rd Year",
        content: "We're organising a 48-hour hackathon next month — 'HackDEC 2026'. Open to all branches, team size 2-4. Prizes worth ₹1.5L, mentors from top startups. Registration link in bio. Spread the word! 🚀",
        imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
        category: "events",
        likes: 311,
        commentsCount: 55,
        anonymous: false,
        status: "active",
      },
      {
        collegeId,
        authorId: userIdMap["Ishaan Patel"],
        authorName: "Ishaan Patel",
        authorAvatar: "https://ui-avatars.com/api/?name=Ishaan+Patel&background=7c3aed&color=fff&bold=true",
        authorDept: "Business",
        authorLevel: "1st Year MBA",
        content: "Just finished reading Zero to One by Peter Thiel. Absolutely mind-bending perspective on startups and monopolies. Anyone up for a startup book club? Meeting every Saturday 5pm in the MBA reading room. DM me to join!",
        category: "campus_life",
        likes: 47,
        commentsCount: 12,
        anonymous: false,
        status: "active",
      },
      {
        collegeId,
        authorName: "Anonymous",
        authorDept: "Unknown",
        authorLevel: "Student",
        content: "Genuine question — is anyone else struggling with the new attendance policy? 75% minimum is hard when professors mark absent even if you're 2 minutes late. Feels more like a punishment than an incentive to learn.",
        category: "academics",
        likes: 178,
        commentsCount: 43,
        anonymous: true,
        status: "active",
      },
      {
        collegeId,
        authorId: userIdMap["Ananya Rao"],
        authorName: "Ananya Rao",
        authorAvatar: "https://ui-avatars.com/api/?name=Ananya+Rao&background=f59e0b&color=fff&bold=true",
        authorDept: "Computer Science",
        authorLevel: "2nd Year",
        content: "Sharing my Figma UI kit for student projects — free to use! Includes components for dashboards, login screens, and card layouts. Link in comments. Happy to collaborate on designs for your projects too 🎨",
        category: "academics",
        likes: 63,
        commentsCount: 19,
        anonymous: false,
        status: "active",
      },
      {
        collegeId,
        authorId: userIdMap["Karan Mehta"],
        authorName: "Karan Mehta",
        authorAvatar: "https://ui-avatars.com/api/?name=Karan+Mehta&background=10b981&color=fff&bold=true",
        authorDept: "Electronics",
        authorLevel: "2nd Year",
        content: "Built a smart dustbin using Arduino + ultrasonic sensor for our mini project! It alerts the hostel warden via SMS when it's full 🗑️ Code open-sourced on GitHub. Any ECE folks want to extend this to IoT?",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        category: "academics",
        likes: 91,
        commentsCount: 17,
        anonymous: false,
        status: "active",
      },
    ]);
    console.log(`Seeded 8 posts`);
  }
}

/* ─── 7. Q&A ─────────────────────────────────────────────────── */
{
  if ((await countOf(qaTable)) > 0) {
    console.log(`qa_questions already seeded, skipping`);
  } else {
    await db.insert(qaTable).values([
      { collegeId, authorId: userIdMap["Neha Kulkarni"], question: "What are the best resources to prepare for TCS NQT and Infosys SP Off-Campus drives? Any specific coding platforms or mock tests?", upvotes: 34, repliesCount: 12, status: "active" },
      { collegeId, authorId: userIdMap["Sanya Gupta"], question: "How do I apply for the leave of absence for the upcoming international hackathon? The dates clash with internal exams.", upvotes: 21, repliesCount: 8, status: "active" },
      { collegeId, authorId: userIdMap["Karan Mehta"], question: "Is there a lab available after 8pm for ECE students? The official lab closes at 6pm and I need to finish my final project.", upvotes: 15, repliesCount: 5, status: "active" },
      { collegeId, authorId: userIdMap["Ishaan Patel"], question: "Can MBA students audit engineering electives (like ML or Web Tech) for credit? Who do I approach for permission?", upvotes: 28, repliesCount: 9, status: "active" },
      { collegeId, authorId: userIdMap["Arjun Verma"], question: "What GPA/CGPA cutoff does Google typically enforce for their internship shortlist? Anyone placed there from DEC can share insights?", upvotes: 57, repliesCount: 22, status: "active" },
      { collegeId, question: "Is the railway concession form available online this semester or do we still have to visit the office in person?", upvotes: 19, repliesCount: 6, status: "active" },
    ]);
    console.log(`Seeded 6 Q&A questions`);
  }
}

/* ─── 8. Clubs ───────────────────────────────────────────────── */
{
  if ((await countOf(clubsTable)) > 0) {
    console.log(`clubs already seeded, skipping`);
  } else {
    await db.insert(clubsTable).values([
      { collegeId, name: "CodeCraft Club", description: "Weekly coding contests, DSA sessions, competitive programming workshops and hackathon teams. Open to all branches.", category: "Technical", memberCount: 312, official: true, trending: true, imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80", badge: "🏆", nextEvent: "Weekly LeetCode Sprint", nextEventDate: "Every Saturday 4pm" },
      { collegeId, name: "Entrepreneurship Cell", description: "Where ideas meet execution. Startup pitches, investor meets, mentorship sessions and an annual fest — E-Summit.", category: "Business", memberCount: 198, official: true, trending: true, imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80", badge: "🚀", nextEvent: "Startup Pitch Night", nextEventDate: "Jul 28, 2026" },
      { collegeId, name: "Photography Club", description: "Campus shoots, dark-room sessions, photo walks, and our annual college calendar shoot. All skill levels welcome.", category: "Arts", memberCount: 156, official: true, trending: false, imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", badge: "📸", nextEvent: "Monsoon Photo Walk", nextEventDate: "Jul 20, 2026" },
      { collegeId, name: "Robotics & AI Society", description: "Build robots, tinker with sensors, explore deep learning and participate in national-level competitions.", category: "Technical", memberCount: 134, official: true, trending: true, imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80", badge: "🤖", nextEvent: "Line-Follower Bot Workshop", nextEventDate: "Jul 22, 2026" },
      { collegeId, name: "Literary & Debate Club", description: "Debates, MUNs, creative writing, spoken word poetry and our annual lit fest. Sharpen your words.", category: "Cultural", memberCount: 89, official: true, trending: false, imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80", badge: "📝", nextEvent: "Inter-College Debate", nextEventDate: "Aug 2, 2026" },
      { collegeId, name: "Sports Council", description: "Cricket, football, badminton, chess and more. Intra- and inter-college tournaments all year round.", category: "Sports", memberCount: 410, official: true, trending: false, imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80", badge: "⚽", nextEvent: "Annual Sports Day", nextEventDate: "Aug 15, 2026" },
      { collegeId, name: "Music Collective", description: "Rock, classical, indie, electronic — all genres welcome. Band jams, open mics, and our college fest stage.", category: "Arts", memberCount: 201, official: false, trending: true, imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", badge: "🎵", nextEvent: "Open Mic Night", nextEventDate: "Jul 25, 2026" },
      { collegeId, name: "NSS Unit", description: "National Service Scheme — community service, blood donation drives, cleanliness campaigns and village adoption programs.", category: "Social", memberCount: 276, official: true, trending: false, imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80", badge: "❤️", nextEvent: "Blood Donation Drive", nextEventDate: "Jul 30, 2026" },
    ]);
    console.log(`Seeded 8 clubs`);
  }
}

/* ─── 9. Communities ─────────────────────────────────────────── */
{
  if ((await countOf(communitiesTable)) > 0) {
    console.log(`communities already seeded, skipping`);
  } else {
    await db.insert(communitiesTable).values([
      { collegeId, name: "CSE 2024 Batch", memberCount: 180, icon: "💻", color: "#6366f1" },
      { collegeId, name: "Placement Prep 2026", memberCount: 340, icon: "🎯", color: "#10b981" },
      { collegeId, name: "Hostel Life", memberCount: 520, icon: "🏠", color: "#f59e0b" },
      { collegeId, name: "ECE Enthusiasts", memberCount: 95, icon: "⚡", color: "#3b82f6" },
      { collegeId, name: "Campus Foodies", memberCount: 287, icon: "🍜", color: "#ef4444" },
      { collegeId, name: "Open Source Contributors", memberCount: 112, icon: "🛠️", color: "#8b5cf6" },
      { collegeId, name: "Study Buddies", memberCount: 430, icon: "📚", color: "#0ea5e9" },
      { collegeId, name: "MBA Network", memberCount: 76, icon: "📊", color: "#7c3aed" },
    ]);
    console.log(`Seeded 8 communities`);
  }
}

/* ─── 10. Events ─────────────────────────────────────────────── */
{
  if ((await countOf(eventsTable)) > 0) {
    console.log(`events already seeded, skipping`);
  } else {
    await db.insert(eventsTable).values([
      { collegeId, title: "HackDEC 2026 — 48-Hour Hackathon", date: "Aug 10, 2026", time: "9:00 AM", venue: "Main Auditorium & CS Labs", organizer: "CodeCraft Club", status: "upcoming" },
      { collegeId, title: "Campus Placement Orientation", date: "Jul 22, 2026", time: "11:00 AM", venue: "Seminar Hall A", organizer: "Training & Placement Cell", status: "upcoming" },
      { collegeId, title: "E-Summit 2026 — Startup Pitch Night", date: "Jul 28, 2026", time: "5:00 PM", venue: "Open Air Theatre", organizer: "Entrepreneurship Cell", status: "upcoming" },
      { collegeId, title: "Blood Donation Drive", date: "Jul 30, 2026", time: "9:00 AM", venue: "College Gymnasium", organizer: "NSS Unit", status: "upcoming" },
      { collegeId, title: "Open Mic Night — Vol. 8", date: "Jul 25, 2026", time: "6:30 PM", venue: "College Canteen Lawn", organizer: "Music Collective", status: "upcoming" },
      { collegeId, title: "Monsoon Photo Walk", date: "Jul 20, 2026", time: "7:00 AM", venue: "College Garden & Lake", organizer: "Photography Club", status: "upcoming" },
      { collegeId, title: "Line-Follower Bot Workshop", date: "Jul 22, 2026", time: "2:00 PM", venue: "Electronics Lab 3", organizer: "Robotics & AI Society", status: "upcoming" },
      { collegeId, title: "Inter-College Debate — Motion: AI will replace engineers", date: "Aug 2, 2026", time: "10:00 AM", venue: "Seminar Hall B", organizer: "Literary & Debate Club", status: "upcoming" },
      { collegeId, title: "Annual Sports Day 2026", date: "Aug 15, 2026", time: "8:00 AM", venue: "Sports Ground", organizer: "Sports Council", status: "upcoming" },
      { collegeId, title: "ML Bootcamp — Intro to Neural Networks", date: "Jul 19, 2026", time: "3:00 PM", venue: "CS Seminar Room", organizer: "CodeCraft Club", status: "upcoming" },
    ]);
    console.log(`Seeded 10 events`);
  }
}

/* ─── 11. Internships ────────────────────────────────────────── */
{
  if ((await countOf(internshipsTable)) > 0) {
    console.log(`internships already seeded, skipping`);
  } else {
    await db.insert(internshipsTable).values([
      { collegeId, title: "Software Engineering Intern", company: "Google", location: "Bangalore (Hybrid)", salary: "₹80,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=G&background=4285F4&color=fff&bold=true", isNew: true },
      { collegeId, title: "SDE Intern — Backend", company: "Flipkart", location: "Bangalore", salary: "₹60,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=F&background=F6A704&color=fff&bold=true", isNew: true },
      { collegeId, title: "ML Research Intern", company: "Microsoft Research", location: "Hyderabad (Remote option)", salary: "₹70,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=M&background=00A4EF&color=fff&bold=true", isNew: true },
      { collegeId, title: "Frontend Engineer Intern (React)", company: "Razorpay", location: "Bangalore", salary: "₹55,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=R&background=3395FF&color=fff&bold=true", isNew: false },
      { collegeId, title: "Data Science Intern", company: "Zomato", location: "Gurugram (Hybrid)", salary: "₹45,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=Z&background=E23744&color=fff&bold=true", isNew: false },
      { collegeId, title: "Embedded Systems Intern", company: "Bosch India", location: "Pune", salary: "₹30,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=B&background=EA0016&color=fff&bold=true", isNew: false },
      { collegeId, title: "Product Management Intern", company: "Meesho", location: "Bangalore (Remote)", salary: "₹40,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=M&background=9B1FE8&color=fff&bold=true", isNew: true },
      { collegeId, title: "Cloud Infra Intern (AWS)", company: "Accenture", location: "Pune / Remote", salary: "₹35,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=A&background=A100FF&color=fff&bold=true", isNew: false },
      { collegeId, title: "Cybersecurity Analyst Intern", company: "KPMG India", location: "Mumbai", salary: "₹38,000/mo", status: "closed", logoUrl: "https://ui-avatars.com/api/?name=K&background=00338D&color=fff&bold=true", isNew: false },
      { collegeId, title: "iOS Developer Intern (Swift)", company: "Swiggy", location: "Bangalore", salary: "₹50,000/mo", status: "open", logoUrl: "https://ui-avatars.com/api/?name=S&background=FC8019&color=fff&bold=true", isNew: true },
    ]);
    console.log(`Seeded 10 internships`);
  }
}

/* ─── 12. Link existing marketplace / study rows to college ──── */
{
  const unlinkedListings = await db.select({ id: listingsTable.id })
    .from(listingsTable).where(isNull(listingsTable.collegeId));
  if (unlinkedListings.length > 0) {
    await db.update(listingsTable).set({ collegeId }).where(isNull(listingsTable.collegeId));
    console.log(`Linked ${unlinkedListings.length} listings to college`);
  }

  const unlinkedLocal = await db.select({ id: localListingsTable.id })
    .from(localListingsTable).where(isNull(localListingsTable.collegeId));
  if (unlinkedLocal.length > 0) {
    await db.update(localListingsTable).set({ collegeId, collegeName: "Demo Engineering College" }).where(isNull(localListingsTable.collegeId));
    console.log(`Linked ${unlinkedLocal.length} local_listings to college`);
  }

  const unlinkedStudy = await db.select({ id: studyMaterialsTable.id })
    .from(studyMaterialsTable).where(isNull(studyMaterialsTable.collegeId));
  if (unlinkedStudy.length > 0) {
    await db.update(studyMaterialsTable).set({ collegeId }).where(isNull(studyMaterialsTable.collegeId));
    console.log(`Linked ${unlinkedStudy.length} study_materials to college`);
  }
}

console.log("\n✅ Full demo seed complete.");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Demo login credentials (all use password: Demo@123)");
console.log("  Admin:     admin@dec.edu");
console.log("  Moderator: priya.mod@dec.edu");
console.log("  Student:   arjun.verma@dec.edu");
console.log("  Student:   neha.kulkarni@dec.edu");
console.log("  Student:   rohan.desai@dec.edu");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
process.exit(0);
