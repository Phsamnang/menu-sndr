import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { chromium, type Browser, type BrowserContext } from "playwright";
import QRCode from "qrcode";

// ── Browser pool ────────────────────────────────────────────────
let sharedBrowser: Browser | null = null;
let sharedContext: BrowserContext | null = null;

async function getBrowserContext(): Promise<BrowserContext> {
  if (!sharedBrowser || !sharedBrowser.isConnected()) {
    sharedBrowser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--disable-extensions",
        "--disable-software-rasterizer",
        "--disable-web-security",         // skip CORS checks for data URLs
        "--blink-settings=imagesEnabled=false", // skip external image loading
      ],
    });
    sharedContext = null;
  }

  if (!sharedContext) {
    sharedContext = await sharedBrowser.newContext({
      viewport: { width: 450, height: 800 },
      deviceScaleFactor: 1,
    });
  }

  return sharedContext;
}

// ── Simple in-memory caches ─────────────────────────────────────
const qrCache = new Map<string, string>();           // url  → dataURL
let shopInfoCache: { data: any; ts: number } | null = null;
const SHOP_CACHE_TTL = 60_000; // 1 minute

async function getCachedQR(url: string): Promise<string> {
  if (qrCache.has(url)) return qrCache.get(url)!;
  const dataUrl = await QRCode.toDataURL(url, { width: 150, margin: 1 });
  qrCache.set(url, dataUrl);
  return dataUrl;
}

async function getCachedShopInfo() {
  const now = Date.now();
  if (shopInfoCache && now - shopInfoCache.ts < SHOP_CACHE_TTL) {
    return shopInfoCache.data;
  }
  let shopInfo = await prisma.shopInfo.findFirst();
  if (!shopInfo) {
    shopInfo = await prisma.shopInfo.create({
      data: { name: "Shop Name", address: null, phone: null, email: null, logo: null, taxId: null },
    });
  }
  shopInfoCache = { data: shopInfo, ts: now };
  return shopInfo;
}

// ── Helpers ─────────────────────────────────────────────────────
const formatDate = (date: Date) => new Date(date).toLocaleString("km-KH");

const getPaymentMethodLabel = (method: string) =>
  ({ cash: "សាច់ប្រាក់", card: "កាត", bank_transfer: "ផ្ទេរប្រាក់" }[method] ?? method);

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (request.url.startsWith("https") ? "https" : "http");
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

function buildHTML(order: any, shopInfo: any, groupedItems: any[], qrCodeDataUrl: string): string {
  const taxAmount = 0;
  const paymentMethod = order.paymentMethod ?? "cash";
  const finalTotal = order.total + taxAmount;
  const tableName = order.table?.name || order.table?.number;

  return /* html */`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:450px;padding:10px 15px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:26pt;background:#fff}
.hdr{text-align:center;border-bottom:1px dashed #000;padding-bottom:4px;margin-bottom:4px}
.hdr h1{font-size:34pt;font-weight:bold;line-height:1.2}
.hdr h2{font-size:30pt;margin-top:2px}
.hdr p{font-size:27pt}
.info-row,.sum-row,.foot-row{display:flex;justify-content:space-between;margin-bottom:2px;gap:4px}
.info-row span,.sum-row span,.foot-row span{max-width:50%;word-wrap:break-word}
.sum-row span:last-child,.foot-row span:last-child{text-align:right;white-space:nowrap}
.div{border-top:1px dashed #000;margin:4px 0}
.sdiv{border-top:1px solid #000;margin:4px 0}
.col3{display:grid;grid-template-columns:1fr 100px 140px;gap:8px}
.col3-hdr{font-weight:bold;padding-bottom:2px;border-bottom:1px solid #000;margin-bottom:3px}
.col3-hdr span:nth-child(2){text-align:center}
.col3-hdr span:nth-child(3){text-align:right}
.item-name{font-weight:500;word-wrap:break-word;line-height:1.2;margin-bottom:1px}
.qty{text-align:center;white-space:nowrap}
.tot{text-align:right;font-weight:bold;white-space:nowrap}
.sum-total{font-weight:bold;font-size:28pt;border-top:1px solid #000;padding-top:2px;margin-top:2px}
.ty{font-weight:bold;font-size:27pt;margin-top:4px}
.qr{text-align:center;margin-top:8px;padding-top:4px}
.qr img{width:150px;height:150px;display:block;margin:0 auto}
</style></head><body>
${shopInfo.logo ? `<div style="text-align:center;margin-bottom:4px"><img src="${shopInfo.logo}" style="max-width:100px;max-height:60px"/></div>` : ""}
<div class="hdr">
  <h1>${shopInfo.name}</h1>
  <h2>វិក្កយបត្រ</h2>
  <p>#${order.orderNumber}</p>
</div>
${shopInfo.address || shopInfo.phone || shopInfo.email ? `
<div style="font-size:22pt;text-align:center;margin-bottom:4px">
  ${shopInfo.address ? `<div>${shopInfo.address}</div>` : ""}
  ${shopInfo.phone ? `<div>ទូរស័ព្ទ: ${shopInfo.phone}</div>` : ""}
  ${shopInfo.email ? `<div>${shopInfo.email}</div>` : ""}
</div>` : ""}
<div class="info-row"><span>កាលបរិច្ឆេទ:</span><span>${formatDate(order.createdAt)}</span></div>
${tableName ? `<div class="info-row"><span>តុ:</span><span>${tableName}</span></div>` : ""}
${order.customerName ? `<div class="info-row"><span>អតិថិជន:</span><span>${order.customerName}</span></div>` : ""}
<div class="div"></div>
<div class="col3 col3-hdr"><span>មុខម្ហូប</span><span>ចំនួន</span><span>តម្លៃ</span></div>
${groupedItems.map((item: any) => `
<div style="margin-bottom:4px">
  <div class="item-name">${item.menuItem.name}</div>
  <div class="col3"><span></span><span class="qty">${item.quantity}x</span><span class="tot">${item.totalPrice.toLocaleString("km-KH")}៛</span></div>
</div>`).join("")}
<div class="div"></div>
<div class="sum-row"><span>សរុបមុនបញ្ចុះតម្លៃ:</span><span>${order.subtotal.toLocaleString("km-KH")}៛</span></div>
${order.discountAmount > 0 ? `<div class="sum-row"><span>បញ្ចុះតម្លៃ${order.discountType === "percentage" ? ` (${order.discountValue}%)` : ""}:</span><span>-${order.discountAmount.toLocaleString("km-KH")}៛</span></div>` : ""}
<div class="sum-row sum-total"><span>សរុប:</span><span>${finalTotal.toLocaleString("km-KH")}៛</span></div>
<div class="div"></div>
<div class="foot-row"><span>វិធីសាស្ត្រទូទាត់:</span><span>${getPaymentMethodLabel(paymentMethod)}</span></div>
<div style="text-align:center" class="ty">សូមអរគុណ!</div>
<div class="qr"><img src="${qrCodeDataUrl}"/></div>
</body></html>`;
}

// ── Main handler ────────────────────────────────────────────────
async function getHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Parallel fetch: order + shopInfo + QR all at once
    const baseUrl = getBaseUrl(request);
    const orderUrl = `${baseUrl}/order/${id}`;

    const [order, shopInfo, qrCodeDataUrl] = await Promise.all([
      prisma.order.findUnique({
        where: { id },
        include: {
          table: { include: { tableType: true } },
          items: { include: { menuItem: { include: { category: true } } } },
        },
      }),
      getCachedShopInfo(),
      getCachedQR(orderUrl),
    ]);

    if (!order) return new Response("Order not found", { status: 404 });

    // 2. Group items
    const groupedItems = Object.values(
      order.items.reduce((acc: any, item: any) => {
        const key = `${item.menuItem.name}_${item.unitPrice}`;
        if (!acc[key]) acc[key] = { menuItem: item.menuItem, unitPrice: item.unitPrice, quantity: 0, totalPrice: 0 };
        acc[key].quantity += item.quantity;
        acc[key].totalPrice += item.totalPrice;
        return acc;
      }, {} as Record<string, any>)
    );

    // 3. Build HTML
    const html = buildHTML(order, shopInfo, groupedItems, qrCodeDataUrl);

    // 4. Reuse browser context, open page, screenshot, close
    const context = await getBrowserContext();
    const page = await context.newPage();

    try {
      // setContent + networkidle0 skipped → commit=commit is fastest
      await page.setContent(html, { waitUntil: "commit" });
      const screenshot = await page.screenshot({ type: "png", fullPage: true });

      return new Response(screenshot as any, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.png"`,
          "Cache-Control": "private, max-age=300", // 5-min browser cache
        },
      });
    } finally {
      await page.close(); // always release page back
    }

  } catch (error: any) {
    console.error("Error generating invoice image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate invoice image", message: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return getHandler(request, context);
}