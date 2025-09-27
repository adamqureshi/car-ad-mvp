export type Ad = {
  id: string;
  createdAt: string;

  vin: string;
  photos: string[];
  price: number;
  miles: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  exterior?: string;
  interior?: string;
  description?: string;

  // optional extras used by your demo data/UI
  title?: string;
  city?: string;
  state?: string;
  zip?: string;
  titleStatus?: string;

  seller: {
    name: string;
    email?: string;
    phone?: string;
  };
};
