import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function fetchDeliveryItems(status?: string) {
  const where: any = {
    status: {
      in: ["new", "on_process"],
    },
  };

  const allOrders = await prisma.order.findMany({
    where,
    include: {
      table: {
        include: {
          tableType: true,
        },
      },
      items: {
        include: {
          menuItem: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const filteredOrders = allOrders
    .map((order) => {
      const deliveryItems = order.items.filter((item: any) => {
        const menuItem = item.menuItem as any;
        const itemStatus = item.status as string;

        if (menuItem.isCook === true) {
          return (
            itemStatus === "ready" && (status ? itemStatus === status : true)
          );
        } else {
          return (
            itemStatus !== "served" &&
            itemStatus !== "cancelled" &&
            (status ? itemStatus === status : true)
          );
        }
      });
      return {
        ...order,
        items: deliveryItems,
      };
    })
    .filter((order) => order.items.length > 0);

  return filteredOrders;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      let lastData: string = "";

      const poll = async () => {
        try {
          const orders = await fetchDeliveryItems(status);
          const currentData = JSON.stringify(orders);

          if (currentData !== lastData) {
            send({ items: orders });
            lastData = currentData;
          }
        } catch (error: any) {
          send({ error: error?.message || "Failed to fetch delivery items" });
        }
      };

      await poll();

      const interval = setInterval(async () => {
        try {
          await poll();
        } catch (error) {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
