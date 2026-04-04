const statusConfig = {
    pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
    processing: { label: 'Processing', color: '#3B82F6', bg: '#DBEAFE', icon: '⚙️' },
    shipped: { label: 'Shipped', color: '#8B5CF6', bg: '#EDE9FE', icon: '🚚' },
    delivered: { label: 'Delivered', color: '#10B981', bg: '#D1FAE5', icon: '✅' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
};

const orderStatusUpdateTemplate = ({ name, orderId, status, products, totalAmount, trackingNumber, orderDbId, frontendUrl }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    const orderUrl = `${frontendUrl}/login?redirect=${encodeURIComponent(`/dashboard/order-details/${orderDbId}`)}`;

    const productRows = products.map(p => {
        const variationText = p.variations && p.variations.length > 0
            ? p.variations.map(v => `${v.name}: ${v.value}`).join(', ')
            : '';
        return `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #F3EBDD; font-size: 14px; color: #2D2926;">
                    <strong>${p.name}</strong>
                    ${variationText ? `<br><span style="font-size: 12px; color: #888;">${variationText}</span>` : ''}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #F3EBDD; font-size: 14px; color: #2D2926; text-align: center;">${p.quantity}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #F3EBDD; font-size: 14px; color: #2D2926; text-align: right;">₱${Number(p.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
            </tr>
        `;
    }).join('');

    const trackingSection = trackingNumber ? `
        <div style="background-color: #EDE9FE; border-radius: 12px; padding: 16px 20px; margin: 20px 0; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1.5px;">Tracking Number</span><br>
            <span style="font-size: 18px; font-weight: 800; color: #6D28D9; letter-spacing: 2px; font-family: 'Courier New', monospace;">${trackingNumber}</span>
        </div>
    ` : '';

    return `
    <div style="font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #FDF5E6; padding: 40px; border: 1px solid #E66E33; border-radius: 20px; box-shadow: 0 10px 25px rgba(139, 34, 34, 0.08);">

        <div style="text-align: center; margin-bottom: 32px;">
            <div style="margin-bottom: 15px;">
                <img src="https://res.cloudinary.com/df0pfiqdh/image/upload/f_auto,q_auto/v1772970556/kielHelmetShop/assets/logo.png" alt="Kiel Helmet Shop" style="height: 60px; width: auto;">
            </div>
            <h1 style="color: #8B2222; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">KIEL HELMET SHOP</h1>
            <div style="width: 40px; height: 3px; background-color: #E66E33; margin: 12px auto;"></div>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
            <h2 style="color: #2D2926; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">Order Status Update</h2>
            <p style="color: #888; font-size: 14px; margin: 0;">Your order status has been updated</p>
        </div>

        <p style="color: #2D2926; font-size: 16px; line-height: 1.6;">
            Hello <strong style="color: #8B2222;">${name}</strong>,
        </p>

        <p style="color: #2D2926; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            We wanted to let you know that your order <strong style="color: #8B2222;">${orderId}</strong> has been updated.
        </p>

        <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: ${cfg.bg}; border: 2px solid ${cfg.color}; border-radius: 50px; padding: 10px 24px; white-space: nowrap;">
                <span style="font-size: 18px; vertical-align: middle;">${cfg.icon}</span>
                <span style="font-size: 15px; font-weight: 800; color: ${cfg.color}; vertical-align: middle; margin-left: 6px; letter-spacing: 1px; text-transform: uppercase;">${cfg.label}</span>
            </div>
        </div>

        ${trackingSection}

        <div style="background-color: #F3EBDD; border-radius: 12px; overflow: hidden; margin: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #8B2222;">
                        <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Product</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                        <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${productRows}
                </tbody>
            </table>
            <div style="padding: 16px 20px; text-align: right; border-top: 2px solid #E66E33;">
                <span style="font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Total</span>
                <span style="font-size: 20px; font-weight: 800; color: #8B2222; margin-left: 12px;">₱${Number(totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${orderUrl}"
               style="background-color: #8B2222; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px rgba(139, 34, 34, 0.2);">
                View My Orders
            </a>
        </div>

        <p style="color: #888; font-size: 13px; line-height: 1.5; text-align: center; padding: 0 20px;">
            If you have any questions about your order, feel free to reach out to us via our <a href="https://www.facebook.com/people/KIEL-Helmet-SHOP/100092575211604/" style="color: #8B2222; font-weight: 700; text-decoration: underline;">Facebook Messenger</a>.
        </p>

        <hr style="border: 0; border-top: 1px solid #E66E3333; margin: 32px 0;">

        <p style="color: #999; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
            &copy; 2026 Kiel Helmet Shop E-Commerce. <br> Premium Protection for Real Riders.
        </p>
    </div>
    `;
};

export default orderStatusUpdateTemplate;
