"use client";
import Image from "next/image";
import { useState } from "react";

export default function AdGallery({ images = [] as string[] }) {
  const safeImages = images.filter(Boolean);
  const [active, setActive] = useState(0);

  if (!safeImages.length) {
    return (
      <div className="aspect-video w-full rounded-xl bg-gray-100 grid place-items-center text-gray-500">
        No images uploaded
      </div>
    );
  }

  const go = (dir: number) =>
    setActive((prev) => (prev + dir + safeImages.length) % safeImages.length);

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
        <Image
          src={safeImages[active]}
          alt={`Ad photo ${active + 1}`}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 960px"
          priority
        />
        {safeImages.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm shadow"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm shadow"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border ${
                i === active ? "ring-2 ring-blue-600" : ""
              }`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
