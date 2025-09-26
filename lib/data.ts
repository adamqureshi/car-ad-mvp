import { Ad } from "./types";

const mockAds: Ad[] = [
  {
    id: "demo-1",
    title: "2024 TESLA Model X long range",
    price: 21500,
    miles: 6000,
    city: "Beverly Hills",
    state: "CA",
    images: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1600&auto=format&fit=crop",
    ],
  },
  // ...other ads
];

export async function getAd(id: string): Promise<Ad> {
  // replace with DB fetch in your app
  const ad = mockAds.find((a) => a.id === id);
  if (!ad) throw new Error("Ad not found");
  return ad;
}
