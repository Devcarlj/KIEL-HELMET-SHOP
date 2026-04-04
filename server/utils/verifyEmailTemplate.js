const verifyEmailTemplate = ({ name, url }) => {
    return `
    <div style="font-family: 'Poppins', 'Inter', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #FDF5E6; padding: 40px; border-radius: 16px; border: 1px solid #E66E33; color: #2D2926; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="margin-bottom: 15px;">
                <img src="<img src="https://res.cloudinary.com/df0pfiqdh/image/upload/f_auto,q_auto/v1772970556/kielHelmetShop/assets/logo.png" alt="Kiel Helmet Shop" style="height: 60px; width: auto;">
            </div>
            <h1 style="color: #8B2222; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">KIEL HELMET SHOP</h1>
            <div style="width: 50px; height: 3px; background-color: #E66E33; margin: 15px auto;"></div>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Dear <strong style="color: #8B2222;">${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Thank you for joining the <strong>Kiel Helmet Shop</strong> family. To finalize your account and start your journey with us, please verify your email address below.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="${url}" 
               style="background-color: #8B2222; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: 700; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 4px 6px rgba(139, 34, 34, 0.2);">
                Verify My Email
            </a>
        </div>

        <p style="margin-top: 40px; font-size: 0.85em; color: #666; text-align: center; border-top: 1px solid #E66E3344; padding-top: 25px;">
            If the button above doesn't work, copy and paste this link into your browser: <br>
            <a href="${url}" style="color: #E66E33; text-decoration: none; word-break: break-all;">${url}</a>
        </p>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
            &copy; 2026 Kiel Helmet Shop. All rights reserved.
        </p>
    </div>
    `;
}

export default verifyEmailTemplate;
