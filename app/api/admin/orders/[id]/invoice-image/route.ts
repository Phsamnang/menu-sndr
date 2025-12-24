import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
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
        },
      },
    });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    let shopInfo = await prisma.shopInfo.findFirst();
    if (!shopInfo) {
      shopInfo = await prisma.shopInfo.create({
        data: {
          name: "Shop Name",
          address: null,
          phone: null,
          email: null,
          logo: null,
          taxId: null,
        },
      });
    }

    const groupedItems = order.items.reduce((acc: any, item: any) => {
      const key = `${item.menuItem.name}_${item.unitPrice}`;
      if (!acc[key]) {
        acc[key] = {
          menuItem: item.menuItem,
          unitPrice: item.unitPrice,
          quantity: 0,
          totalPrice: 0,
        };
      }
      acc[key].quantity += item.quantity;
      acc[key].totalPrice += item.totalPrice;
      return acc;
    }, {} as Record<string, any>);

    const groupedItemsArray = Object.values(groupedItems);

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("km-KH");
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case "cash":
          return "សាច់ប្រាក់";
        case "card":
          return "កាត";
        case "bank_transfer":
          return "ផ្ទេរប្រាក់";
        default:
          return method;
      }
    };

    const taxRate = 10;
    const taxAmount = 0;
    const paymentMethod = "cash";
    const finalTotal = order.total + taxAmount;
    const tableName = order.table?.name || order.table?.number;

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap');
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 450px;
      margin: 0;
      padding: 10px 15px;
      font-family: 'Kantumruy Pro', sans-serif;
      font-size: 26pt;
      background: white;
      overflow: visible;
      word-wrap: break-word;
    }
    .invoice-wrapper {
      width: 100%;
      max-width: 100%;
    }
    .invoice-header {
      text-align: center;
      margin-bottom: 4px;
      border-bottom: 1px dashed #000;
      padding-bottom: 4px;
    }
    .invoice-header h1 {
      font-size: 34pt;
      font-weight: bold;
      margin-bottom: 2px;
      line-height: 1.2;
    }
    .invoice-number {
      font-size: 27pt;
      font-weight: normal;
    }
    .invoice-info {
      margin: 4px 0;
      font-size: 26pt;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 26pt;
      gap: 4px;
    }
    .info-row span {
      max-width: 48%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .invoice-divider {
      border-top: 1px dashed #000;
      margin: 4px 0;
    }
    .invoice-items {
      margin: 4px 0;
    }
    .items-header {
      display: grid;
      grid-template-columns: 1fr 100px 140px;
      font-weight: bold;
      font-size: 26pt;
      margin-bottom: 3px;
      padding-bottom: 2px;
      border-bottom: 1px solid #000;
      gap: 8px;
    }
    .items-header span:nth-child(1) {
      text-align: left;
    }
    .items-header span:nth-child(2) {
      text-align: center;
    }
    .items-header span:nth-child(3) {
      text-align: right;
    }
    .item-row {
      margin-bottom: 4px;
      font-size: 26pt;
    }
    .item-name {
      margin-bottom: 1px;
      font-weight: 500;
      word-wrap: break-word;
      overflow-wrap: break-word;
      font-size: 26pt;
      line-height: 1.2;
    }
    .item-details {
      display: grid;
      grid-template-columns: 1fr 100px 140px;
      font-size: 26pt;
      gap: 8px;
      margin-top: 2px;
    }
    .item-qty {
      text-align: center;
      white-space: nowrap;
      font-size: 26pt;
    }
    .item-price {
      text-align: right;
      white-space: nowrap;
      font-size: 26pt;
    }
    .item-total {
      text-align: right;
      font-weight: bold;
      white-space: nowrap;
      font-size: 26pt;
    }
    .invoice-summary {
      margin: 4px 0;
      font-size: 26pt;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 26pt;
      gap: 4px;
    }
    .summary-row span {
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 50%;
    }
    .summary-row span:last-child {
      text-align: right;
      white-space: nowrap;
    }
    .summary-row.discount {
      color: #000;
    }
    .summary-row.total {
      font-weight: bold;
      font-size: 28pt;
      margin-top: 2px;
      padding-top: 2px;
      border-top: 1px solid #000;
    }
    .invoice-footer {
      margin-top: 6px;
      text-align: center;
      font-size: 26pt;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 26pt;
      gap: 4px;
    }
    .footer-row span {
      max-width: 50%;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .thank-you {
      font-weight: bold;
      margin-top: 4px;
      font-size: 27pt;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    ${
      shopInfo.logo
        ? `<div style="text-align: center; margin-bottom: 4px;"><img src="${shopInfo.logo}" alt="Logo" style="max-width: 100px; max-height: 60px;" /></div>`
        : ""
    }
    <div class="invoice-header">
      <h1>${shopInfo.name}</h1>
      <h1 style="font-size: 30pt; margin-top: 2px;">វិក្កយបត្រ</h1>
      <p class="invoice-number">#${order.orderNumber}</p>
    </div>
    ${
      shopInfo.address || shopInfo.phone || shopInfo.email
        ? `
    <div class="invoice-info" style="font-size: 22pt; margin-bottom: 4px;">
      ${
        shopInfo.address
          ? `<div style="text-align: center; margin-bottom: 2px;">${shopInfo.address}</div>`
          : ""
      }
      ${
        shopInfo.phone
          ? `<div style="text-align: center; margin-bottom: 2px;">ទូរស័ព្ទ: ${shopInfo.phone}</div>`
          : ""
      }
      ${
        shopInfo.email
          ? `<div style="text-align: center; margin-bottom: 2px;">${shopInfo.email}</div>`
          : ""
      }
    </div>
    `
        : ""
    }

    <div class="invoice-info">
      <div class="info-row">
        <span>កាលបរិច្ឆេទ:</span>
        <span>${formatDate(order.createdAt)}</span>
      </div>
      ${
        tableName
          ? `
      <div class="info-row">
        <span>តុ:</span>
        <span>${tableName}</span>
      </div>
      `
          : ""
      }
      ${
        order.customerName
          ? `
      <div class="info-row">
        <span>អតិថិជន:</span>
        <span>${order.customerName}</span>
      </div>
      `
          : ""
      }
    </div>

    <div class="invoice-divider"></div>

    <div class="invoice-items">
      <div class="items-header">
        <span>មុខម្ហូប</span>
        <span>ចំនួន</span>
        <span>តម្លៃ</span>
      </div>
      ${groupedItemsArray
        .map(
          (item: any) => `
      <div class="item-row">
        <div class="item-name">
          <span>${item.menuItem.name}</span>
        </div>
        <div class="item-details">
          <span></span>
          <span class="item-qty">${item.quantity}x</span>
          <span class="item-total">${item.totalPrice.toLocaleString(
            "km-KH"
          )}៛</span>
        </div>
      </div>
      `
        )
        .join("")}
    </div>

    <div class="invoice-divider"></div>

    <div class="invoice-summary">
      <div class="summary-row">
        <span>សរុបមុនបញ្ចុះតម្លៃ:</span>
        <span>${order.subtotal.toLocaleString("km-KH")}៛</span>
      </div>
      ${
        taxAmount > 0
          ? `
      <div class="summary-row">
        <span>ពន្ធ (${taxRate}%):</span>
        <span>${taxAmount.toLocaleString("km-KH")}៛</span>
      </div>
      `
          : ""
      }
      ${
        order.discountAmount > 0
          ? `
      <div class="summary-row discount">
        <span>បញ្ចុះតម្លៃ${
          order.discountType === "percentage"
            ? ` (${order.discountValue}%)`
            : ""
        }:</span>
        <span>-${order.discountAmount.toLocaleString("km-KH")}៛</span>
      </div>
      `
          : ""
      }
      <div class="summary-row total">
        <span>សរុប:</span>
        <span>${finalTotal.toLocaleString("km-KH")}៛</span>
      </div>
    </div>

    <div class="invoice-divider"></div>

    <div class="invoice-footer">
      <div class="footer-row">
        <span>វិធីសាស្ត្រទូទាត់:</span>
        <span>${getPaymentMethodLabel(paymentMethod)}</span>
      </div>
      <p class="thank-you">សូមអរគុណ!</p>
    </div>
  </div>
</body>
</html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      await page.setViewport({ width: 450, height: 800, deviceScaleFactor: 1 });
      await page.setContent(invoiceHTML, { waitUntil: "networkidle0" });

      const contentHeight = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        return Math.ceil(
          Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          )
        );
      });

      await page.setViewport({
        width: 450,
        height: Math.max(contentHeight + 20, 200),
        deviceScaleFactor: 1,
      });

      const screenshot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 450, height: contentHeight + 20 },
      });

      await browser.close();

      return new Response(screenshot as any, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.png"`,
        },
      });
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error: any) {
    console.error("Error generating invoice image:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate invoice image",
        message: error?.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return getHandler(request, context);
}
