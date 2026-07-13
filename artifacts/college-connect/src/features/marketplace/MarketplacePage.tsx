import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BannerCarousel } from "@/components/shared/BannerCarousel";
import {
  Search, Plus, Heart, Share2, ShieldCheck, Flame, Tag,
  ArrowRight, ShoppingBag, Users, X, Image as ImageIcon,
  Phone, MapPin, Package, Trash2,
  Upload, Star, Camera, Edit2, UtensilsCrossed, Bike, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActionMenu, ActionToast } from "@/components/shared/ContentActions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  condition: string;
  description: string;
  photo: string;
  contact: string;
  location: string;
  sellerName: string;
  sellerUser: string;
  rep: string;
  postedAt: string;
}

interface Housing {
  id: string;
  title: string;
  price: string;
  type: string;
  desc: string;
  amenities: string[];
  verified: boolean;
  image: string;
  sellerUser: string;
}

interface RoommatePost {
  id: string;
  title: string;
  budget: string;
  location: string;
  desc: string;
  sellerName: string;
  sellerUser: string;
  postedAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  photo: string;
  description: string;
  address: string | null;
  contactNumber: string | null;
  googleMapsLink: string | null;
  cuisineTypes: string[];
  deliveryAvailable: boolean;
}

/* Buy/sell listings and housing listings are now loaded live from the
 * marketplace API (see fetchListings / listingToProduct / listingToHousing
 * below) instead of hardcoded seed data. Ad banners are also DB-backed —
 * see BannerCarousel — and are managed by moderators. */

/* ─── Live API types & helpers ───────────────────────────── */
interface ListingRow {
  id: number;
  title: string;
  description: string | null;
  price: number;
  priceUnit: string;
  category: string;
  listingType: "buy_sell" | "housing" | "service" | "roommate";
  imageUrl: string | null;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  location: string | null;
  condition: string | null;
  featured: boolean;
  createdAt: string;
}

async function fetchListings(): Promise<ListingRow[]> {
  const res = await fetch("/api/marketplace/listings");
  if (!res.ok) throw new Error("Failed to load listings");
  return res.json();
}

async function createListing(payload: Record<string, unknown>): Promise<ListingRow> {
  const res = await fetch("/api/marketplace/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return res.json();
}

async function deleteListing(id: number): Promise<void> {
  const res = await fetch(`/api/marketplace/listings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete listing");
}

interface LocalListingRow {
  id: number;
  name: string;
  photos: string;
  description: string | null;
  address: string | null;
  contactNumber: string | null;
  googleMapsLink: string | null;
  metadata: string;
}

async function fetchRestaurants(): Promise<LocalListingRow[]> {
  const res = await fetch("/api/marketplace/restaurants");
  if (!res.ok) throw new Error("Failed to load restaurants");
  return res.json();
}

function listingToRoommate(l: ListingRow): RoommatePost {
  return {
    id: String(l.id),
    title: l.title,
    budget: `₹${l.price.toLocaleString("en-IN")}${l.priceUnit || "/mo"}`,
    location: l.location ?? "Campus area",
    desc: l.description ?? "",
    sellerName: l.sellerName,
    sellerUser: l.sellerName,
    postedAt: new Date(l.createdAt).toLocaleDateString(),
  };
}

function localListingToRestaurant(l: LocalListingRow): Restaurant {
  let meta: Record<string, unknown> = {};
  try { meta = JSON.parse(l.metadata || "{}"); } catch { /* ignore malformed metadata */ }
  let photos: string[] = [];
  try { photos = JSON.parse(l.photos || "[]"); } catch { /* ignore malformed photos */ }
  const cuisineTypes = Array.isArray(meta.cuisineTypes)
    ? (meta.cuisineTypes as string[])
    : (meta.cuisineType ? [String(meta.cuisineType)] : []);
  return {
    id: String(l.id),
    name: l.name,
    photo: photos[0] || CAT_IMAGES.OTHER,
    description: l.description ?? "",
    address: l.address,
    contactNumber: l.contactNumber,
    googleMapsLink: l.googleMapsLink,
    cuisineTypes,
    deliveryAvailable: !!meta.deliveryAvailable,
  };
}

function listingToProduct(l: ListingRow): Product {
  return {
    id: String(l.id),
    title: l.title,
    price: `₹${l.price.toLocaleString("en-IN")}`,
    category: l.category,
    condition: l.condition ?? "Good",
    description: l.description ?? "",
    photo: l.imageUrl ?? CAT_IMAGES[l.category] ?? CAT_IMAGES.OTHER,
    contact: `Contact: ${l.sellerName}`,
    location: l.location ?? "Campus",
    sellerName: l.sellerName,
    sellerUser: l.sellerName,
    rep: l.sellerRating.toFixed(1),
    postedAt: new Date(l.createdAt).toLocaleDateString(),
  };
}

function listingToHousing(l: ListingRow): Housing {
  return {
    id: String(l.id),
    title: l.title,
    price: `₹${l.price.toLocaleString("en-IN")}${l.priceUnit}`,
    type: l.category,
    desc: l.description ?? "",
    amenities: [],
    verified: l.sellerVerified,
    image: l.imageUrl ?? CAT_IMAGES.OTHER,
    sellerUser: l.sellerName,
  };
}

const CATS = ["ELECTRONICS", "LAPTOPS", "TEXTBOOKS", "SUPPLIES", "CLOTHING", "FURNITURE", "CYCLES", "SPORTS", "OTHER"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "For Parts"];
const CAT_IMAGES: Record<string, string> = {
  ELECTRONICS: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
  LAPTOPS:     "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
  TEXTBOOKS:   "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  SUPPLIES:    "https://images.unsplash.com/photo-1585675100414-22b04fbb3530?w=600&q=80",
  CLOTHING:    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
  FURNITURE:   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  CYCLES:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  SPORTS:      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
  OTHER:       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
};

/* ─── Sell Listing Modal ─────────────────────────────────── */
function SellListingModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Product) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", price: "", category: "ELECTRONICS", condition: "Good",
    description: "", photo: "", contact: "", location: "",
  });
  const s = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim() && form.price.trim() && form.description.trim();

  const submit = () => {
    onAdd({
      id: `p_${Date.now()}`,
      title: form.title,
      price: form.price.startsWith("₹") ? form.price : `₹${form.price}`,
      category: form.category,
      condition: form.condition,
      description: form.description,
      photo: form.photo || CAT_IMAGES[form.category] || CAT_IMAGES.OTHER,
      contact: form.contact || "Contact via CollegeConnect",
      location: form.location || "On Campus",
      sellerName: user?.name ?? "You",
      sellerUser: user?.name ?? "",
      rep: "5.0",
      postedAt: "Just now",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative w-full max-w-xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Sell an Item</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in the details so buyers know what you're selling</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5">

          {/* Photo */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Camera className="inline h-4 w-4 mr-1 text-blue-500" />Item Photo URL
              <span className="text-slate-400 font-normal ml-1">(optional — paste any image link)</span>
            </label>
            {form.photo && (
              <div className="relative mb-2 rounded-xl overflow-hidden h-36 bg-slate-100">
                <img src={form.photo} alt="preview" className="w-full h-full object-cover" onError={() => s("photo", "")} />
                <button onClick={() => s("photo", "")} className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white rounded-full p-1 transition-colors"><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-10 pl-9 bg-slate-50" placeholder="https://... (Unsplash, Google Photos, etc.)"
                value={form.photo} onChange={e => s("photo", e.target.value)} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Item Name *</label>
            <Input className="h-10 bg-slate-50" placeholder="e.g. Sony WH-1000XM4 Headphones"
              value={form.title} onChange={e => s("title", e.target.value)} />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Selling Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₹</span>
                <Input className="h-10 pl-6 bg-slate-50" placeholder="1,200"
                  value={form.price} onChange={e => s("price", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select value={form.category} onChange={e => s("category", e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Package className="inline h-4 w-4 mr-1 text-blue-500" />Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => s("condition", c)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    form.condition === c
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
            <textarea rows={3}
              className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Describe the item — age, usage, defects, what's included, why selling…"
              value={form.description} onChange={e => s("description", e.target.value)} />
          </div>

          {/* Contact + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Phone className="inline h-3.5 w-3.5 mr-1 text-blue-500" />Contact Info
              </label>
              <Input className="h-10 bg-slate-50" placeholder="WhatsApp number or email"
                value={form.contact} onChange={e => s("contact", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <MapPin className="inline h-3.5 w-3.5 mr-1 text-blue-500" />Pickup Location
              </label>
              <Input className="h-10 bg-slate-50" placeholder="e.g. A-Block Hostel"
                value={form.location} onChange={e => s("location", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 flex gap-3 items-center">
          <Button variant="outline" className="px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-bold" disabled={!valid} onClick={submit}>
            <Upload className="h-4 w-4 mr-2" /> Post Listing
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Roommate Ad Modal ──────────────────────────────────── */
function RoommateModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: { title: string; budget: string; location: string; desc: string }) => void }) {
  const [form, setForm] = useState({ postType: "Looking for a Roommate", budget: "", location: "", desc: "" });
  const s = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.budget.trim() && form.location.trim() && form.desc.trim();

  const submit = () => {
    onAdd({
      title: form.postType,
      budget: form.budget,
      location: form.location,
      desc: form.desc,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative w-full max-w-xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}>

        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Post a Roommate Ad</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tell other students what you're looking for</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Post Type</label>
            <div className="flex flex-wrap gap-2">
              {["Looking for a Roommate", "Have a Spare Room"].map(t => (
                <button key={t} onClick={() => s("postType", t)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    form.postType === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Budget *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₹</span>
                <Input className="h-10 pl-6 bg-slate-50" placeholder="6,000/mo"
                  value={form.budget} onChange={e => s("budget", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <MapPin className="inline h-3.5 w-3.5 mr-1 text-blue-500" />Preferred Area *
              </label>
              <Input className="h-10 bg-slate-50" placeholder="e.g. Near North Campus"
                value={form.location} onChange={e => s("location", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">About You & What You're Looking For *</label>
            <textarea rows={4}
              className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Major, lifestyle (early bird / night owl), habits, move-in date, gender preference, contact info…"
              value={form.desc} onChange={e => s("desc", e.target.value)} />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-slate-100 flex gap-3 items-center">
          <Button variant="outline" className="px-5 h-11" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-bold" disabled={!valid} onClick={submit}>
            <Upload className="h-4 w-4 mr-2" /> Post Ad
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Restaurant Card ────────────────────────────────────── */
function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <img src={restaurant.photo} alt={restaurant.name} className="w-full h-full object-cover" />
        {restaurant.deliveryAvailable && (
          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white border-none font-bold text-[10px]">
            <Bike className="h-3 w-3 mr-1" /> Delivery Available
          </Badge>
        )}
      </div>
      <CardContent className="p-5 flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{restaurant.name}</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {restaurant.cuisineTypes.map(c => (
            <Badge key={c} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 text-[10px] font-semibold">{c}</Badge>
          ))}
        </div>
        {restaurant.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{restaurant.description}</p>}
        {restaurant.address && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="h-3 w-3 flex-none" /><span>{restaurant.address}</span>
          </div>
        )}
        {restaurant.contactNumber && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="h-3 w-3 flex-none" /><span>{restaurant.contactNumber}</span>
          </div>
        )}
      </CardContent>
      {restaurant.googleMapsLink && (
        <CardFooter className="p-4 pt-0">
          <a href={restaurant.googleMapsLink} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="w-full h-9 border-slate-200 text-slate-700 text-sm">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View on Maps
            </Button>
          </a>
        </CardFooter>
      )}
    </Card>
  );
}

/* ─── Product Card ───────────────────────────────────────── */
function ProductCard({ product, isMod, onDelete, onReport }: {
  product: Product; isMod: boolean;
  onDelete: () => void; onReport: () => void;
}) {
  const { user } = useAuth();
  const isOwner = product.sellerUser === user?.name;
  const [contactOpen, setContactOpen] = useState(false);

  const COND_COLOR: Record<string, string> = {
    "New":      "bg-emerald-100 text-emerald-700",
    "Like New": "bg-green-100 text-green-700",
    "Good":     "bg-blue-100 text-blue-700",
    "Fair":     "bg-amber-100 text-amber-700",
    "For Parts":"bg-red-100 text-red-700",
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
      {isOwner && (
        <span className="absolute top-3 left-3 z-10 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">YOUR LISTING</span>
      )}
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <img src={product.photo} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <Badge className="absolute top-3 right-10 bg-black/70 text-white border-none backdrop-blur-md font-bold text-[10px]">{product.category}</Badge>
        <div className="absolute top-2 right-2 z-10">
          <ActionMenu title={product.title} isOwner={isOwner} isModerator={isMod} onDelete={onDelete} onReport={onReport} />
        </div>
        <Button variant="ghost" size="icon" className="absolute bottom-3 right-3 bg-white/80 hover:bg-white text-slate-700 rounded-full h-8 w-8 backdrop-blur-sm">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{product.title}</h3>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-none mt-0.5", COND_COLOR[product.condition] ?? "bg-slate-100 text-slate-600")}>{product.condition}</span>
        </div>
        <p className="text-2xl font-black text-blue-600 mb-2">{product.price}</p>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <MapPin className="h-3 w-3 flex-none" /><span>{product.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5"><AvatarFallback className="bg-slate-200 text-[10px]">{product.sellerName[0]}</AvatarFallback></Avatar>
            <span className="text-xs font-medium text-slate-600">{product.sellerName}</span>
            <span className="text-[10px] text-amber-600 font-bold">★ {product.rep}</span>
          </div>
          <span className="text-[10px] text-slate-400">{product.postedAt}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {isOwner ? (
          <Button className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white text-sm" onClick={onDelete}>Delete Listing</Button>
        ) : (
          <Button className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 text-white text-sm" onClick={() => setContactOpen(v => !v)}>
            {contactOpen ? "Hide Contact" : "Contact Seller"}
          </Button>
        )}
        <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 text-slate-600"><Share2 className="h-4 w-4" /></Button>
      </CardFooter>
      <AnimatePresence>
        {contactOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 overflow-hidden">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
              <p className="font-semibold text-slate-800 mb-0.5">{product.sellerName}</p>
              <p className="text-blue-700 font-medium">{product.contact}</p>
              <p className="text-xs text-slate-500 mt-1">📍 Meetup at: {product.location}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
/** Maps a banner's linkType to the Marketplace tab it should open. */
const LINK_TYPE_TO_TAB: Record<string, string> = {
  restaurant: "restaurants",
  pg: "housing",
  local_service: "services",
};

export default function Marketplace() {
  const { user } = useAuth();
  const isMod   = user?.role === "low_admin" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const search_ = useSearch();
  const initialTab = new URLSearchParams(search_).get("tab");

  const queryClient = useQueryClient();
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: restaurantRows = [], isLoading: restaurantsLoading } = useQuery({ queryKey: ["restaurants"], queryFn: fetchRestaurants });

  const products = listings.filter(l => l.listingType === "buy_sell").map(listingToProduct);
  const housing  = listings.filter(l => l.listingType === "housing").map(listingToHousing);
  const roommatePosts = listings.filter(l => l.listingType === "roommate").map(listingToRoommate);
  const restaurants = restaurantRows.map(localListingToRestaurant);

  const [showForm, setShowForm]   = useState(false);
  const [showRoommateForm, setShowRoommateForm] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || "buy-sell");
  const [search,   setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "warn" } | null>(null);

  const notify = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listings"] }),
  });

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col">
      {toast && <ActionToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Sticky header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-none">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Marketplace</span>
          </div>
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search items, textbooks, services…" className="pl-9 bg-slate-50 w-full"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {user ? (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex-none"
              onClick={() => activeTab === "roommate" ? setShowRoommateForm(true) : setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> {activeTab === "roommate" ? "Post Roommate Ad" : "Sell Item"}
            </Button>
          ) : (
            <Button variant="outline" className="flex-none" onClick={() => notify("Please log in to post a listing.", "warn")}>
              <Plus className="mr-2 h-4 w-4" /> {activeTab === "roommate" ? "Post Roommate Ad" : "Sell Item"}
            </Button>
          )}
        </div>
      </header>

      <div className="p-8">
        {/* Ad banner carousel — moderator-managed, see Moderator → Ad Banners */}
        <BannerCarousel
          placement="marketplace"
          onBannerClick={(linkType) => {
            const tab = LINK_TYPE_TO_TAB[linkType];
            if (tab) setActiveTab(tab);
          }}
        />

        {/* Sell listing modal */}
        <AnimatePresence>
          {showForm && (
            <SellListingModal
              key="sell-modal"
              onClose={() => setShowForm(false)}
              onAdd={(p) => {
                createMutation.mutate({
                  title: p.title,
                  description: p.description,
                  price: Number(p.price.replace(/[^0-9.]/g, "")) || 0,
                  priceUnit: "",
                  category: p.category,
                  listingType: "buy_sell",
                  imageUrl: p.photo,
                  sellerName: user?.name ?? "You",
                  location: p.location,
                  condition: p.condition,
                });
                notify("🎉 Your listing is live!");
              }}
            />
          )}
        </AnimatePresence>

        {/* Roommate ad modal */}
        <AnimatePresence>
          {showRoommateForm && (
            <RoommateModal
              key="roommate-modal"
              onClose={() => setShowRoommateForm(false)}
              onAdd={(p) => {
                createMutation.mutate({
                  title: p.title,
                  description: p.desc,
                  price: Number(p.budget.replace(/[^0-9.]/g, "")) || 0,
                  priceUnit: "/mo",
                  category: "ROOMMATE",
                  listingType: "roommate",
                  sellerName: user?.name ?? "You",
                  location: p.location,
                });
                notify("🎉 Your roommate ad is live!");
              }}
            />
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-lg mb-6">
            <TabsTrigger value="buy-sell" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">
              Buy / Sell Items
            </TabsTrigger>
            <TabsTrigger value="housing" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">
              Housing
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="roommate" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">
              Roommate Finder
            </TabsTrigger>
            <TabsTrigger value="services" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">
              Local Services
            </TabsTrigger>
          </TabsList>

          {/* ── Buy/Sell ── */}
          <TabsContent value="buy-sell">
            {/* Category filter pills */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["ALL", ...CATS].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-full border transition-all",
                    filterCat === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                  )}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">No listings found</p>
                    <p className="text-sm mt-1">Try a different search or category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {filteredProducts.map(product => (
                        <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                          <ProductCard
                            product={product}
                            isMod={isMod}
                            onDelete={() => { deleteMutation.mutate(Number(product.id)); notify("Listing deleted."); }}
                            onReport={() => notify(`"${product.title}" reported. Mods will review.`, "warn")}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <Sidebar onSell={() => setShowForm(true)} onFindRoommate={() => setActiveTab("roommate")} roommateCount={roommatePosts.length} />
            </div>
          </TabsContent>

          {/* ── Housing ── */}
          <TabsContent value="housing">
            <div className="mt-2 space-y-6">
              <AnimatePresence>
                {housing.map((house) => {
                  const isOwner = house.sellerUser === user?.name;
                  return (
                    <motion.div key={house.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card className="overflow-hidden border-slate-200 shadow-sm flex flex-col md:flex-row">
                        <div className="md:w-2/5 h-64 md:h-auto bg-slate-100 relative">
                          <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
                          <Badge className="absolute top-3 left-3 bg-indigo-600 text-white border-none font-bold">HOUSING</Badge>
                        </div>
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 text-xl md:text-2xl leading-tight flex-1">{house.title}</h3>
                            <div className="flex items-center gap-2 ml-4">
                              <p className="text-2xl font-black text-blue-600 whitespace-nowrap">{house.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                              <ActionMenu title={house.title} isOwner={isOwner} isModerator={isMod}
                                onDelete={() => { deleteMutation.mutate(Number(house.id)); notify("Housing listing deleted."); }}
                                onReport={() => notify(`"${house.title}" reported.`, "warn")} />
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm mb-4 flex-1">{house.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {house.amenities.map((a, i) => <Badge key={i} variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 font-medium">{a}</Badge>)}
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
                              <ShieldCheck className="h-4 w-4 mr-1" /> Estate Verified
                            </Badge>
                            {isOwner
                              ? <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => { deleteMutation.mutate(Number(house.id)); notify("Deleted."); }}>Delete Listing</Button>
                              : <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Book Visit</Button>}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {housing.length === 0 && <div className="text-center py-20 text-slate-400">No housing listings available.</div>}
            </div>
          </TabsContent>

          {/* ── Restaurants ── */}
          <TabsContent value="restaurants">
            {restaurantsLoading ? (
              <div className="text-center py-20 text-slate-400">Loading restaurants…</div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No restaurants listed yet</p>
                <p className="text-sm mt-1">Approved campus-area restaurants will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            )}
          </TabsContent>

          {/* ── Roommate Finder ── */}
          <TabsContent value="roommate">
            <div className="mt-2 space-y-4">
              <AnimatePresence>
                {roommatePosts.map((post) => {
                  const isOwner = post.sellerUser === user?.name;
                  return (
                    <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card className="overflow-hidden border-slate-200 shadow-sm">
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-start gap-4">
                          <Avatar className="h-12 w-12 border border-slate-200 flex-none">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{post.sellerName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <div>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-1.5 font-bold text-[10px]">{post.title.toUpperCase()}</Badge>
                                <p className="font-bold text-slate-900">{post.sellerName}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-blue-600 whitespace-nowrap">{post.budget}</p>
                                {isOwner && (
                                  <button onClick={() => { deleteMutation.mutate(Number(post.id)); notify("Roommate ad removed."); }}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{post.desc}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 flex-none" /><span>{post.location}</span>
                              <span className="text-slate-300 mx-1">•</span><span>{post.postedAt}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {roommatePosts.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">No roommate ads yet</p>
                  <p className="text-sm mt-1">Be the first to post one!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="text-center py-20 text-slate-400">Local services coming soon.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────── */
function Sidebar({ onSell, onFindRoommate, roommateCount }: { onSell: () => void; onFindRoommate: () => void; roommateCount: number }) {
  return (
    <div className="w-full lg:w-80 space-y-6">
      {/* Quick sell CTA */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg overflow-hidden relative">
        <div className="absolute -right-6 -bottom-6 opacity-10"><ShoppingBag className="h-32 w-32" /></div>
        <CardContent className="p-6 relative">
          <h3 className="text-lg font-extrabold mb-1">Have something to sell?</h3>
          <p className="text-blue-100 text-sm mb-4">Post in 30 seconds — add photos, price, condition and connect with buyers.</p>
          <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold w-full" onClick={onSell}>
            <Plus className="mr-2 h-4 w-4" /> Post Free Ad
          </Button>
        </CardContent>
      </Card>

      {/* Roommate finder */}
      <Card className="bg-slate-900 text-white border-none shadow-lg cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={onFindRoommate}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Users className="h-6 w-6 text-blue-400" /></div>
            <h3 className="text-lg font-bold">Roommate Finder</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            {roommateCount > 0
              ? `${roommateCount} roommate ${roommateCount === 1 ? "ad" : "ads"} posted by students right now.`
              : "Post an ad or browse students looking for roommates near campus."}
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold" onClick={onFindRoommate}>
            Open Roommate Finder <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Flash discounts */}
      <Card className="border-red-100 border-2 bg-gradient-to-b from-white to-red-50/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Tag className="h-24 w-24 text-red-500" /></div>
        <CardHeader className="pb-2">
          <Badge className="w-fit bg-red-100 text-red-700 hover:bg-red-100 border-none mb-2 text-xs font-bold px-2 py-0.5 animate-pulse">ENDING SOON</Badge>
          <CardTitle className="text-lg font-bold text-slate-900">Flash Discounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[["50%","Campus Cafe","On all iced beverages"],["25%","Tech Repairs Hub","Screen replacements"]].map(([p, n, d]) => (
            <div key={n} className="flex gap-3 items-center">
              <div className="h-12 w-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-800">{p}</div>
              <div><p className="text-sm font-bold text-slate-900">{n}</p><p className="text-xs text-slate-500">{d}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending tags */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {["#calculus","#hostel","#macbook","#miniproject","#tutor","#tickets","#cycles"].map(tag => (
            <Badge key={tag} variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer px-3 py-1">{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
