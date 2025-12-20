export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: "food" | "drink";
  prices: {
    [tableType: string]: number;
  };
}

export async function fetchMenu(category?: string): Promise<MenuItem[]> {
  const url = category ? `/api/menu?category=${category}` : "/api/menu";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch menu");
  }
  return response.json();
}

