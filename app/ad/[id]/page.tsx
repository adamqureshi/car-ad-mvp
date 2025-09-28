// app/ad/[id]/page.tsx
import { loadAd } from "@/lib/store";

export const dynamic = "force-dynamic"; // or: export const revalidate = 0;

export default async function AdPage({ params }: { params: { id: string } }) {
  const ad = await loadAd(params.id);
  if (!ad) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border bg-white p-6 text-xl">
        Invalid ad.
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{ad.title}</h1>
      <p className="text-lg">
        ${ad.price?.toLocaleString()} • {ad.miles?.toLocaleString()} mi • {ad.city}, {ad.state}
      </p>

      {!!ad.images?.length && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {ad.images.map((src, i) => (
            <img key={i} src={src} alt={`${ad.title} ${i + 1}`} className="h-56 w-full rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="rounded-xl border p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-neutral-500">ID</div><div>{ad.id}</div>
          <div className="text-neutral-500">Created</div><div>{new Date(ad.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </main>
  );
}



