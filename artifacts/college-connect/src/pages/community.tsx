import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Code, Camera, Music, MessageCircle, Heart, Share2,
  Bookmark, Image as ImageIcon, BarChart2, Smile, ArrowRight,
  Shield, PlusCircle, Rocket, Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ActionMenu, ActionToast } from "@/components/shared/ContentActions";
import { useAuth } from "@/contexts/AuthContext";

/* ─── types & seed ───────────────────────────────────────── */
interface Post {
  id: string;
  authorName: string;
  authorUser: string;
  authorSrc?: string;
  dept: string;
  timeAgo: string;
  badge?: string;
  body: string;
  imageSrc?: string;
  likes: number;
  comments: number;
  liked: boolean;
  bookmarked: boolean;
}

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    authorName: "Alex Rivera",
    authorUser: "Alex Rivera",
    dept: "CS Dept",
    timeAgo: "Just now",
    body: "Just submitted our final year project demo! 🎉 Built a full-stack campus app with real-time notifications. Six months of work condensed into a 10-minute presentation. Worth it!",
    likes: 0, comments: 0, liked: false, bookmarked: false,
  },
  {
    id: "p2",
    authorName: "Julian Chen",
    authorUser: "Julian Chen",
    authorSrc: "https://i.pravatar.cc/150?u=a042581f4e29026702d",
    dept: "CS Dept",
    timeAgo: "2h ago",
    badge: "PLATINUM",
    body: "Just wrapped up the 48-hour global hackathon! Massive shoutout to my team. We built an AI tool that converts lecture recordings into interactive flashcards. It's rough, but it works! 🚀💻 Anyone want to beta test it?",
    imageSrc: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    likes: 142, comments: 28, liked: false, bookmarked: false,
  },
  {
    id: "p3",
    authorName: "Priya S.",
    authorUser: "Priya S.",
    authorSrc: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
    dept: "Data Science",
    timeAgo: "5h ago",
    body: "Reminder: The ML paper reading group meets every Thursday at 6 PM in Lab 204. This week we're covering 'Attention Is All You Need'. Drop a comment if you're coming! 📖",
    likes: 67, comments: 14, liked: false, bookmarked: false,
  },
];

/* ─── Single Post Card ───────────────────────────────────── */
function PostCard({ post, onDelete, onReport, onLike, onBookmark }: {
  post: Post;
  onDelete: (id: string) => void;
  onReport: (title: string) => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}) {
  const { user } = useAuth();
  const isMod = user?.role === "low_admin" || user?.role === "admin";
  const isOwner = post.authorUser === user?.name;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-slate-100">
                {post.authorSrc
                  ? <AvatarImage src={post.authorSrc} />
                  : <AvatarFallback className="bg-blue-600 text-white font-medium text-sm">{post.authorName.slice(0,2).toUpperCase()}</AvatarFallback>}
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{post.authorName}</h4>
                  {post.badge && (
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none text-[10px] px-1.5 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> {post.badge}
                    </Badge>
                  )}
                  {isOwner && (
                    <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] px-1.5">YOU</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{post.dept} • {post.timeAgo}</p>
              </div>
            </div>
            <ActionMenu
              title={`Post by ${post.authorName}`}
              isOwner={isOwner}
              isModerator={isMod}
              onDelete={() => onDelete(post.id)}
              onReport={() => onReport(`Post by ${post.authorName}`)}
            />
          </div>

          {/* Body */}
          <p className="text-slate-800 mb-4 leading-relaxed">{post.body}</p>

          {post.imageSrc && (
            <div className="rounded-xl overflow-hidden mb-4 border border-slate-100 bg-slate-100 aspect-video">
              <img src={post.imageSrc} alt="post" className="object-cover w-full h-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex gap-5">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors group ${post.liked ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
              >
                <Heart className={`h-5 w-5 ${post.liked ? "fill-current" : "group-hover:fill-current"}`} />
                <span className="text-sm font-semibold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => onBookmark(post.id)}
              className={`transition-colors ${post.bookmarked ? "text-blue-600" : "text-slate-400 hover:text-slate-700"}`}
            >
              <Bookmark className={`h-5 w-5 ${post.bookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success"|"warn" } | null>(null);

  const notify = (msg: string, type: "success"|"warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const createPost = () => {
    if (!draft.trim()) return;
    const np: Post = {
      id: `post_${Date.now()}`,
      authorName: user?.name ?? "You",
      authorUser: user?.name ?? "",
      dept: "Campus",
      timeAgo: "Just now",
      body: draft.trim(),
      likes: 0, comments: 0, liked: false, bookmarked: false,
    };
    setPosts(p => [np, ...p]);
    setDraft("");
    notify("Post published!");
  };

  const deletePost = (id: string) => {
    setPosts(p => p.filter(x => x.id !== id));
    notify("Post deleted.");
  };

  const reportPost = (title: string) => {
    notify(`"${title}" reported. Moderators will review it.`, "warn");
  };

  const toggleLike = (id: string) => {
    setPosts(p => p.map(x => x.id === id
      ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 }
      : x
    ));
  };

  const toggleBookmark = (id: string) => {
    setPosts(p => p.map(x => x.id === id ? { ...x, bookmarked: !x.bookmarked } : x));
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      {toast && <ActionToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Community & Social Hub</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left column ── */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> Hobby Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[
                  { icon: Code,   bg: "bg-indigo-50",  ic: "text-indigo-600", name: "Hackathon Squad",    n: "1.2k" },
                  { icon: Camera, bg: "bg-pink-50",    ic: "text-pink-600",   name: "Photography Club",  n: "856" },
                  { icon: Music,  bg: "bg-emerald-50", ic: "text-emerald-600",name: "Campus Bands",      n: "432" },
                ].map(({ icon: Icon, bg, ic, name, n }) => (
                  <div key={name} className="flex items-center gap-3 group cursor-pointer">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center group-hover:opacity-80 transition-opacity`}>
                      <Icon className={`h-5 w-5 ${ic}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                      <p className="text-xs text-slate-500">{n} members</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-sm font-medium mt-2 border-slate-200">View All Communities</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-b from-orange-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-bold text-slate-900">Meetup Requests</CardTitle>
                <p className="text-xs text-slate-500">Casual tea/coffee hangouts</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026701d" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">Sneha J.</p>
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-1.5 py-0 mt-1 text-[10px]">Architecture</Badge>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">10m ago</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-4">Anyone up for grabbing coffee at the South Canteen? Need a break from studio work! ☕</p>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs font-bold">Join</Button>
                    <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 h-8 text-xs font-bold">Ignore</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Center column ── */}
          <div className="lg:col-span-6 space-y-6">
            {/* Compose box */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4 mb-3">
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarFallback className="bg-blue-600 text-white font-medium">{user?.initials ?? "U"}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="What's happening on campus?"
                    className="border-none bg-slate-50 resize-none focus-visible:ring-0 text-base"
                    rows={3}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 h-9 w-9"><ImageIcon className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 h-9 w-9"><BarChart2 className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 h-9 w-9"><Smile className="h-5 w-5" /></Button>
                  </div>
                  <Button
                    onClick={createPost}
                    disabled={!draft.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-full gap-1.5"
                  >
                    <Send className="h-4 w-4" /> Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts feed */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={deletePost}
                    onReport={reportPost}
                    onLike={toggleLike}
                    onBookmark={toggleBookmark}
                  />
                ))}
              </AnimatePresence>
              {posts.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <PlusCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No posts yet. Be the first to share!
                </div>
              )}
            </div>

            {/* Founder matchmaker */}
            <Card className="bg-slate-900 text-white border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-400" /> Founder Matchmaker
                </CardTitle>
                <p className="text-sm text-slate-400">Connect with peers to build startups & projects</p>
              </CardHeader>
              <CardContent className="p-5 pt-2 relative z-10 space-y-3">
                {[
                  { badge: "LOOKING FOR: UI DESIGNER",   bc: "bg-blue-900/50 text-blue-300 border-blue-800",    title: "Fintech App for Students",   founders: 2 },
                  { badge: "LOOKING FOR: BACKEND DEV",   bc: "bg-emerald-900/50 text-emerald-300 border-emerald-800", title: "Campus EV Rental System", founders: 1 },
                ].map(f => (
                  <div key={f.title} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <Badge className={`${f.bc} mb-2`}>{f.badge}</Badge>
                      <h4 className="font-bold text-white mb-1">{f.title}</h4>
                      <span className="text-xs text-slate-400">{f.founders} Founder{f.founders > 1 ? "s" : ""}</span>
                    </div>
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200">Connect</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Anonymous Q&A */}
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50 rounded-t-xl">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  Anonymous Q&A
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-none">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[
                  { q: '"What are the best electives in 5th sem for AI track?"',       v: 42 },
                  { q: '"Is it normal to feel lost in Data Structures? Need advice."', v: 89, r: "8 Replies" },
                ].map(({ q, v, r }) => (
                  <div key={q} className="space-y-2">
                    <p className="text-sm font-medium text-slate-800">{q}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 -rotate-90" /> {v} Upvotes
                      </span>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">{r ?? "Reply"}</button>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                  </div>
                ))}
                <Button className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800 text-sm h-9">Ask Anonymously</Button>
              </CardContent>
            </Card>

            {/* Reputation leaders */}
            <Card className="border-none shadow-sm bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-bold text-slate-900">Reputation Leaders</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {[
                  { rank: "1", name: "Priya S.", score: "14.2k", medal: "🥇" },
                  { rank: "2", name: "Rahul M.", score: "12.8k", medal: "🥈" },
                  { rank: "3", name: "Anita K.", score: "10.5k", medal: "🥉" },
                ].map(l => (
                  <div key={l.rank} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{l.medal}</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs bg-slate-200 text-slate-700">{l.name[0]}</AvatarFallback></Avatar>
                        <span className="text-sm font-bold text-slate-900">{l.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{l.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Poll */}
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-red-50 text-red-600 border-none mb-2 hover:bg-red-50">Active Poll</Badge>
                <CardTitle className="text-md font-bold text-slate-900 leading-tight">Should the library be open 24/7 during finals week?</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                {[{ label: "Yes, absolutely", pct: 82 }, { label: "No, unnecessary", pct: 18 }].map(({ label, pct }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{label}</span><span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${pct > 50 ? "bg-blue-600" : "bg-slate-300"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-4 text-center">1,204 votes • 2 days left</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
