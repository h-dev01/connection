/**
 * Shared ad-banner carousel used on both Study Hub and Marketplace.
 * Banners are uploaded/managed by moderators (see Moderator → Ad Banners).
 * Every banner renders in the same fixed-size box (object-cover) regardless
 * of its uploaded image's original dimensions, and rotates on its own
 * moderator-configured duration.
 */
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerLinkType = "restaurant" | "pg" | "local_service" | "none";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkType: BannerLinkType;
  durationMs: number;
}

async function fetchBanners(placement: "study" | "marketplace", collegeId?: number): Promise<Banner[]> {
  const params = new URLSearchParams({ placement });
  if (collegeId !== undefined) params.set("collegeId", String(collegeId));
  const res = await fetch(`/api/banners?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load banners");
  return res.json();
}

export function BannerCarousel({
  placement,
  collegeId,
  onBannerClick,
}: {
  placement: "study" | "marketplace";
  /** The current student's collegeId, so only banners targeting their college (or global ones) are shown. */
  collegeId?: number;
  onBannerClick: (linkType: BannerLinkType) => void;
}) {
  const { data: banners = [] } = useQuery({
    queryKey: ["banners", placement, collegeId],
    queryFn: () => fetchBanners(placement, collegeId),
  });

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setCurrent(0); }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const duration = banners[current]?.durationMs ?? 5000;
    timerRef.current = setTimeout(() => setCurrent(c => (c + 1) % banners.length), duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, banners]);

  if (banners.length === 0) return null;

  const b = banners[current];

  const go = (dir: 1 | -1) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(c => (c + dir + banners.length) % banners.length);
  };

  return (
    <div className="relative mb-8 rounded-none overflow-hidden shadow-lg h-56 bg-slate-900">
      <AnimatePresence mode="wait">
        <motion.button
          key={b.id}
          type="button"
          onClick={() => onBannerClick(b.linkType)}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={cn("absolute inset-0 w-full h-full text-left group", b.linkType !== "none" && "cursor-pointer")}
        >
          <img src={b.imageUrl} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-sm">{b.title}</h2>
            {b.subtitle && <p className="text-slate-200 text-sm mt-1 max-w-lg">{b.subtitle}</p>}
          </div>
        </motion.button>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(1)} aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to banner ${i + 1}`}
                className={cn("rounded-full transition-all", i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
