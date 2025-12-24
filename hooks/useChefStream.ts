import { useState, useEffect, useRef } from "react";
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

interface ChefStreamData {
  items: Order[];
}

const playNotificationSound = () => {
  try {
    const audio = new Audio("/audio/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.error("Error playing notification sound:", error);
    });
  } catch (error) {
    console.error("Error creating audio:", error);
  }
};

export function useChefStream(statusFilter: string | null) {
  const [ordersData, setOrdersData] = useState<ChefStreamData>({
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const previousItemIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    const token = getTokenSync();
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : "";
    const url = statusFilter
      ? `/api/chef/orders/stream?status=${statusFilter}${tokenParam}`
      : `/api/chef/orders/stream${tokenParam ? `?${tokenParam.substring(1)}` : ""}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error("SSE error:", data.error);
        } else {
          const allItemIds = new Set<string>();
          data.items?.forEach((order: Order) => {
            order.items?.forEach((item: OrderItem) => {
              allItemIds.add(item.id);
            });
          });

          if (!isInitialLoadRef.current) {
            const hasNewItems = Array.from(allItemIds).some(
              (id) => !previousItemIdsRef.current.has(id)
            );
            if (hasNewItems) {
              playNotificationSound();
            }
          } else {
            isInitialLoadRef.current = false;
          }

          previousItemIdsRef.current = allItemIds;
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
      previousItemIdsRef.current.clear();
      isInitialLoadRef.current = true;
    };
  }, [statusFilter]);

  return { ordersData, isLoading };
}

