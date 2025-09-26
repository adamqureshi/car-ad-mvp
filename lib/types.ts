export type Ad = {
  id: string;
  title: string;
  price: number;
  miles: number;
  city: string;
  state: string;
  images?: string[]; // <-- new
};
