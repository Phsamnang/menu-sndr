import { Price } from "./price";

export interface MenuItemDetail {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  categoryName?: string;
  isCook?: boolean;
  prices: Price[];
}

