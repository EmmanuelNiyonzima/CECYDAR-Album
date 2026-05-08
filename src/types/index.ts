export interface Album {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: number;
  // Customization
  titleColor?: string;
  titleSize?: string;
  titleFont?: string;
  // Gated content
  passcode?: string;
  isLocked?: boolean;
}

export interface Photo {
  id: string;
  albumId: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
  tags?: string[];
  uploadedBy?: string;
  uploaderEmail?: string;
}

export interface User {
  email: string | null;
  isAdmin: boolean;
  isContributor?: boolean;
  uid?: string;
}
