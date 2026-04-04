const newOrderAdminTemplate = ({ 
    customerName, 
    customerEmail, 
    orderId, 
    products, 
    totalAmount, 
    subTotalAmount, 
    shippingFee, 
    paymentMethod, 
    deliveryAddress, 
    frontendUrl 
}) => {
    const adminOrderUrl = `${frontendUrl}/dashboard/orders`;

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
            <div style="display: inline-block; background-color: #DBEAFE; border: 2px solid #3B82F6; border-radius: 50px; padding: 10px 22px; margin-bottom: 16px; white-space: nowrap;">
                <span style="font-size: 18px; vertical-align: middle;">🛒</span>
                <span style="font-size: 14px; font-weight: 800; color: #3B82F6; vertical-align: middle; margin-left: 5px; letter-spacing: 1px; text-transform: uppercase;">New Order Received</span>
            </div>
            <p style="color: #888; font-size: 14px; margin: 0;">A new order has been placed by a customer</p>
        </div>

        <div style="background-color: #F3EBDD; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
            <h3 style="color: #2D2926; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; border-bottom: 1px solid #E66E3333; padding-bottom: 8px;">Customer Details</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Name</td>
                    <td style="padding: 6px 0; font-size: 15px; color: #2D2926; font-weight: 600; text-align: right;">${customerName}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Email</td>
                    <td style="padding: 6px 0; font-size: 15px; color: #2D2926; text-align: right;">
                        <a href="mailto:${customerEmail}" style="color: #8B2222; text-decoration: none;">${customerEmail}</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Address</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #2D2926; text-align: right; line-height: 1.4;">
                        ${deliveryAddress.adress_line},<br>
                        ${deliveryAddress.city}, ${deliveryAddress.state},<br>
                        ${deliveryAddress.country} ${deliveryAddress.pincode}
                    </td>
                </tr>
            </table>
        </div>

        <div style="background-color: #F3EBDD; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
            <h3 style="color: #2D2926; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; border-bottom: 1px solid #E66E3333; padding-bottom: 8px;">Order Info</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Order ID</td>
                    <td style="padding: 6px 0; font-size: 15px; color: #8B2222; font-weight: 800; text-align: right; font-family: 'Courier New', monospace;">${orderId}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Payment Method</td>
                    <td style="padding: 6px 0; font-size: 15px; color: #2D2926; font-weight: 600; text-align: right;">${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</td>
                </tr>
            </table>
        </div>

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
            <div style="padding: 16px 20px; border-top: 1px solid #E66E3333;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="font-size: 14px; color: #888; padding: 4px 0;">Subtotal</td>
                        <td style="font-size: 14px; color: #2D2926; text-align: right; padding: 4px 0;">₱${Number(subTotalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #888; padding: 4px 0;">Shipping Fee</td>
                        <td style="font-size: 14px; color: #2D2926; text-align: right; padding: 4px 0;">₱${Number(shippingFee).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; font-weight: 700; color: #8B2222; padding: 12px 0 0 0;">Total Amount</td>
                        <td style="font-size: 20px; font-weight: 800; color: #8B2222; text-align: right; padding: 12px 0 0 0;">₱${Number(totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${adminOrderUrl}"
               style="background-color: #8B2222; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px rgba(139, 34, 34, 0.2);">
                View Orders Dashboard
            </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #E66E3333; margin: 32px 0;">

        <p style="color: #999; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
            &copy; 2026 Kiel Helmet Shop E-Commerce. <br> Premium Protection for Real Riders.
        </p>
    </div>
    `;
};

export default newOrderAdminTemplate;
