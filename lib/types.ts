export type Ad = {
  id: string;
  createdAt: string;

  vin: string;
  photos: string[];          // primary gallery we use everywhere
  price: number;
  miles: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  exterior?: string;
  interior?: string;
  description?: string;

  // optional extras (to satisfy demo seed / UI)
  title?: string;
  city?: string;
  state?: string;
  zip?: string;
  titleStatus?: string;
  images?: string[];         // alias used by demo seed; safe to keep optional

  seller: {
    name: string;
    email?: string;
    phone?: string;
  };
};

