import { useState, useEffect } from "react";
import { getTokenSync } from "@/utils/token";

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  menuItem: {
    id: string;
    name: string;
    image: string;
    isCook: boolean;
    category: {
      displayName: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  tableId: string | null;
  customerName: string | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
  table?: {
    id: string;
    number: string;
    name: string | null;
    tableType: {
      displayName: string;
    };
  };
}

interface DeliveryStreamData {
  items: Order[];
}

export function useDeliveryStream(statusFilter: string | null) {
  const [ordersData, setOrdersData] = useState<DeliveryStreamData>({
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getTokenSync();
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
    const url = statusFilter
      ? `/api/delivery/items/stream?status=${statusFilter}${tokenParam}`
      : `/api/delivery/items/stream${
          tokenParam ? `?${tokenParam.substring(1)}` : ""
        }`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error("SSE error:", data.error);
        } else {
          setOrdersData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [statusFilter]);

  return { ordersData, isLoading };
}
