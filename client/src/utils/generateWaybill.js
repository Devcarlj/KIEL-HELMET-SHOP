import bwipjs from 'bwip-js';

/**
 * Generates a printable J&T Express Waybill in a new browser window.
 * Uses bwip-js for real scannable Code 128 barcodes and QR codes.
 *
 * @param {Object} order        - The full order object from the API.
 * @param {Object} buyerInfo    - { name, phone, addressLine, city, state, country, pincode }
 * @param {Object} sellerInfo   - { name, phone, addressLine, city, region, barangay, sortCode }
 * @param {Object} shipmentInfo - { trackingNumber, paymentMethod }
 */

/**
 * Generate a 3-digit route number from the destination city.
 */
const generateRouteNumber = (city) => {
    if (!city) return '000';
    let hash = 0;
    for (let i = 0; i < city.length; i++) {
        hash = ((hash << 5) - hash) + city.charCodeAt(i);
        hash |= 0;
    }
    return String(Math.abs(hash) % 1000).padStart(3, '0');
};

/**
 * Format a date as YYYY-MM-DD
 */
const formatWaybillDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Generate a barcode as a base64 data URL using bwip-js.
 * @param {string} text - The text to encode in the barcode.
 * @param {string} bcid - Barcode type (e.g., 'code128', 'qrcode').
 * @param {Object} opts - Additional bwip-js options.
 * @returns {string} A base64 PNG data URL, or empty string on failure.
 */
const generateBarcodeDataUrl = (text, bcid = 'code128', opts = {}) => {
    try {
        const canvas = document.createElement('canvas');
        bwipjs.toCanvas(canvas, {
            bcid,
            text: String(text),
            scale: 3,
            height: bcid === 'qrcode' ? undefined : 12,
            includetext: bcid !== 'qrcode',
            textxalign: 'center',
            textsize: opts.textsize || 7,
            ...opts
        });
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.error(`Barcode generation failed for "${text}":`, e);
        return '';
    }
};

export const generateWaybill = (order, buyerInfo, sellerInfo, shipmentInfo = {}) => {
    const destCity = buyerInfo.city || '';
    const routeNumber = generateRouteNumber(destCity);
    const sendDate = formatWaybillDate(order.createdAt);
    const trackingNumber = shipmentInfo.trackingNumber || order.trackingNumber || '';
    const paymentMethod = shipmentInfo.paymentMethod || order.paymentMethod || 'cod';

    const totalQty = order.products.reduce((sum, p) => sum + p.quantity, 0);
    const isCOD = paymentMethod === 'cod';
    const codAmount = isCOD ? order.totalAmount.toFixed(1) : '0.0';

    const buyerPhone = buyerInfo.phone ? (buyerInfo.phone.startsWith('63') ? buyerInfo.phone : `63${buyerInfo.phone}`) : '';
    const sellerPhone = sellerInfo.phone || '';

    // Build estimated SBD (Ship-by Date) — 1 day after order
    const sbd = new Date(order.createdAt);
    sbd.setDate(sbd.getDate() + 1);
    const sbdDate = formatWaybillDate(sbd);

    const fullBuyerAddress = [buyerInfo.addressLine, destCity, buyerInfo.state, buyerInfo.country].filter(Boolean).join(', ');

    // ── Generate real barcodes ──────────────────────────────────────
    const barcodeDataUrl = trackingNumber
        ? generateBarcodeDataUrl(trackingNumber, 'code128', { height: 4, scale: 3, textsize: 5 })
        : '';

    const qrDataUrl = generateBarcodeDataUrl(order.orderId, 'qrcode', { scale: 2 });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Waybill - ${order.orderId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { margin:0; padding:0; box-sizing:border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #e5e7eb;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .waybill {
            width: 400px;
            background: #fff;
            border: 2px solid #000;
            margin: 20px auto;
            font-size: 11px;
            color: #000;
        }

        @media print {
            body { background: #fff; }
            .no-print { display: none !important; }
            .waybill { border: 2px solid #000; margin: 0 auto; }
            @page { margin: 10mm; size: 110mm 160mm; }
        }

        .wb-row {
            display: flex;
            border-bottom: 2px solid #000;
        }
        .wb-row:last-child { border-bottom: none; }

        .wb-cell {
            padding: 4px 6px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .wb-border-r { border-right: 2px solid #000; }
        .wb-border-r-thin { border-right: 1px solid #000; }

        .wb-label {
            font-size: 7px;
            font-weight: 800;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            transform: rotate(180deg);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px 3px;
            background: #f3f4f6;
            min-width: 22px;
        }

        .tracking-large {
            font-size: 28px;
            font-weight: 900;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            line-height: 1;
        }

        .cod-watermark {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 72px;
            font-weight: 900;
            color: rgba(0,0,0,0.06);
            letter-spacing: 4px;
            pointer-events: none;
            user-select: none;
        }

        .attempt-table {
            width: 100%;
            border-collapse: collapse;
        }
        .attempt-table th,
        .attempt-table td {
            border: 1px solid #000;
            text-align: center;
            padding: 3px 6px;
            font-size: 9px;
            font-weight: 700;
        }
        .attempt-table th {
            background: #f3f4f6;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .attempt-table td {
            height: 22px;
        }
    </style>
</head>
<body>
    <!-- Print Button -->
    <div class="no-print" style="text-align:center; padding:16px; background:#1a1a1a;">
        <button onclick="window.print()" style="background:linear-gradient(135deg,#dc2626,#ef4444); color:#fff; border:none; padding:12px 32px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit;">
            🖨️ Print Waybill
        </button>
        <p style="color:#999; font-size:11px; margin-top:8px;">Recommended: Print on 4×6 inch (100×150mm) label paper</p>
    </div>

    <div class="waybill">

        <!-- ═══ ROW 1: Header — Logo / Destination / Route ═══ -->
        <div class="wb-row">
            <div class="wb-cell wb-border-r" style="width:140px; padding:6px 8px;">
                <div style="display:flex; align-items:center; gap:4px;">
                    <div style="background:linear-gradient(135deg,#dc2626,#ff6b35); color:#fff; font-size:16px; font-weight:900; padding:3px 8px; border-radius:4px; letter-spacing:-0.5px;">J&T</div>
                    <span style="font-size:9px; font-weight:700; color:#dc2626; text-transform:uppercase;">Express</span>
                </div>
            </div>
            <div class="wb-cell wb-border-r" style="flex:1; padding:4px 8px;">
                <div style="font-size:14px; font-weight:800;">${destCity || 'N/A'}</div>
                <div style="font-size:9px; color:#555; font-weight:600;">Send Date: ${sendDate}</div>
            </div>
            <div class="wb-cell" style="width:55px; text-align:center;">
                <div style="font-size:22px; font-weight:900; color:#000;">${routeNumber}</div>
            </div>
        </div>

        <!-- ═══ ROW 2: Order ID / Tracking Number ═══ -->
        <div class="wb-row">
            <div class="wb-cell wb-border-r" style="width:140px; padding:6px 8px;">
                <div style="font-size:8px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.5px;">Order ID</div>
                <div style="font-size:10px; font-weight:800; font-family:'Courier New',monospace; margin-top:2px; word-break:break-all;">${order.orderId}</div>
            </div>
            <div class="wb-cell" style="flex:1; text-align:center; padding:8px;">
                <div class="tracking-large">${trackingNumber || 'N/A'}</div>
            </div>
        </div>

        <!-- ═══ ROW 3: Scannable Barcode ═══ -->
        <div class="wb-row" style="justify-content:center; padding:8px 4px;">
            <div style="text-align:center; width:100%;">
                ${barcodeDataUrl
                    ? `<img src="${barcodeDataUrl}" alt="Barcode" style="width:100%; height:auto; display:block; margin:0 auto; image-rendering:pixelated;" />`
                    : `<div style="font-size:10px; color:#999; padding:12px;">No tracking number – barcode unavailable</div>`
                }
            </div>
        </div>

        <!-- ═══ ROW 4: BUYER Section ═══ -->
        <div class="wb-row" style="position:relative;">
            <div class="wb-label wb-border-r">BUYER</div>
            <div style="flex:1; display:flex; flex-direction:column;">
                <!-- Buyer Name & Phone -->
                <div style="display:flex; border-bottom:1px solid #000;">
                    <div class="wb-cell wb-border-r-thin" style="flex:1; padding:5px 8px;">
                        <div style="font-size:12px; font-weight:800;">${buyerInfo.name}</div>
                    </div>
                    <div class="wb-cell" style="width:110px; padding:5px 8px;">
                        <div style="font-size:10px; font-weight:700; font-family:'Courier New',monospace;">${buyerPhone}</div>
                    </div>
                </div>
                <!-- Full Address -->
                <div style="padding:5px 8px; border-bottom:1px solid #000; font-size:10px; font-weight:600; line-height:1.4;">
                    ${fullBuyerAddress}
                </div>
                <!-- City / Province / Type / Zip -->
                <div style="display:flex;">
                    <div class="wb-cell wb-border-r-thin" style="flex:1; padding:4px 8px;">
                        <div style="font-size:10px; font-weight:700;">${destCity || 'N/A'}</div>
                        <div style="font-size:9px; color:#555; font-weight:600;">${buyerInfo.state || ''}</div>
                    </div>
                    <div class="wb-cell wb-border-r-thin" style="flex:1; padding:4px 8px;">
                        <div style="font-size:10px; font-weight:700;">${buyerInfo.state || 'N/A'}</div>
                        <div style="font-size:9px; color:#555; font-weight:600;">${buyerInfo.country || ''}</div>
                    </div>
                    <div class="wb-cell" style="width:70px; padding:4px 8px; text-align:center;">
                        <div style="font-size:8px; font-weight:700; color:#555;">HOME</div>
                        <div style="font-size:13px; font-weight:900;">${buyerInfo.pincode || 'N/A'}</div>
                    </div>
                </div>
            </div>
            <!-- COD Watermark (only for COD orders) -->
            ${isCOD ? '<div class="cod-watermark">COD</div>' : ''}
        </div>

        <!-- ═══ ROW 5: SELLER Section ═══ -->
        <div class="wb-row">
            <div class="wb-label wb-border-r">SELLER</div>
            <div style="flex:1; display:flex; flex-direction:column;">
                <!-- Seller Name & Phone -->
                <div style="display:flex; border-bottom:1px solid #000;">
                    <div class="wb-cell wb-border-r-thin" style="flex:1; padding:5px 8px;">
                        <div style="font-size:11px; font-weight:800;">${sellerInfo.name}</div>
                    </div>
                    <div class="wb-cell" style="width:110px; padding:5px 8px;">
                        <div style="font-size:10px; font-weight:700; font-family:'Courier New',monospace;">${sellerPhone}</div>
                    </div>
                </div>
                <!-- Seller Address -->
                <div style="padding:5px 8px; border-bottom:1px solid #000; font-size:10px; font-weight:600; line-height:1.4;">
                    ${sellerInfo.addressLine || ''} ${sellerInfo.city || ''}
                </div>
                <!-- City / Region / SBD / Sort -->
                <div style="display:flex;">
                    <div class="wb-cell wb-border-r-thin" style="flex:1; padding:4px 8px;">
                        <div style="font-size:10px; font-weight:700;">${sellerInfo.city || 'N/A'}</div>
                        <div style="font-size:9px; color:#555; font-weight:600;">${sellerInfo.barangay || ''}</div>
                    </div>
                    <div class="wb-cell wb-border-r-thin" style="flex:1; padding:4px 8px;">
                        <div style="font-size:10px; font-weight:700;">${sellerInfo.region || 'N/A'}</div>
                    </div>
                    <div class="wb-cell" style="width:90px; padding:4px 8px; text-align:right;">
                        <div style="font-size:7px; font-weight:700; color:#555; text-transform:uppercase;">SBD</div>
                        <div style="font-size:9px; font-weight:800;">${sbdDate}</div>
                        <div style="font-size:12px; font-weight:900; margin-top:1px;">${sellerInfo.sortCode || '0000'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ ROW 6: Product Info & COD Amount ═══ -->
        <div class="wb-row">
            <div class="wb-cell wb-border-r" style="flex:1; padding:8px 10px;">
                <div style="display:flex; flex-direction:column; gap:3px;">
                    <div style="font-size:10px;"><span style="font-weight:800;">Product Quantity:</span> <span style="font-weight:600;">${totalQty}</span></div>
                    <div style="font-size:10px;"><span style="font-weight:800;">Weight:</span> <span style="font-weight:600;">${(totalQty * 0.5).toFixed(1)} kg</span></div>
                </div>
            </div>
            <div class="wb-cell" style="width:150px; padding:8px 10px; text-align:right;">
                ${isCOD
                    ? `<div style="font-size:10px; font-weight:800; color:#555;">COD Amount:</div>
                       <div style="font-size:18px; font-weight:900; color:#dc2626;">${codAmount}</div>`
                    : `<div style="font-size:10px; font-weight:800; color:#555;">Payment:</div>
                       <div style="font-size:13px; font-weight:900; color:#059669;">PAID ONLINE</div>`
                }
            </div>
        </div>

        <!-- ═══ ROW 7: QR Code + Delivery / Return Attempt ═══ -->
        <div class="wb-row" style="border-bottom:none;">
            ${qrDataUrl
                ? `<div class="wb-cell wb-border-r" style="width:80px; padding:4px; align-items:center;">
                       <img src="${qrDataUrl}" alt="QR" style="width:68px; height:68px; image-rendering:pixelated;" />
                       <div style="font-size:6px; text-align:center; color:#777; margin-top:2px; font-weight:600;">Scan to verify</div>
                   </div>`
                : ''
            }
            <div style="flex:1; padding:6px 8px;">
                <div style="display:flex; gap:12px;">
                    <div style="flex:1;">
                        <table class="attempt-table">
                            <thead>
                                <tr><th colspan="2">Delivery Attempt</th></tr>
                            </thead>
                            <tbody>
                                <tr><td style="width:50%;">1</td><td>2</td></tr>
                                <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="flex:1;">
                        <table class="attempt-table">
                            <thead>
                                <tr><th colspan="2">Return Attempt</th></tr>
                            </thead>
                            <tbody>
                                <tr><td style="width:50%;">1</td><td>2</td></tr>
                                <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </div><!-- .waybill -->
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=500,height=700');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
};
