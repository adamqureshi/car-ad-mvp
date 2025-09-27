export type Ad = {
  id: string;              // short id for the public URL
  createdAt: string;

  vin: string;
  photos: string[];        // blob URLs of uploaded photos
  price: number;
  miles: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  exterior?: string;
  interior?: string;
  description?: string;

  seller: {
    name: string;
    email?: string;
    phone?: string;
  };
};
