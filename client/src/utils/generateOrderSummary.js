/**
 * Generates a printable Order Summary document in a new browser window.
 * The admin can print it or save as PDF via the browser's print dialog (Ctrl+P).
 *
 * @param {Object} order        - The full order object from the API.
 * @param {Object} buyerInfo    - Editable buyer info from the preview modal.
 * @param {Object} sellerInfo   - Editable seller info from the preview modal.
 * @param {Object} shipmentInfo - { trackingNumber, paymentMethod } from the preview modal.
 */
export const generateOrderSummary = (order, buyerInfo, sellerInfo, shipmentInfo = {}) => {
    const formatDate = (dateStr) => {
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateStr));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency', currency: 'PHP',
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(price);
    };

    const statusColors = {
        pending: '#f59e0b',
        processing: '#3b82f6',
        shipped: '#8b5cf6',
        delivered: '#10b981',
        cancelled: '#ef4444'
    };

    const productsRows = order.products.map((p) => `
        <tr>
            <td style="padding:12px 10px; border-bottom:1px solid #f0f0f0;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${p.image?.[0] || ''}" alt="${p.name}" 
                         style="width:50px; height:50px; object-fit:contain; border-radius:8px; border:1px solid #eee; background:#fafafa;" />
                    <div>
                        <div style="font-weight:700; color:#1a1a1a; font-size:13px;">${p.name}</div>
                        ${p.variations?.length > 0 ? `
                            <div style="margin-top:3px;">
                                ${p.variations.map(v => `<span style="display:inline-block; background:#f5f3ff; color:#6d28d9; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:600; margin-right:4px; text-transform:uppercase;">${v.name}: ${v.value}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </td>
            <td style="padding:12px 10px; text-align:center; border-bottom:1px solid #f0f0f0; font-weight:600; color:#555;">${p.quantity}</td>
            <td style="padding:12px 10px; text-align:right; border-bottom:1px solid #f0f0f0; color:#555;">${formatPrice(p.price)}</td>
            <td style="padding:12px 10px; text-align:right; border-bottom:1px solid #f0f0f0; font-weight:700; color:#1a1a1a;">${formatPrice(p.price * p.quantity)}</td>
        </tr>
    `).join('');

    const totalQty = order.products.reduce((sum, p) => sum + p.quantity, 0);
    const statusColor = statusColors[order.orderStatus] || '#999';

    const shopName = sellerInfo.name || 'Kiel Helmet Shop';
    const buyerPhone = buyerInfo.phone || '';
    const trackingNumber = shipmentInfo.trackingNumber || order.trackingNumber || '';
    const paymentMethod = shipmentInfo.paymentMethod || order.paymentMethod || 'cod';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Summary - ${order.orderId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { margin:0; padding:0; box-sizing:border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1a1a1a;
            background: #f8f9fa;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .page {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 0;
        }

        @media print {
            body { background: #fff; }
            .page { max-width: 100%; }
            .no-print { display: none !important; }
            @page { margin: 15mm; size: A4; }
        }

        @media screen {
            .page { margin: 20px auto; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
        }
    </style>
</head>
<body>
    <!-- Print Button (screen only) -->
    <div class="no-print" style="text-align:center; padding:16px; background:#1a1a1a;">
        <button onclick="window.print()" style="background:linear-gradient(135deg,#6d28d9,#4f46e5); color:#fff; border:none; padding:12px 32px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit;">
            🖨️ Print / Save as PDF
        </button>
    </div>

    <div class="page">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e1b4b,#312e81); padding:32px 40px; color:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h1 style="font-size:24px; font-weight:800; letter-spacing:-0.5px; margin-bottom:4px;">🏍️ ${shopName}</h1>
                    <p style="font-size:12px; opacity:0.7; font-weight:500;">Order Summary Document</p>
                    ${sellerInfo.addressLine ? `<p style="font-size:11px; opacity:0.5; font-weight:400; margin-top:4px;">${sellerInfo.addressLine}${sellerInfo.city ? ', ' + sellerInfo.city : ''}${sellerInfo.region ? ', ' + sellerInfo.region : ''}</p>` : ''}
                    ${sellerInfo.phone ? `<p style="font-size:11px; opacity:0.5; font-weight:400;">📞 ${sellerInfo.phone}</p>` : ''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px; opacity:0.6; text-transform:uppercase; letter-spacing:1px; font-weight:700; margin-bottom:4px;">Order ID</div>
                    <div style="font-size:18px; font-weight:800; letter-spacing:0.5px;">${order.orderId}</div>
                </div>
            </div>
            <div style="margin-top:20px; display:flex; gap:24px; flex-wrap:wrap;">
                <div>
                    <div style="font-size:10px; opacity:0.5; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Date Placed</div>
                    <div style="font-size:13px; font-weight:600; margin-top:2px;">${formatDate(order.createdAt)}</div>
                </div>
                <div>
                    <div style="font-size:10px; opacity:0.5; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Payment</div>
                    <div style="font-size:13px; font-weight:600; margin-top:2px; text-transform:uppercase;">${paymentMethod} — ${order.paymentStatus}</div>
                </div>
                <div>
                    <div style="font-size:10px; opacity:0.5; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Status</div>
                    <div style="margin-top:4px;">
                        <span style="background:${statusColor}; color:#fff; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">${order.orderStatus}</span>
                    </div>
                </div>
                ${trackingNumber ? `
                <div>
                    <div style="font-size:10px; opacity:0.5; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Tracking #</div>
                    <div style="font-size:13px; font-weight:600; margin-top:2px; font-family:monospace; letter-spacing:1px;">${trackingNumber}</div>
                </div>` : ''}
            </div>
        </div>

        <!-- Customer & Shipping Info -->
        <div style="padding:28px 40px; display:flex; gap:24px; border-bottom:1px solid #f0f0f0; flex-wrap:wrap;">
            <div style="flex:1; min-width:220px;">
                <div style="font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; margin-bottom:10px;">Customer Information</div>
                <div style="font-size:15px; font-weight:700; color:#1a1a1a; margin-bottom:4px;">${buyerInfo.name}</div>
                ${buyerPhone ? `<div style="font-size:12px; color:#666;">📞 +63 ${buyerPhone}</div>` : ''}
            </div>
            <div style="flex:1; min-width:220px;">
                <div style="font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; margin-bottom:10px;">Shipping Address</div>
                <div style="font-size:13px; color:#333; line-height:1.6; font-weight:500;">
                    ${buyerInfo.addressLine || ''}<br>
                    ${buyerInfo.city || ''}${buyerInfo.state ? ', ' + buyerInfo.state : ''}<br>
                    ${buyerInfo.country || ''} ${buyerInfo.pincode ? '- ' + buyerInfo.pincode : ''}
                </div>
            </div>
        </div>

        <!-- Products Table -->
        <div style="padding:28px 40px;">
            <div style="font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; margin-bottom:16px;">Order Items (${totalQty} item${totalQty > 1 ? 's' : ''})</div>
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:2px solid #e5e7eb;">
                        <th style="padding:10px; text-align:left; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Product</th>
                        <th style="padding:10px; text-align:center; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Qty</th>
                        <th style="padding:10px; text-align:right; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Unit Price</th>
                        <th style="padding:10px; text-align:right; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsRows}
                </tbody>
            </table>
        </div>

        <!-- Price Summary -->
        <div style="padding:0 40px 28px 40px;">
            <div style="background:#fafafa; border-radius:12px; padding:20px 24px; border:1px solid #f0f0f0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="font-size:13px; color:#666;">Subtotal</span>
                    <span style="font-size:13px; font-weight:600; color:#333;">${formatPrice(order.subTotalAmount)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <span style="font-size:13px; color:#666;">Shipping Fee</span>
                    <span style="font-size:13px; font-weight:600; color:#333;">${formatPrice(order.shippingFee)}</span>
                </div>
                <div style="border-top:2px solid #e5e7eb; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:16px; font-weight:800; color:#1a1a1a;">Total Amount</span>
                    <span style="font-size:22px; font-weight:800; color:#059669;">${formatPrice(order.totalAmount)}</span>
                </div>
            </div>
        </div>

        ${order.comment ? `
        <!-- Order Note -->
        <div style="padding:0 40px 28px 40px;">
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:16px 20px;">
                <div style="font-size:10px; color:#b45309; text-transform:uppercase; letter-spacing:1px; font-weight:700; margin-bottom:6px;">📝 Order Note</div>
                <p style="font-size:13px; color:#92400e; font-style:italic; line-height:1.5;">${order.comment}</p>
            </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="background:#fafafa; padding:20px 40px; border-top:1px solid #f0f0f0; text-align:center;">
            <p style="font-size:11px; color:#aaa; font-weight:500;">This is a system-generated order summary from <strong>${shopName}</strong>.</p>
            <p style="font-size:10px; color:#ccc; margin-top:4px;">Generated on ${formatDate(new Date().toISOString())}</p>
        </div>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=850,height=700');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
};
