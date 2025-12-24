import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function fetchDeliveryItems(status?: string) {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["new", "on_process"],
      },
      items: {
        some: {
          OR: [
            {
              menuItem: {
                isCook: true,
              },
              status: "ready",
            },
            {
              menuItem: {
                isCook: false,
              },
              status: {
                in: ["pending", "preparing", "ready"],
              },
            },
          ],
          status: status
            ? status
            : {
                notIn: ["served", "cancelled"],
              },
        },
      },
    },
    include: {
      table: {
        include: {
          tableType: true,
        },
      },
      items: {
        where: {
          OR: [
            {
              menuItem: {
                isCook: true,
              },
              status: "ready",
            },
            {
              menuItem: {
                isCook: false,
              },
              status: {
                in: ["pending", "preparing", "ready"],
              },
            },
          ],
          status: status
            ? status
            : {
                notIn: ["served", "cancelled"],
              },
        },
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

  return orders;
}

async function handler(request: AuthenticatedRequest) {
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

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const GET = withAuth(handler, ["admin", "order"]);
