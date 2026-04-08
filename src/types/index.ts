export interface Album {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: number;
}

export interface Photo {
  id: string;
  albumId: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
}

export interface User {
  email: string | null;
  isAdmin: boolean;
}
