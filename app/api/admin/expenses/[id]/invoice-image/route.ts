import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chromium, type Browser } from "playwright";

let sharedBrowser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }
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
    ],
  });
  return sharedBrowser;
}

async function getHandler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            unit: true,
          },
        },
      },
    });

    if (!expense) {
      return new NextResponse("Expense not found", { status: 404 });
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

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("km-KH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (date: Date) => {
      return new Date(date).toLocaleTimeString("km-KH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Calculate totals by currency
    const usdItems = expense.items.filter(
      (item: any) => item.currency === "USD"
    );
    const khrItems = expense.items.filter(
      (item: any) => item.currency === "KHR"
    );

    const totalUSD = usdItems.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0
    );
    const totalKHR = khrItems.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0
    );

    const paidUSD = usdItems
      .filter((item: any) => item.paymentStatus === "PAID")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const unpaidUSD = totalUSD - paidUSD;

    const paidKHR = khrItems
      .filter((item: any) => item.paymentStatus === "PAID")
      .reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const unpaidKHR = totalKHR - paidKHR;

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
      width: 1123px;
      margin: 0;
      padding: 15px 20px;
      font-family: 'Kantumruy Pro', sans-serif;
      font-size: 14pt;
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
      margin-bottom: 12px;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
    }
    .invoice-header h1 {
      font-size: 22pt;
      font-weight: bold;
      margin-bottom: 6px;
      line-height: 1.2;
    }
    .invoice-title {
      font-size: 20pt;
      font-weight: 600;
      margin: 12px 0;
      text-align: center;
    }
    .invoice-info {
      margin: 10px 0;
      font-size: 14pt;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14pt;
      gap: 12px;
    }
    .info-row span:first-child {
      font-weight: 500;
      min-width: 140px;
    }
    .info-row span:last-child {
      text-align: right;
      flex: 1;
      word-wrap: break-word;
    }
    .invoice-divider {
      border-top: 1px dashed #000;
      margin: 12px 0;
    }
    .invoice-items {
      margin: 12px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 18pt;
    }
    .items-table thead {
      border-bottom: 2px solid #000;
    }
    .items-table th {
      font-weight: bold;
      font-size: 18pt;
      padding: 6px 4px;
      text-align: left;
    }
    .items-table th:nth-child(1) {
      text-align: left;
      width: 30%;
    }
    .items-table th:nth-child(2),
    .items-table th:nth-child(3),
    .items-table th:nth-child(4),
    .items-table th:nth-child(5) {
      text-align: center;
      width: auto;
    }
    .items-table td {
      padding: 6px 4px;
      font-size: 18pt;
      border-bottom: 1px dotted #ccc;
    }
    .items-table td:nth-child(1) {
      text-align: left;
      font-weight: 500;
    }
    .items-table td:nth-child(2),
    .items-table td:nth-child(3),
    .items-table td:nth-child(4),
    .items-table td:nth-child(5) {
      text-align: center;
    }
    .item-quantity {
      color: #555;
    }
    .item-unit-price {
      color: #555;
    }
    .item-total {
      font-weight: 600;
    }
    .status-paid {
      color: #16a34a;
      font-weight: 500;
    }
    .status-unpaid {
      color: #ea580c;
      font-weight: 500;
    }
    .item-currency {
      font-size: 22pt;
      color: #666;
      margin-top: 1px;
    }
    .totals-section {
      margin-top: 6px;
      border-top: 1px dashed #000;
      padding-top: 4px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 16pt;
    }
    .total-label {
      font-weight: 500;
    }
    .total-amount {
      font-weight: bold;
      font-size: 18pt;
    }
    .currency-section {
      margin-top: 8px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .currency-title {
      font-weight: bold;
      font-size: 20pt;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #ccc;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 16pt;
      margin-bottom: 4px;
    }
    .thank-you {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px dashed #000;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="invoice-header">
      <h1>${shopInfo.name || "Expense Invoice"}</h1>
      ${
        shopInfo.address
          ? `<div class="invoice-info">${shopInfo.address}</div>`
          : ""
      }
      ${
        shopInfo.phone
          ? `<div class="invoice-info">ទូរស័ព្ទ: ${shopInfo.phone}</div>`
          : ""
      }
    </div>

    <div class="invoice-title">វិក្កយបត្រចំណាយ</div>

    <div class="invoice-info">
      <div class="info-row">
        <span>កាលបរិច្ឆេទ:</span>
        <span>${formatDate(new Date(expense.date))}</span>
      </div>
      <div class="info-row">
        <span>ពេលវេលា:</span>
        <span>${formatTime(new Date(expense.date))}</span>
      </div>
      <div class="info-row">
        <span>ចំណងជើង:</span>
        <span>${expense.title}</span>
      </div>
      <div class="info-row">
        <span>ប្រភេទ:</span>
        <span>${expense.category}</span>
      </div>
      ${
        expense.vendor
          ? `
      <div class="info-row">
        <span>អ្នកផ្គត់ផ្គង់:</span>
        <span>${expense.vendor}</span>
      </div>
      `
          : ""
      }
      ${
        expense.receiptNumber
          ? `
      <div class="info-row">
        <span>លេខបង្កាន់ដៃ:</span>
        <span>${expense.receiptNumber}</span>
      </div>
      `
          : ""
      }
    </div>

    <div class="invoice-divider"></div>

    <div class="invoice-items">
      <table class="items-table">
        <thead>
          <tr>
            <th>ឈ្មោះផលិតផល</th>
            <th>បរិមាណ</th>
            <th>តម្លៃ/ឯកតា</th>
            <th>សរុប</th>
            <th>ស្ថានភាព</th>
          </tr>
        </thead>
        <tbody>
          ${expense.items
            .map(
              (item: any) => `
          <tr>
            <td>${item.productName}</td>
            <td class="item-quantity">${item.quantity}</td>
            <td class="item-unit-price">${
              item.currency === "KHR" ? "៛" : "$"
            }${item.unitPrice.toFixed(2)}</td>
            <td class="item-total">${
              item.currency === "KHR" ? "៛" : "$"
            }${item.totalPrice.toFixed(2)}</td>
            <td class="item-status ${
              item.paymentStatus === "PAID" ? "status-paid" : "status-unpaid"
            }">${item.paymentStatus === "PAID" ? "បង់ហើយ" : "មិនទាន់បង់"}</td>
          </tr>
        `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="totals-section">
      ${
        totalUSD > 0
          ? `
      <div class="currency-section">
        <div class="currency-title">USD</div>
        <div class="summary-row">
          <span>សរុប:</span>
          <span class="total-amount">$${totalUSD.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>បង់ហើយ:</span>
          <span style="color: #16a34a;">$${paidUSD.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>មិនទាន់បង់:</span>
          <span style="color: #ea580c;">$${unpaidUSD.toFixed(2)}</span>
        </div>
      </div>
      `
          : ""
      }
      
      ${
        totalKHR > 0
          ? `
      <div class="currency-section" style="margin-top: 4px;">
        <div class="currency-title">KHR</div>
        <div class="summary-row">
          <span>សរុប:</span>
          <span class="total-amount">៛${totalKHR.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>បង់ហើយ:</span>
          <span style="color: #16a34a;">៛${paidKHR.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>មិនទាន់បង់:</span>
          <span style="color: #ea580c;">៛${unpaidKHR.toFixed(2)}</span>
        </div>
      </div>
      `
          : ""
      }
    </div>

    <p class="thank-you">សូមអរគុណ!</p>
  </div>
</body>
</html>
    `;

    const browser = await getBrowser();

    const page = await browser.newPage();

    try {
      const invoiceWidth = 1123;

      await page.setViewportSize({ width: invoiceWidth, height: 800 });

      await page.setContent(invoiceHTML, { waitUntil: "load" });

      // Wait for font files to finish loading after the font CSS has been fetched
      await page.evaluate(() => document.fonts.ready);

      const screenshot = await page.screenshot({
        type: "png",
        fullPage: true,
      });

      await page.close();

      return new NextResponse(screenshot as any, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="expense-invoice-${expense.id}.png"`,
        },
      });
    } catch (error) {
      await page.close();
      throw error;
    }
  } catch (error: any) {
    console.error("Error generating expense invoice image:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to generate invoice image",
        message: error?.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return getHandler(request, context);
}
