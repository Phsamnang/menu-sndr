"use client";

import { useEffect } from "react";

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItem: {
    id: string;
    name: string;
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
  discountType: string | null;
  discountValue: number | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  createdAt?: string;
}

interface ShopInfo {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
  taxId?: string | null;
}

interface InvoicePrintProps {
  order: Order;
  tableName?: string;
  taxRate?: number;
  taxAmount?: number;
  paymentMethod?: string;
  shopInfo?: ShopInfo | null;
}

export default function InvoicePrint({
  order,
  tableName,
  taxRate = 10,
  taxAmount = 0,
  paymentMethod = "cash",
  shopInfo,
}: InvoicePrintProps) {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @media print {
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 58mm;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        body * {
          visibility: hidden;
        }

        .invoice-print-content,
        .invoice-print-content * {
          visibility: visible;
        }

        .invoice-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 58mm !important;
          max-width: 58mm !important;
          min-width: 58mm !important;
          display: block !important;
          padding: 2mm 3mm;
          margin: 0;
          font-family: var(--font-kantumruy-pro), "Kantumruy Pro", sans-serif;
          font-size: 7pt;
          background: white;
          overflow: hidden;
          word-wrap: break-word;
          box-sizing: border-box;
        }

        .invoice-wrapper {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .invoice-wrapper * {
          box-sizing: border-box;
        }

        .invoice-header {
          text-align: center;
          margin-bottom: 4px;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
        }

        .invoice-header h1 {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 2px;
          line-height: 1.2;
        }

        .invoice-number {
          font-size: 8pt;
          font-weight: normal;
        }

        .invoice-info {
          margin: 4px 0;
          font-size: 7pt;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 7pt;
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
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 7pt;
          margin-bottom: 3px;
          padding-bottom: 2px;
          border-bottom: 1px solid #000;
          gap: 2px;
        }
        
        .items-header span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-row {
          margin-bottom: 4px;
          font-size: 7pt;
        }

        .item-name {
          margin-bottom: 1px;
          font-weight: 500;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-size: 7pt;
          line-height: 1.2;
        }
        
        .item-name span {
          display: block;
          word-break: break-word;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 7pt;
          padding-left: 2px;
          gap: 2px;
        }

        .item-qty {
          flex: 0 0 18px;
          font-size: 7pt;
          white-space: nowrap;
        }

        .item-price {
          flex: 1;
          text-align: right;
          margin-right: 2px;
          font-size: 7pt;
          white-space: nowrap;
        }

        .item-total {
          flex: 0 0 45px;
          text-align: right;
          font-weight: bold;
          font-size: 7pt;
          white-space: nowrap;
        }

        .invoice-summary {
          margin: 4px 0;
          font-size: 7pt;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 7pt;
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
          font-size: 9pt;
          margin-top: 2px;
          padding-top: 2px;
          border-top: 1px solid #000;
        }

        .invoice-footer {
          margin-top: 6px;
          text-align: center;
          font-size: 7pt;
        }

        .footer-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 7pt;
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
          font-size: 8pt;
        }

        @page {
          size: 58mm auto;
          margin: 0mm;
          padding: 0mm;
        }
        
        @page :first {
          margin: 0mm;
        }
      }

      @media screen {
        .invoice-print-content {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleString("km-KH");
    return new Date(dateString).toLocaleString("km-KH");
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

  const finalTotal = (order.total || 0) + (taxAmount || 0);

  return (
    <div className="invoice-print-content">
      <div className="invoice-wrapper">
        {shopInfo?.logo && (
          <div style={{ textAlign: "center", marginBottom: "4px" }}>
            <img
              src={shopInfo.logo}
              alt="Logo"
              style={{ maxWidth: "80px", maxHeight: "50px" }}
            />
          </div>
        )}
        <div className="invoice-header">
          {shopInfo?.name && <h1 style={{ fontSize: "10pt", marginBottom: "2px" }}>{shopInfo.name}</h1>}
          <h1>វិក្កយបត្រ</h1>
          <p className="invoice-number">#{order.orderNumber}</p>
        </div>
        {(shopInfo?.address || shopInfo?.phone || shopInfo?.email) && (
          <div className="invoice-info" style={{ fontSize: "6pt", marginBottom: "4px", textAlign: "center" }}>
            {shopInfo.address && <div style={{ marginBottom: "2px" }}>{shopInfo.address}</div>}
            {shopInfo.phone && <div style={{ marginBottom: "2px" }}>ទូរស័ព្ទ: {shopInfo.phone}</div>}
            {shopInfo.email && <div style={{ marginBottom: "2px" }}>{shopInfo.email}</div>}
          </div>
        )}

        <div className="invoice-info">
          <div className="info-row">
            <span>កាលបរិច្ឆេទ:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          {tableName && (
            <div className="info-row">
              <span>តុ:</span>
              <span>{tableName}</span>
            </div>
          )}
          {order.customerName && (
            <div className="info-row">
              <span>អតិថិជន:</span>
              <span>{order.customerName}</span>
            </div>
          )}
        </div>

        <div className="invoice-divider"></div>

        <div className="invoice-items">
          <div className="items-header">
            <span>មុខម្ហូប</span>
            <span>ចំនួន</span>
            <span>តម្លៃ</span>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="item-row">
              <div className="item-name">
                <span>{item.menuItem.name}</span>
              </div>
              <div className="item-details">
                <span className="item-qty">{item.quantity}x</span>
                <span className="item-price">
                  {item.unitPrice.toLocaleString("km-KH")}៛
                </span>
                <span className="item-total">
                  {item.totalPrice.toLocaleString("km-KH")}៛
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="invoice-divider"></div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>សរុបមុនបញ្ចុះតម្លៃ:</span>
            <span>{order.subtotal.toLocaleString("km-KH")}៛</span>
          </div>
          {taxAmount > 0 && (
            <div className="summary-row">
              <span>ពន្ធ ({taxRate}%):</span>
              <span>{taxAmount.toLocaleString("km-KH")}៛</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="summary-row discount">
              <span>
                បញ្ចុះតម្លៃ
                {order.discountType === "percentage"
                  ? ` (${order.discountValue}%)`
                  : ""}
                :
              </span>
              <span>-{order.discountAmount.toLocaleString("km-KH")}៛</span>
            </div>
          )}
          <div className="summary-row total">
            <span>សរុប:</span>
            <span>{finalTotal.toLocaleString("km-KH")}៛</span>
          </div>
        </div>

        <div className="invoice-divider"></div>

        <div className="invoice-footer">
          <div className="footer-row">
            <span>វិធីសាស្ត្រទូទាត់:</span>
            <span>{getPaymentMethodLabel(paymentMethod)}</span>
          </div>
          <p className="thank-you">សូមអរគុណ!</p>
        </div>
      </div>
    </div>
  );
}
