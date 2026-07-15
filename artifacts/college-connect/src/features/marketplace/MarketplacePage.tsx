import { useState, useRef, useCallback } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BannerCarousel } from "@/components/shared/BannerCarousel";
import {
  Search, Plus, Heart, Share2, ShieldCheck, Tag,
  ArrowRight, ShoppingBag, Users, X, Image as ImageIcon,
  Phone, MapPin, Package, Trash2, Upload, Star,
  UtensilsCrossed, Bike, ExternalLink, Mail, AtSign,
  BadgeCheck, ChevronLeft, ChevronRight, MenuSquare, Eye,
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

/* ─── Utility ────────────────────────────────────────────────────────── */
function extractRollNo(email: string): string {
  return email.split("@")[0] ?? "";
}

/* ─── Types ───────────────────────────────────────────────────────────── */
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
  sellerRollNo: string;
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
  sellerName: string;
  contact: string;
  location: string;
  postedAt: string;
}

interface RoommatePost {
  id: string;
  title: string;
  budget: string;
  location: string;
  desc: string;
  sellerName: string;
  sellerUser: string;
  sellerRollNo: string;
  contactPhone: string;
  contactEmail: string;
  contactInstagram: string;
  postedAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  photo: string;
  photos: string[];
  menuPhotos: string[];
  description: string;
  address: string | null;
  contactNumber: string | null;
  googleMapsLink: string | null;
  cuisineTypes: string[];
  deliveryAvailable: boolean;
}

/* ─── Live API types ───────────────────────────────────────── */
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
  sellerRollNo: string | null;
  contact: string | null;
  location: string | null;
  condition: string | null;
  featured: boolean;
  createdAt: string;
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

async function fetchListings(): Promise<ListingRow[]> {
  const res = await fetch("/api/marketplace/listings");
  if (!res.ok) throw new Error("Failed to load listings");
  return res.json();
}
async function createListing(payload: Record<string, unknown>): Promise<ListingRow> {
  const res = await fetch("/api/marketplace/listings", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return res.json();
}
async function deleteListing(id: number): Promise<void> {
  const res = await fetch(`/api/marketplace/listings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete listing");
}
async function fetchRestaurants(): Promise<LocalListingRow[]> {
  const res = await fetch("/api/marketplace/restaurants");
  if (!res.ok) throw new Error("Failed to load restaurants");
  return res.json();
}

/* ─── Data mappers ─────────────────────────────────────────── */
const CATS = ["ELECTRONICS","LAPTOPS","TEXTBOOKS","SUPPLIES","CLOTHING","FURNITURE","CYCLES","SPORTS","OTHER"];
const CONDITIONS = ["New","Like New","Good","Fair","For Parts"];
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

function listingToProduct(l: ListingRow): Product {
  let contact = "";
  try { const c = JSON.parse(l.contact ?? "{}"); contact = [c.phone, c.email, c.instagram].filter(Boolean).join(" · "); } catch { contact = l.contact ?? ""; }
  return {
    id: String(l.id), title: l.title,
    price: `₹${l.price.toLocaleString("en-IN")}`,
    category: l.category, condition: l.condition ?? "Good",
    description: l.description ?? "",
    photo: l.imageUrl ?? CAT_IMAGES[l.category] ?? CAT_IMAGES.OTHER,
    contact, location: l.location ?? "Campus",
    sellerName: l.sellerName, sellerUser: l.sellerName,
    sellerRollNo: l.sellerRollNo ?? "",
    rep: l.sellerRating.toFixed(1),
    postedAt: new Date(l.createdAt).toLocaleDateString(),
  };
}

function listingToHousing(l: ListingRow): Housing {
  let contact = "";
  try { const c = JSON.parse(l.contact ?? "{}"); contact = [c.phone, c.email].filter(Boolean).join(" · "); } catch { contact = l.contact ?? ""; }
  return {
    id: String(l.id), title: l.title,
    price: `₹${l.price.toLocaleString("en-IN")}${l.priceUnit}`,
    type: l.category, desc: l.description ?? "", amenities: [],
    verified: l.sellerVerified,
    image: l.imageUrl ?? CAT_IMAGES.OTHER,
    sellerUser: l.sellerName, sellerName: l.sellerName,
    contact, location: l.location ?? "Campus",
    postedAt: new Date(l.createdAt).toLocaleDateString(),
  };
}

function listingToRoommate(l: ListingRow): RoommatePost {
  let phone = "", email = "", instagram = "";
  try { const c = JSON.parse(l.contact ?? "{}"); phone = c.phone ?? ""; email = c.email ?? ""; instagram = c.instagram ?? ""; } catch {}
  return {
    id: String(l.id), title: l.title,
    budget: `₹${l.price.toLocaleString("en-IN")}${l.priceUnit || "/mo"}`,
    location: l.location ?? "Campus area", desc: l.description ?? "",
    sellerName: l.sellerName, sellerUser: l.sellerName,
    sellerRollNo: l.sellerRollNo ?? "",
    contactPhone: phone, contactEmail: email, contactInstagram: instagram,
    postedAt: new Date(l.createdAt).toLocaleDateString(),
  };
}

function localListingToRestaurant(l: LocalListingRow): Restaurant {
  let meta: Record<string, unknown> = {};
  try { meta = JSON.parse(l.metadata || "{}"); } catch {}
  let photos: string[] = [];
  try { photos = JSON.parse(l.photos || "[]"); } catch {}
  const menuPhotos: string[] = Array.isArray(meta.menuPhotos) ? (meta.menuPhotos as string[]) : [];
  const cuisineTypes = Array.isArray(meta.cuisineTypes)
    ? (meta.cuisineTypes as string[])
    : (meta.cuisineType ? [String(meta.cuisineType)] : []);
  return {
    id: String(l.id), name: l.name,
    photo: photos[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    photos, menuPhotos,
    description: l.description ?? "",
    address: l.address, contactNumber: l.contactNumber,
    googleMapsLink: l.googleMapsLink, cuisineTypes,
    deliveryAvailable: !!meta.deliveryAvailable,
  };
}

/* ─── DragDropPhoto ───────────────────────────────────────── */
function DragDropPhoto({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onChange((e.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        <ImageIcon className="inline h-4 w-4 mr-1 text-blue-500" />Item Photo
      </label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden h-36 bg-slate-100 mb-2">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
          )}
        >
          <Upload className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">Drag & drop a photo here</p>
          <p className="text-xs text-slate-400 mt-0.5">or click to browse</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInput} />
        </div>
      )}
    </div>
  );
}

/* ─── ListingDetailModal ──────────────────────────────────── */
type DetailPayload =
  | { kind: "product";   data: Product }
  | { kind: "housing";   data: Housing }
  | { kind: "roommate";  data: RoommatePost }
  | { kind: "restaurant"; data: Restaurant }
  | { kind: "service";   data: Restaurant };

function ListingDetailModal({ payload, onClose }: { payload: DetailPayload; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [menuIdx, setMenuIdx] = useState(0);
  const [tab, setTab] = useState<"info" | "menu">("info");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-lg sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md text-slate-500 hover:text-slate-900 transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto flex-1">

          {/* ── PRODUCT ── */}
          {payload.kind === "product" && (() => {
            const p = payload.data;
            return (
              <>
                <div className="h-60 bg-slate-200 relative overflow-hidden">
                  <img src={p.photo} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-12">
                    <p className="text-2xl font-black text-white">{p.price}</p>
                    <p className="text-white/80 text-sm font-medium">{p.title}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold">{p.category}</Badge>
                    <Badge className={cn("font-bold border",
                      p.condition === "New" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      p.condition === "Like New" ? "bg-green-50 text-green-700 border-green-200" :
                      p.condition === "Good" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>{p.condition}</Badge>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 mb-1">{p.title}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed">{p.description}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Seller Info</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-200 text-blue-800 text-xs font-bold">{p.sellerName[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.sellerName}</p>
                        {p.sellerRollNo && <p className="text-xs text-blue-600 font-semibold">Roll No: {p.sellerRollNo}</p>}
                      </div>
                      <span className="ml-auto text-xs text-amber-600 font-bold">★ {p.rep}</span>
                    </div>
                    {p.contact && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium mt-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />{p.contact}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="h-3 w-3" />{p.location} · Posted {p.postedAt}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* ── HOUSING ── */}
          {payload.kind === "housing" && (() => {
            const h = payload.data;
            return (
              <>
                <div className="h-52 bg-slate-200 relative overflow-hidden">
                  <img src={h.image} alt={h.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-12">
                    <p className="text-2xl font-black text-white">{h.price}<span className="text-sm font-normal">/mo</span></p>
                    <p className="text-white/80 text-sm">{h.title}</p>
                  </div>
                  {h.verified && (
                    <Badge className="absolute top-3 left-3 bg-emerald-600 text-white border-none font-bold">
                      <ShieldCheck className="h-3 w-3 mr-1" />Verified
                    </Badge>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">{h.type}</Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">{h.desc}</p>
                  {h.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {h.amenities.map(a => <Badge key={a} variant="outline" className="text-slate-600">{a}</Badge>)}
                    </div>
                  )}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Owner / Agent</p>
                    <p className="text-sm font-bold text-slate-900">{h.sellerName}</p>
                    {h.contact && <p className="text-sm text-slate-700"><Phone className="inline h-3.5 w-3.5 mr-1 text-slate-400" />{h.contact}</p>}
                    <p className="text-xs text-slate-400"><MapPin className="inline h-3 w-3 mr-1" />{h.location} · Posted {h.postedAt}</p>
                  </div>
                </div>
              </>
            );
          })()}

          {/* ── ROOMMATE ── */}
          {payload.kind === "roommate" && (() => {
            const r = payload.data;
            return (
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow">
                    {r.sellerName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-1 text-[10px] font-bold">{r.title.toUpperCase()}</Badge>
                    <h2 className="text-xl font-extrabold text-slate-900">{r.sellerName}</h2>
                    {r.sellerRollNo && (
                      <p className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" />Roll No: {r.sellerRollNo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Budget</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{r.budget}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Area</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{r.location}</p>
                  </div>
                </div>

                {r.desc && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">About</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
                  </div>
                )}

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
                  <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Contact</p>
                  {r.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-indigo-400 flex-none" />
                      <span className="font-semibold text-slate-800">{r.contactPhone}</span>
                    </div>
                  )}
                  {r.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-indigo-400 flex-none" />
                      <span className="font-semibold text-slate-800">{r.contactEmail}</span>
                    </div>
                  )}
                  {r.contactInstagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-4 w-4 text-indigo-400 flex-none" />
                      <span className="font-semibold text-slate-800">{r.contactInstagram}</span>
                    </div>
                  )}
                  {!r.contactPhone && !r.contactEmail && !r.contactInstagram && (
                    <p className="text-xs text-indigo-600 italic">No contact info provided.</p>
                  )}
                </div>

                <p className="text-xs text-slate-400 text-right">Posted {r.postedAt}</p>
              </div>
            );
          })()}

          {/* ── RESTAURANT / SERVICE ── */}
          {(payload.kind === "restaurant" || payload.kind === "service") && (() => {
            const r = payload.data;
            const isRestaurant = payload.kind === "restaurant";
            const allPhotos = r.photos.length > 0 ? r.photos : [r.photo];
            const hasMenu = r.menuPhotos.length > 0;

            return (
              <>
                {/* Photo gallery */}
                <div className="h-56 bg-slate-200 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img key={photoIdx} src={allPhotos[photoIdx] ?? r.photo}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full h-full object-cover" />
                  </AnimatePresence>
                  {allPhotos.length > 1 && (
                    <>
                      <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 backdrop-blur-sm">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 backdrop-blur-sm">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                        {allPhotos.map((_, i) => (
                          <button key={i} onClick={() => setPhotoIdx(i)}
                            className={cn("h-1.5 rounded-full transition-all", i === photoIdx ? "w-4 bg-white" : "w-1.5 bg-white/50")} />
                        ))}
                      </div>
                    </>
                  )}
                  {isRestaurant && r.deliveryAvailable && (
                    <Badge className="absolute top-3 left-3 bg-emerald-600 text-white border-none font-bold text-[10px]">
                      <Bike className="h-3 w-3 mr-1" />Delivery Available
                    </Badge>
                  )}
                </div>

                {/* Tab switcher if menu exists */}
                {isRestaurant && hasMenu && (
                  <div className="flex border-b border-slate-100">
                    {(["info", "menu"] as const).map(t => (
                      <button key={t} onClick={() => setTab(t)}
                        className={cn("flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5",
                          tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700")}>
                        {t === "info" ? <><Eye className="h-3.5 w-3.5" />Info</> : <><MenuSquare className="h-3.5 w-3.5" />Menu</>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Info tab */}
                {(!isRestaurant || tab === "info") && (
                  <div className="p-6 space-y-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 mb-2">{r.name}</h2>
                      {isRestaurant && r.cuisineTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {r.cuisineTypes.map(c => (
                            <Badge key={c} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 text-[10px] font-semibold">{c}</Badge>
                          ))}
                        </div>
                      )}
                      {r.description && <p className="text-sm text-slate-600 leading-relaxed">{r.description}</p>}
                    </div>
                    <div className="space-y-2">
                      {r.address && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-none" /><span>{r.address}</span>
                        </div>
                      )}
                      {r.contactNumber && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400 flex-none" /><span>{r.contactNumber}</span>
                        </div>
                      )}
                    </div>
                    {r.googleMapsLink && (
                      <a href={r.googleMapsLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full border-slate-200 text-slate-700">
                          <ExternalLink className="h-4 w-4 mr-2" />View on Google Maps
                        </Button>
                      </a>
                    )}
                  </div>
                )}

                {/* Menu tab */}
                {isRestaurant && tab === "menu" && hasMenu && (
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Menu Photos ({r.menuPhotos.length})</p>
                    <div className="relative">
                      <img src={r.menuPhotos[menuIdx]} alt={`Menu ${menuIdx + 1}`}
                        className="w-full rounded-xl object-contain max-h-80 bg-slate-50" />
                      {r.menuPhotos.length > 1 && (
                        <div className="flex items-center justify-between mt-3">
                          <button onClick={() => setMenuIdx(i => (i - 1 + r.menuPhotos.length) % r.menuPhotos.length)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600">
                            <ChevronLeft className="h-4 w-4" />Prev
                          </button>
                          <span className="text-xs text-slate-400">{menuIdx + 1} / {r.menuPhotos.length}</span>
                          <button onClick={() => setMenuIdx(i => (i + 1) % r.menuPhotos.length)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600">
                            Next<ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {r.menuPhotos.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {r.menuPhotos.map((src, i) => (
                          <button key={i} onClick={() => setMenuIdx(i)}
                            className={cn("flex-none h-16 w-16 rounded-lg overflow-hidden border-2 transition-all",
                              i === menuIdx ? "border-blue-500" : "border-transparent opacity-60")}>
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isRestaurant && !hasMenu && tab === "menu" && (
                  <div className="p-6 text-center text-slate-400">
                    <MenuSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No menu photos uploaded yet.</p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Sell Listing Modal ─────────────────────────────────── */
function SellListingModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Omit<Product, "id">) => void }) {
  const { user } = useAuth();
  const rollNo = user?.email ? extractRollNo(user.email) : "";
  const [form, setForm] = useState({
    title: "", price: "", category: "ELECTRONICS", condition: "Good",
    description: "", photo: "", phone: "", location: "",
  });
  const s = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim() && form.price.trim() && form.description.trim();

  const submit = () => {
    onAdd({
      title: form.title, price: form.price.startsWith("₹") ? form.price : `₹${form.price}`,
      category: form.category, condition: form.condition, description: form.description,
      photo: form.photo || CAT_IMAGES[form.category] || CAT_IMAGES.OTHER,
      contact: form.phone, location: form.location || "On Campus",
      sellerName: user?.name ?? "You", sellerUser: user?.name ?? "",
      sellerRollNo: rollNo, rep: "5.0", postedAt: "Just now",
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
            <h2 className="text-xl font-extrabold text-slate-900">Sell an Item</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in the details so buyers know what you're selling</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5">
          {/* Auto-filled seller info */}
          {user && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
              <BadgeCheck className="h-4 w-4 text-blue-500 flex-none" />
              <div>
                <span className="font-bold text-slate-800">{user.name}</span>
                <span className="text-slate-500 mx-1.5">·</span>
                <span className="text-blue-600 font-semibold">Roll: {rollNo}</span>
                <span className="text-slate-500 mx-1.5">·</span>
                <span className="text-slate-500">{user.college || "Your College"}</span>
              </div>
            </div>
          )}

          {/* Drag-drop photo */}
          <DragDropPhoto value={form.photo} onChange={v => s("photo", v)} />

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
                    form.condition === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                  )}>{c}</button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Describe the item — age, usage, defects, what's included, why selling…"
              value={form.description} onChange={e => s("description", e.target.value)} />
          </div>

          {/* Phone + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Phone className="inline h-3.5 w-3.5 mr-1 text-blue-500" />Phone / WhatsApp
              </label>
              <Input className="h-10 bg-slate-50" placeholder="Your phone number"
                value={form.phone} onChange={e => s("phone", e.target.value)} />
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
function RoommateModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: { title: string; desc: string; budget: string; location: string; contact: string }) => void }) {
  const { user } = useAuth();
  const rollNo = user?.email ? extractRollNo(user.email) : "";
  const [form, setForm] = useState({
    postType: "Looking for a Roommate", budget: "", location: "",
    desc: "", phone: "", email: user?.email ?? "", instagram: "",
  });
  const s = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.budget.trim() && form.location.trim() && form.desc.trim();

  const submit = () => {
    const contactObj = { phone: form.phone, email: form.email, instagram: form.instagram };
    onAdd({
      title: form.postType,
      desc: form.desc,
      budget: form.budget,
      location: form.location,
      contact: JSON.stringify(contactObj),
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
            <p className="text-xs text-slate-500 mt-0.5">Your info is auto-filled — just add your requirements</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-5">
          {/* Auto-filled info */}
          {user && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5">Posting as</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">{user.name[0]}</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">Roll: <span className="font-semibold text-blue-600">{rollNo}</span> · {user.college || "Your College"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Post Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Post Type</label>
            <div className="flex flex-wrap gap-2">
              {["Looking for a Roommate", "Have a Spare Room"].map(t => (
                <button key={t} onClick={() => s("postType", t)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    form.postType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                  )}>{t}</button>
              ))}
            </div>
          </div>

          {/* Budget + Area */}
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

          {/* About */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">About You & What You're Looking For *</label>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Major, lifestyle (early bird / night owl), habits, move-in date, gender preference…"
              value={form.desc} onChange={e => s("desc", e.target.value)} />
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Contact Info <span className="text-slate-400 font-normal">(at least one)</span></p>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-10 pl-9 bg-slate-50" placeholder="Phone number"
                value={form.phone} onChange={e => s("phone", e.target.value)} />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-10 pl-9 bg-slate-50" placeholder="Email address"
                value={form.email} onChange={e => s("email", e.target.value)} />
            </div>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="h-10 pl-9 bg-slate-50" placeholder="Instagram handle (e.g. @username)"
                value={form.instagram} onChange={e => s("instagram", e.target.value)} />
            </div>
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

/* ─── Cards ───────────────────────────────────────────────── */
function RestaurantCard({ restaurant, onClick }: { restaurant: Restaurant; onClick: () => void }) {
  return (
    <Card onClick={onClick}
      className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col cursor-pointer">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <img src={restaurant.photo} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        {restaurant.deliveryAvailable && (
          <Badge className="absolute top-3 left-3 bg-emerald-600 text-white border-none font-bold text-[10px]">
            <Bike className="h-3 w-3 mr-1" />Delivery
          </Badge>
        )}
        {restaurant.menuPhotos.length > 0 && (
          <Badge className="absolute top-3 right-3 bg-orange-600 text-white border-none font-bold text-[10px]">
            <MenuSquare className="h-3 w-3 mr-1" />Menu
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
        {restaurant.description && <p className="text-xs text-slate-500 line-clamp-2">{restaurant.description}</p>}
      </CardContent>
      <CardFooter className="px-5 pb-4 pt-0">
        <Button variant="outline" className="w-full h-8 border-slate-200 text-slate-700 text-xs font-semibold">
          <Eye className="h-3.5 w-3.5 mr-1.5" />View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductCard({ product, isMod, onDelete, onReport, onClick }: {
  product: Product; isMod: boolean;
  onDelete: () => void; onReport: () => void; onClick: () => void;
}) {
  const { user } = useAuth();
  const isOwner = product.sellerUser === user?.name;

  const COND_COLOR: Record<string, string> = {
    "New":      "bg-emerald-100 text-emerald-700",
    "Like New": "bg-green-100 text-green-700",
    "Good":     "bg-blue-100 text-blue-700",
    "Fair":     "bg-amber-100 text-amber-700",
    "For Parts":"bg-red-100 text-red-700",
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group relative flex flex-col">
      {isOwner && (
        <span className="absolute top-3 left-3 z-10 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">YOUR LISTING</span>
      )}
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden cursor-pointer" onClick={onClick}>
        <img src={product.photo} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <Badge className="absolute top-3 right-10 bg-black/70 text-white border-none backdrop-blur-md font-bold text-[10px]">{product.category}</Badge>
        <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
          <ActionMenu title={product.title} isOwner={isOwner} isModerator={isMod} onDelete={onDelete} onReport={onReport} />
        </div>
        <Button variant="ghost" size="icon" className="absolute bottom-3 right-3 bg-white/80 hover:bg-white text-slate-700 rounded-full h-8 w-8 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-5 flex-1 cursor-pointer" onClick={onClick}>
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
            {product.sellerRollNo && (
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">#{product.sellerRollNo}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">{product.postedAt}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {isOwner ? (
          <Button className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white text-sm" onClick={onDelete}>Delete Listing</Button>
        ) : (
          <Button className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 text-white text-sm" onClick={onClick}>View Details</Button>
        )}
        <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 text-slate-600" onClick={e => e.stopPropagation()}><Share2 className="h-4 w-4" /></Button>
      </CardFooter>
    </Card>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
const LINK_TYPE_TO_TAB: Record<string, string> = {
  restaurant: "restaurants", pg: "housing", local_service: "services",
};

export default function Marketplace() {
  const { user } = useAuth();
  const isMod   = user?.role === "low_admin" || user?.role === "admin";

  const search_ = useSearch();
  const initialTab = new URLSearchParams(search_).get("tab");

  const queryClient = useQueryClient();
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: restaurantRows = [], isLoading: restaurantsLoading } = useQuery({ queryKey: ["restaurants"], queryFn: fetchRestaurants });

  const products      = listings.filter(l => l.listingType === "buy_sell").map(listingToProduct);
  const housing       = listings.filter(l => l.listingType === "housing").map(listingToHousing);
  const roommatePosts = listings.filter(l => l.listingType === "roommate").map(listingToRoommate);
  const restaurants   = restaurantRows.map(localListingToRestaurant);

  const [showForm, setShowForm]               = useState(false);
  const [showRoommateForm, setShowRoommateForm] = useState(false);
  const [activeTab, setActiveTab]             = useState(initialTab || "buy-sell");
  const [search, setSearch]                   = useState("");
  const [filterCat, setFilterCat]             = useState("ALL");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "warn" } | null>(null);
  const [detail, setDetail] = useState<DetailPayload | null>(null);

  const notify = (msg: string, type: "success" | "warn" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
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

      {/* Detail popup */}
      <AnimatePresence>
        {detail && <ListingDetailModal payload={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>

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
        <BannerCarousel placement="marketplace" collegeId={user?.collegeId}
          onBannerClick={(linkType) => { const tab = LINK_TYPE_TO_TAB[linkType]; if (tab) setActiveTab(tab); }} />

        {/* Sell listing modal */}
        <AnimatePresence>
          {showForm && (
            <SellListingModal key="sell-modal" onClose={() => setShowForm(false)}
              onAdd={(p) => {
                createMutation.mutate({
                  title: p.title, description: p.description,
                  price: Number(p.price.replace(/[^0-9.]/g, "")) || 0,
                  priceUnit: "", category: p.category, listingType: "buy_sell",
                  imageUrl: p.photo, sellerName: user?.name ?? "You",
                  sellerRollNo: p.sellerRollNo,
                  contact: JSON.stringify({ phone: p.contact }),
                  location: p.location, condition: p.condition,
                });
                notify("🎉 Your listing is live!");
              }} />
          )}
        </AnimatePresence>

        {/* Roommate ad modal */}
        <AnimatePresence>
          {showRoommateForm && (
            <RoommateModal key="roommate-modal" onClose={() => setShowRoommateForm(false)}
              onAdd={(p) => {
                const rollNo = user?.email ? extractRollNo(user.email) : "";
                createMutation.mutate({
                  title: p.title, description: p.desc,
                  price: Number(p.budget.replace(/[^0-9.]/g, "")) || 0,
                  priceUnit: "/mo", category: "ROOMMATE", listingType: "roommate",
                  sellerName: user?.name ?? "You", sellerRollNo: rollNo,
                  contact: p.contact, location: p.location,
                });
                notify("🎉 Your roommate ad is live!");
              }} />
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-lg mb-6">
            <TabsTrigger value="buy-sell" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Buy / Sell</TabsTrigger>
            <TabsTrigger value="housing" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Housing</TabsTrigger>
            <TabsTrigger value="restaurants" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Restaurants</TabsTrigger>
            <TabsTrigger value="roommate" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Roommate Finder</TabsTrigger>
            <TabsTrigger value="services" className="px-6 py-2.5 rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-blue-700 font-semibold text-slate-600">Local Services</TabsTrigger>
          </TabsList>

          {/* ── Buy/Sell ── */}
          <TabsContent value="buy-sell">
            <div className="flex gap-2 mb-6 flex-wrap">
              {["ALL", ...CATS].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={cn("text-xs font-bold px-3 py-1.5 rounded-full border transition-all",
                    filterCat === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                  )}>{cat}</button>
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
                          <ProductCard product={product} isMod={isMod}
                            onClick={() => setDetail({ kind: "product", data: product })}
                            onDelete={() => { deleteMutation.mutate(Number(product.id)); notify("Listing deleted."); }}
                            onReport={() => notify(`"${product.title}" reported.`, "warn")} />
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
                      <Card className="overflow-hidden border-slate-200 shadow-sm flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setDetail({ kind: "housing", data: house })}>
                        <div className="md:w-2/5 h-64 md:h-auto bg-slate-100 relative">
                          <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
                          <Badge className="absolute top-3 left-3 bg-indigo-600 text-white border-none font-bold">HOUSING</Badge>
                        </div>
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 text-xl flex-1">{house.title}</h3>
                            <div className="flex items-center gap-2 ml-4">
                              <p className="text-2xl font-black text-blue-600 whitespace-nowrap">{house.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                              <div onClick={e => e.stopPropagation()}>
                                <ActionMenu title={house.title} isOwner={isOwner} isModerator={isMod}
                                  onDelete={() => { deleteMutation.mutate(Number(house.id)); notify("Housing listing deleted."); }}
                                  onReport={() => notify(`"${house.title}" reported.`, "warn")} />
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-3">{house.desc}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {house.amenities.map((a, i) => <Badge key={i} variant="outline" className="text-slate-600">{a}</Badge>)}
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
                              <ShieldCheck className="h-4 w-4 mr-1" /> Estate Verified
                            </Badge>
                            {isOwner
                              ? <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={e => { e.stopPropagation(); deleteMutation.mutate(Number(house.id)); notify("Deleted."); }}>Delete</Button>
                              : <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={e => { e.stopPropagation(); setDetail({ kind: "housing", data: house }); }}>View Details</Button>}
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
                {restaurants.map(r => (
                  <RestaurantCard key={r.id} restaurant={r}
                    onClick={() => setDetail({ kind: "restaurant", data: r })} />
                ))}
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
                      <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setDetail({ kind: "roommate", data: post })}>
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-start gap-4">
                          <Avatar className="h-12 w-12 border border-slate-200 flex-none">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{post.sellerName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-3 mb-1">
                              <div>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-1.5 font-bold text-[10px]">{post.title.toUpperCase()}</Badge>
                                <p className="font-bold text-slate-900">{post.sellerName}</p>
                                {post.sellerRollNo && (
                                  <p className="text-xs text-blue-600 font-semibold">Roll: {post.sellerRollNo}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-blue-600 whitespace-nowrap">{post.budget}</p>
                                {isOwner && (
                                  <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(Number(post.id)); notify("Roommate ad removed."); }}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{post.desc}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 flex-none" /><span>{post.location}</span>
                              <span className="text-slate-300 mx-1">·</span><span>{post.postedAt}</span>
                            </div>
                            {/* Contact badges */}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {post.contactPhone && <span className="text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Phone className="h-2.5 w-2.5" />Phone</span>}
                              {post.contactEmail && <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Mail className="h-2.5 w-2.5" />Email</span>}
                              {post.contactInstagram && <span className="text-[10px] font-semibold bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full flex items-center gap-1"><AtSign className="h-2.5 w-2.5" />Instagram</span>}
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

          {/* ── Local Services ── */}
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
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg overflow-hidden relative">
        <div className="absolute -right-6 -bottom-6 opacity-10"><ShoppingBag className="h-32 w-32" /></div>
        <CardContent className="p-6 relative">
          <h3 className="text-lg font-extrabold mb-1">Have something to sell?</h3>
          <p className="text-blue-100 text-sm mb-4">Post in 30 seconds — drag-drop photo, price, condition and connect with buyers.</p>
          <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold w-full" onClick={onSell}>
            <Plus className="mr-2 h-4 w-4" /> Post Free Ad
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-slate-900 text-white border-none shadow-lg cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={onFindRoommate}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Users className="h-6 w-6 text-blue-400" /></div>
            <h3 className="text-lg font-bold">Roommate Finder</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            {roommateCount > 0
              ? `${roommateCount} roommate ${roommateCount === 1 ? "ad" : "ads"} posted by students.`
              : "Post an ad or browse students looking for roommates near campus."}
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold" onClick={onFindRoommate}>
            Open Roommate Finder <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
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
    </div>
  );
}
