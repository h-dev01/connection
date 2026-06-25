import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Code, Camera, Music, MessageCircle, Heart, Share2,
  Bookmark, Image as ImageIcon, Smile, ArrowRight, ArrowUp,
  Shield, PlusCircle, Rocket, Send, Flame, Hash, Calendar,
  ChevronDown, ChevronUp, Globe, Lock, X, Plus, Trophy,
  Mic, BookOpen, PartyPopper, HelpCircle, Megaphone, Eye,
  ThumbsUp, Star, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ActionMenu, ActionToast } from "@/components/shared/ContentActions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
type Flair = "Discussion" | "Event" | "Question" | "Fun" | "Announcement" | "Study Help";
interface Comment { id: string; authorName: string; authorSrc?: string; body: string; timeAgo: string; likes: number; liked: boolean; }
interface Post {
  id: string; authorName: string; authorUser: string; authorSrc?: string;
  dept: string; timeAgo: string; badge?: string; flair?: Flair;
  body: string; imageSrc?: string;
  likes: number; liked: boolean; bookmarked: boolean;
  comments: Comment[]; showComments?: boolean;
}

/* ─── Flair config ───────────────────────────────────────── */
const FLAIR_CFG: Record<Flair, { color: string; icon: React.FC<{ className?: string }> }> = {
  "Discussion":    { color: "bg-blue-100 text-blue-700",     icon: MessageCircle },
  "Event":         { color: "bg-purple-100 text-purple-700", icon: Calendar },
  "Question":      { color: "bg-amber-100 text-amber-700",   icon: HelpCircle },
  "Fun":           { color: "bg-pink-100 text-pink-700",     icon: PartyPopper },
  "Announcement":  { color: "bg-red-100 text-red-700",       icon: Megaphone },
  "Study Help":    { color: "bg-emerald-100 text-emerald-700", icon: BookOpen },
};
const FLAIRS = Object.keys(FLAIR_CFG) as Flair[];

/* ─── Stories / Status strips ───────────────────────────── */
const STORIES = [
  { name: "Julian C.", src: "https://i.pravatar.cc/150?u=a042581f4e29026702d", ring: "ring-blue-500" },
  { name: "Sneha J.",  src: "https://i.pravatar.cc/150?u=a042581f4e29026701d", ring: "ring-pink-500" },
  { name: "Arjun R.",  src: "https://i.pravatar.cc/150?u=a042581f4e29026705d", ring: "ring-emerald-500" },
  { name: "Tanya M.",  src: "https://i.pravatar.cc/150?u=a042581f4e29026706d", ring: "ring-purple-500" },
  { name: "Dev P.",    src: "https://i.pravatar.cc/150?u=a042581f4e29026707d", ring: "ring-orange-500" },
  { name: "Kavya S.",  src: "https://i.pravatar.cc/150?u=a042581f4e29026708d", ring: "ring-red-500" },
];

/* ─── Seed posts ─────────────────────────────────────────── */
const SEED_POSTS: Post[] = [
  {
    id: "p1", authorName: "Julian Chen", authorUser: "Julian Chen",
    authorSrc: "https://i.pravatar.cc/150?u=a042581f4e29026702d",
    dept: "CS Dept", timeAgo: "2h ago", badge: "PLATINUM", flair: "Announcement",
    body: "Just wrapped up the 48-hour global hackathon! 🚀 Massive shoutout to my team. We built an AI tool that converts lecture recordings into interactive flashcards. Anyone want to beta test it? Drop a comment!",
    imageSrc: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    likes: 142, liked: false, bookmarked: false,
    comments: [
      { id: "c1", authorName: "Priya S.", body: "That sounds amazing! I'd love to beta test it 🙌", timeAgo: "1h ago", likes: 8, liked: false },
      { id: "c2", authorName: "Arjun R.", body: "Congratulations! What tech stack did you use?", timeAgo: "45m ago", likes: 4, liked: false },
    ],
  },
  {
    id: "p2", authorName: "Priya S.", authorUser: "Priya S.",
    authorSrc: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
    dept: "Data Science", timeAgo: "5h ago", flair: "Study Help",
    body: "Reminder: The ML paper reading group meets every Thursday at 6 PM in Lab 204. This week we're covering 'Attention Is All You Need'. Drop a 👋 if you're coming!",
    likes: 67, liked: false, bookmarked: false,
    comments: [
      { id: "c3", authorName: "Dev P.", body: "I'll be there! Should we bring printed copies?", timeAgo: "4h ago", likes: 3, liked: false },
    ],
  },
  {
    id: "p3", authorName: "Sneha J.", authorUser: "Sneha J.",
    authorSrc: "https://i.pravatar.cc/150?u=a042581f4e29026701d",
    dept: "Architecture", timeAgo: "8h ago", flair: "Event",
    body: "The Annual Architecture Exhibition opens this Friday at 5 PM in the Main Hall! 🏛️ Three years of student projects on display. Come see what we've been building. Everyone welcome!",
    imageSrc: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800&q=80",
    likes: 94, liked: false, bookmarked: false,
    comments: [],
  },
  {
    id: "p4", authorName: "Rahul M.", authorUser: "Rahul M.",
    authorSrc: "https://i.pravatar.cc/150?u=a042581f4e29026709d",
    dept: "Mech Dept", timeAgo: "1d ago", flair: "Question",
    body: "Is it normal to feel completely lost during 3rd year Thermodynamics? 😅 Like I study for hours and nothing sticks. Any seniors who've been through this? How did you manage?",
    likes: 113, liked: false, bookmarked: false,
    comments: [
      { id: "c4", authorName: "Julian Chen", body: "Been there! The trick is solving 10 numericals a day, not just reading theory.", timeAgo: "20h ago", likes: 22, liked: false },
      { id: "c5", authorName: "Kavya S.", body: "Study groups help a lot. Reach out to your batch WhatsApp group!", timeAgo: "18h ago", likes: 15, liked: false },
    ],
  },
];

/* ─── Communities ────────────────────────────────────────── */
const COMMUNITIES = [
  { icon: Code,        bg: "bg-indigo-50",   ic: "text-indigo-600",  name: "Hackathon Squad",   n: "1.2k", joined: true },
  { icon: Camera,      bg: "bg-pink-50",     ic: "text-pink-600",    name: "Photography Club",  n: "856",  joined: false },
  { icon: Music,       bg: "bg-emerald-50",  ic: "text-emerald-600", name: "Campus Bands",       n: "432",  joined: true },
  { icon: Rocket,      bg: "bg-orange-50",   ic: "text-orange-600",  name: "Founders Network",  n: "689",  joined: false },
  { icon: BookOpen,    bg: "bg-sky-50",      ic: "text-sky-600",     name: "Study Circles",     n: "2.1k", joined: true },
  { icon: Trophy,      bg: "bg-amber-50",    ic: "text-amber-600",   name: "Sports Connect",    n: "978",  joined: false },
];

/* ─── Trending topics ────────────────────────────────────── */
const TRENDING = ["#EndOfSemExams", "#HackathonSeason", "#PlacementPrep", "#CampusFest2025", "#MLPapers", "#StartupIdeas"];

/* ─── Upcoming events ────────────────────────────────────── */
const EVENTS = [
  { title: "Architecture Exhibition", date: "Fri, 5 PM", place: "Main Hall", color: "bg-purple-100 text-purple-700" },
  { title: "ML Reading Group",        date: "Thu, 6 PM", place: "Lab 204",   color: "bg-blue-100 text-blue-700" },
  { title: "Campus Fest Auditions",   date: "Sat, 11 AM", place: "Open Air Theatre", color: "bg-pink-100 text-pink-700" },
];

/* ─── Comment component ──────────────────────────────────── */
function CommentItem({ comment, onLike }: { comment: Comment; onLike: (id: string) => void }) {
  return (
    <div className="flex gap-3 py-2">
      <Avatar className="h-7 w-7 flex-none mt-0.5">
        {comment.authorSrc ? <img src={comment.authorSrc} className="rounded-full" /> : null}
        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">{comment.authorName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-slate-50 rounded-2xl px-3.5 py-2.5">
          <p className="text-xs font-bold text-slate-800 mb-0.5">{comment.authorName}</p>
          <p className="text-sm text-slate-700 leading-snug">{comment.body}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 pl-1">
          <button onClick={() => onLike(comment.id)}
            className={cn("text-xs font-bold transition-colors flex items-center gap-1",
              comment.liked ? "text-red-500" : "text-slate-400 hover:text-red-500")}>
            <Heart className={cn("h-3 w-3", comment.liked && "fill-current")} />
            {comment.likes > 0 && comment.likes}
          </button>
          <span className="text-xs text-slate-400">{comment.timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── PostCard ───────────────────────────────────────────── */
function PostCard({ post, onDelete, onReport, onLike, onBookmark, onLikeComment, onAddComment }: {
  post: Post; onDelete: (id: string) => void; onReport: (t: string) => void;
  onLike: (id: string) => void; onBookmark: (id: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onAddComment: (postId: string, body: string) => void;
}) {
  const { user } = useAuth();
  const isMod = user?.role === "low_admin" || user?.role === "admin";
  const isOwner = post.authorUser === user?.name;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const flair = post.flair ? FLAIR_CFG[post.flair] : null;

  const submitReply = () => {
    if (!replyText.trim()) return;
    onAddComment(post.id, replyText.trim());
    setReplyText("");
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="p-5 pb-0">
          {/* Author row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-slate-100">
                {post.authorSrc ? <AvatarImage src={post.authorSrc} /> : null}
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">{post.authorName.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">{post.authorName}</h4>
                  {post.badge && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none text-[10px] px-1.5 h-4"><Shield className="h-2.5 w-2.5 mr-0.5" />{post.badge}</Badge>}
                  {isOwner && <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] px-1.5 h-4">YOU</Badge>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-slate-400">{post.dept} · {post.timeAgo}</p>
                  {flair && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5", flair.color)}>
                      <flair.icon className="h-2.5 w-2.5" />{post.flair}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ActionMenu title={`Post by ${post.authorName}`} isOwner={isOwner} isModerator={isMod}
              onDelete={() => onDelete(post.id)} onReport={() => onReport(`Post by ${post.authorName}`)} />
          </div>

          {/* Body */}
          <p className="text-slate-800 text-sm leading-relaxed mb-3">{post.body}</p>

          {post.imageSrc && (
            <div className="rounded-xl overflow-hidden mb-3 border border-slate-100 bg-slate-100 aspect-video">
              <img src={post.imageSrc} alt="post media" className="object-cover w-full h-full" />
            </div>
          )}

          {/* Reaction bar */}
          <div className="flex items-center justify-between border-t border-slate-100 py-3">
            <div className="flex gap-4">
              <button onClick={() => onLike(post.id)}
                className={cn("flex items-center gap-1.5 text-sm font-semibold transition-colors group",
                  post.liked ? "text-red-500" : "text-slate-400 hover:text-red-500")}>
                <Heart className={cn("h-4.5 w-4.5", post.liked && "fill-current")} style={{ width: 18, height: 18 }} />
                <span>{post.likes}</span>
              </button>
              <button onClick={() => { setCommentsOpen(v => !v); setTimeout(() => replyRef.current?.focus(), 100); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-500 transition-colors">
                <MessageCircle style={{ width: 18, height: 18 }} />
                <span>{post.comments.length}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-500 transition-colors">
                <Share2 style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onBookmark(post.id)}
                className={cn("transition-colors", post.bookmarked ? "text-blue-600" : "text-slate-400 hover:text-slate-700")}>
                <Bookmark style={{ width: 18, height: 18 }} className={post.bookmarked ? "fill-current" : ""} />
              </button>
              {post.comments.length > 0 && (
                <button onClick={() => setCommentsOpen(v => !v)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                  {commentsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {commentsOpen ? "Hide" : "View"} comments
                </button>
              )}
            </div>
          </div>
        </CardContent>

        {/* Comments section */}
        <AnimatePresence>
          {commentsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden border-t border-slate-50 bg-white">
              <div className="px-5 pt-3 pb-1 space-y-0.5">
                {post.comments.map(c => (
                  <CommentItem key={c.id} comment={c} onLike={(cid) => onLikeComment(post.id, cid)} />
                ))}
              </div>
              {/* Reply box */}
              <div className="px-5 pb-4 pt-2 flex gap-3 items-start">
                <Avatar className="h-7 w-7 flex-none mt-1">
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">{user?.initials ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <textarea ref={replyRef} rows={1} value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                    placeholder="Write a comment…"
                    className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button onClick={submitReply} disabled={!replyText.trim()}
                    className="self-center h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/* ─── Compose Box ────────────────────────────────────────── */
function ComposeBox({ onPost }: { onPost: (body: string, imageSrc: string, flair: Flair | null) => void }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedFlair, setSelectedFlair] = useState<Flair | null>(null);

  const submit = () => {
    if (!draft.trim()) return;
    onPost(draft.trim(), imageUrl.trim(), selectedFlair);
    setDraft(""); setImageUrl(""); setShowImageInput(false); setSelectedFlair(null);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3 mb-3">
          <Avatar className="h-10 w-10 border border-slate-100 flex-none">
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">{user?.initials ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea placeholder="What's happening on campus? Share updates, ask questions, or plan events…"
              className="border-none bg-slate-50 resize-none focus-visible:ring-0 text-sm min-h-[72px]"
              value={draft} onChange={e => setDraft(e.target.value)} />
          </div>
        </div>

        {/* Flair picker */}
        <div className="flex flex-wrap gap-1.5 mb-3 ml-13" style={{ marginLeft: "52px" }}>
          {FLAIRS.map(f => {
            const cfg = FLAIR_CFG[f];
            const active = selectedFlair === f;
            return (
              <button key={f} onClick={() => setSelectedFlair(active ? null : f)}
                className={cn("text-xs font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
                  active ? cfg.color + " border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
                <cfg.icon className="h-3 w-3" />{f}
              </button>
            );
          })}
        </div>

        {/* Image URL input */}
        <AnimatePresence>
          {showImageInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3 ml-13" style={{ marginLeft: "52px" }}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input className="h-9 pl-8 text-sm bg-slate-50" placeholder="Paste image URL (Unsplash, Google Photos…)"
                    value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
                <button onClick={() => { setShowImageInput(false); setImageUrl(""); }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
              </div>
              {imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden h-32 bg-slate-100">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={() => setImageUrl("")} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer bar */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex gap-1">
            <button onClick={() => setShowImageInput(v => !v)}
              className={cn("p-2 rounded-lg transition-colors", showImageInput ? "bg-blue-100 text-blue-600" : "text-blue-500 hover:bg-blue-50")}>
              <ImageIcon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
            </button>
            <button className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
              <Smile style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {draft.length > 0 && <span className={cn("text-xs font-medium", draft.length > 280 ? "text-red-500" : "text-slate-400")}>{draft.length}/500</span>}
            <Button onClick={submit} disabled={!draft.trim() || draft.length > 500}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 rounded-full gap-1.5 h-9">
              <Send className="h-3.5 w-3.5" /> Post
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
type FeedTab = "all" | "following" | "events" | "q&a";

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [tab, setTab] = useState<FeedTab>("all");
  const [communities, setCommunities] = useState(COMMUNITIES);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"warn" } | null>(null);
  const [poll, setPoll] = useState<{ voted: number | null; counts: number[] }>({ voted: null, counts: [82, 18] });

  const notify = (msg: string, type: "success"|"warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const addPost = (body: string, imageSrc: string, flair: Flair | null) => {
    const np: Post = {
      id: `post_${Date.now()}`,
      authorName: user?.name ?? "You",
      authorUser: user?.name ?? "",
      dept: "Campus",
      timeAgo: "Just now",
      flair: flair ?? undefined,
      body,
      imageSrc: imageSrc || undefined,
      likes: 0, liked: false, bookmarked: false,
      comments: [],
    };
    setPosts(p => [np, ...p]);
    notify("Post published! 🎉");
  };

  const deletePost = (id: string) => { setPosts(p => p.filter(x => x.id !== id)); notify("Post deleted."); };
  const reportPost = (t: string) => notify(`"${t}" reported. Moderators will review.`, "warn");

  const toggleLike = (id: string) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 } : x));

  const toggleBookmark = (id: string) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, bookmarked: !x.bookmarked } : x));

  const likeComment = (postId: string, commentId: string) =>
    setPosts(p => p.map(post => post.id !== postId ? post : {
      ...post,
      comments: post.comments.map(c => c.id !== commentId ? c : { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }),
    }));

  const addComment = (postId: string, body: string) =>
    setPosts(p => p.map(post => post.id !== postId ? post : {
      ...post,
      comments: [...post.comments, {
        id: `c_${Date.now()}`, authorName: user?.name ?? "You",
        body, timeAgo: "Just now", likes: 0, liked: false,
      }],
    }));

  const joinCommunity = (name: string) => {
    setCommunities(cs => cs.map(c => c.name === name ? { ...c, joined: !c.joined } : c));
    const c = communities.find(c => c.name === name);
    notify(c?.joined ? `Left ${name}` : `Joined ${name}! 🎉`);
  };

  const votePoll = (idx: number) => {
    if (poll.voted !== null) return;
    setPoll(p => {
      const counts = [...p.counts];
      counts[idx]++;
      return { voted: idx, counts };
    });
    notify("Vote recorded!");
  };

  const filteredPosts = posts.filter(p => {
    if (tab === "events") return p.flair === "Event";
    if (tab === "q&a") return p.flair === "Question" || p.flair === "Study Help";
    return true;
  });

  const totalPollVotes = poll.counts.reduce((a, b) => a + b, 0);
  const pollOptions = ["Yes, absolutely!", "No, unnecessary"];

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      {toast && <ActionToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">Community & Social Hub</span>
        </div>
        <div className="flex gap-2">
          {(["all","following","events","q&a"] as FeedTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
                tab === t ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100")}>
              {t === "q&a" ? "Q&A" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left sidebar ─────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Communities */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-blue-600" />Communities</span>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors"><Plus className="h-4 w-4" /></button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1">
                {communities.map(({ icon: Icon, bg, ic, name, n, joined }) => (
                  <div key={name} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-none", bg)}>
                      <Icon className={cn("h-4 w-4", ic)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{name}</h4>
                      <p className="text-[10px] text-slate-400">{n} members</p>
                    </div>
                    <button onClick={() => joinCommunity(name)}
                      className={cn("text-[10px] font-bold px-2 py-1 rounded-full transition-all flex-none",
                        joined ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600" : "bg-blue-600 text-white hover:bg-blue-700")}>
                      {joined ? "Joined" : "Join"}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-orange-500" /> Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-1">
                  {TRENDING.map((tag, i) => (
                    <button key={tag} className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                      <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">{tag}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Meetup request */}
            <Card className="border-none shadow-sm bg-gradient-to-b from-orange-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">☕ Meetup Request</CardTitle>
                <p className="text-xs text-slate-500">Casual campus hangouts</p>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026701d" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Sneha J.</p>
                      <p className="text-[10px] text-slate-400">Architecture · 10m ago</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 mb-3">Anyone up for coffee at South Canteen? Need a break from studio work! ☕</p>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-7 text-xs font-bold" onClick={() => notify("Joined Sneha's meetup! ☕")}>Join</Button>
                    <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 h-7 text-xs font-bold">Skip</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Center feed ──────────────────────────────── */}
          <div className="lg:col-span-6 space-y-5">
            {/* Stories */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {STORIES.map(s => (
                <div key={s.name} className="flex flex-col items-center gap-1.5 flex-none cursor-pointer group">
                  <div className={cn("h-14 w-14 rounded-full ring-2 ring-offset-2 transition-transform group-hover:scale-105", s.ring)}>
                    <img src={s.src!} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center w-14 truncate">{s.name}</span>
                </div>
              ))}
            </div>

            {/* Compose */}
            <ComposeBox onPost={addPost} />

            {/* Feed */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-16 text-slate-400">
                    <PlusCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No posts here yet</p>
                    <p className="text-sm mt-1">Be the first to share something!</p>
                  </motion.div>
                ) : (
                  filteredPosts.map(post => (
                    <PostCard key={post.id} post={post}
                      onDelete={deletePost} onReport={reportPost}
                      onLike={toggleLike} onBookmark={toggleBookmark}
                      onLikeComment={likeComment} onAddComment={addComment} />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Founder Matchmaker */}
            <Card className="bg-slate-900 text-white border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-400" /> Founder Matchmaker
                </CardTitle>
                <p className="text-sm text-slate-400">Find co-founders and teammates for your next big idea</p>
              </CardHeader>
              <CardContent className="p-5 pt-2 relative z-10 space-y-3">
                {[
                  { badge: "LOOKING FOR: UI DESIGNER",  bc: "bg-blue-900/50 text-blue-300 border-blue-800",       title: "Fintech App for Students", founders: 2 },
                  { badge: "LOOKING FOR: BACKEND DEV",  bc: "bg-emerald-900/50 text-emerald-300 border-emerald-800", title: "Campus EV Rental System", founders: 1 },
                  { badge: "LOOKING FOR: ML ENGINEER",  bc: "bg-purple-900/50 text-purple-300 border-purple-800",   title: "AI Attendance System",    founders: 3 },
                ].map(f => (
                  <div key={f.title} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <Badge className={cn("mb-1.5 border", f.bc)}>{f.badge}</Badge>
                      <h4 className="font-bold text-white text-sm">{f.title}</h4>
                      <span className="text-xs text-slate-400">{f.founders} Founder{f.founders > 1 ? "s" : ""}</span>
                    </div>
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 font-bold" onClick={() => notify(`Request sent to ${f.title} team!`)}>Connect</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ── Right sidebar ─────────────────────────────  */}
          <div className="lg:col-span-3 space-y-5">
            {/* Upcoming Events */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-purple-600" /> Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {EVENTS.map(e => (
                  <div key={e.title} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className={cn("text-[10px] font-bold px-2 py-1 rounded-lg flex-none text-center leading-tight", e.color)}>
                      {e.date.split(",").map((part, i) => <div key={i}>{part.trim()}</div>)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{e.title}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5"><MapPin className="h-2.5 w-2.5" />{e.place}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs h-8 border-slate-200 font-semibold mt-1">View All Events</Button>
              </CardContent>
            </Card>

            {/* Anonymous Q&A */}
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50 rounded-t-xl">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><HelpCircle className="h-4 w-4 text-amber-500" />Anonymous Q&A</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-none text-[10px] animate-pulse">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { q: "What are the best electives in 5th sem for AI track?",    v: 42, replies: 5 },
                  { q: "Is it normal to feel lost in Data Structures? Help 😅",    v: 89, replies: 8 },
                  { q: "Any internship openings for 3rd year CS students?",        v: 56, replies: 12 },
                ].map(({ q, v, replies }) => (
                  <div key={q} className="space-y-2">
                    <p className="text-xs font-medium text-slate-800 leading-snug">"{q}"</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />{v}
                      </span>
                      <button className="text-xs font-semibold text-blue-600 hover:underline">{replies} Replies</button>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                  </div>
                ))}
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs h-8 font-bold" onClick={() => notify("Ask anonymously — feature coming soon!", "warn")}>
                  Ask Anonymously
                </Button>
              </CardContent>
            </Card>

            {/* Reputation leaders */}
            <Card className="border-none shadow-sm bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" />Reputation Leaders</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {[
                  { name: "Priya S.",  score: "14.2k", medal: "🥇" },
                  { name: "Rahul M.", score: "12.8k", medal: "🥈" },
                  { name: "Anita K.", score: "10.5k", medal: "🥉" },
                ].map((l, i) => (
                  <div key={l.name} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{l.medal}</span>
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-slate-200">{l.name[0]}</AvatarFallback></Avatar>
                      <span className="text-xs font-bold text-slate-900">{l.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{l.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Poll */}
            <Card className="border border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <Badge className="w-fit bg-red-50 text-red-600 border-none mb-2 hover:bg-red-50 text-xs">🗳 Active Poll</Badge>
                <CardTitle className="text-sm font-bold text-slate-900 leading-snug">Should the library be open 24/7 during finals week?</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2.5">
                {pollOptions.map((label, i) => {
                  const pct = Math.round((poll.counts[i] / totalPollVotes) * 100);
                  const voted = poll.voted === i;
                  return (
                    <button key={label} onClick={() => votePoll(i)} disabled={poll.voted !== null}
                      className={cn("w-full text-left rounded-xl overflow-hidden border transition-all",
                        voted ? "border-blue-400" : "border-slate-200 hover:border-slate-300",
                        poll.voted !== null ? "cursor-default" : "cursor-pointer")}>
                      <div className="relative px-3 py-2.5">
                        <div className={cn("absolute inset-0 transition-all", voted ? "bg-blue-100" : "bg-slate-50")}
                          style={{ width: poll.voted !== null ? `${pct}%` : "0%" }} />
                        <div className="relative flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-800">{label}</span>
                          {poll.voted !== null && <span className="text-xs font-bold text-blue-700">{pct}%</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <p className="text-[10px] text-slate-400 text-center">{totalPollVotes.toLocaleString()} votes · {poll.voted !== null ? "You voted" : "2 days left"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* tiny helper referenced from EVENTS */
function MapPin({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
