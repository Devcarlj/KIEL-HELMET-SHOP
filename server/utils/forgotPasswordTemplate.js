const forgotPasswordTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #FDF5E6; padding: 40px; border: 1px solid #E66E33; border-radius: 20px; box-shadow: 0 10px 25px rgba(139, 34, 34, 0.08);">
      
      <div style="text-align: center; margin-bottom: 32px;">
         <div style="margin-bottom: 15px;">
           <img src="https://res.cloudinary.com/df0pfiqdh/image/upload/f_auto,q_auto/v1772970556/kielHelmetShop/assets/logo.png" alt="Kiel Helmet Shop" style="height: 60px; width: auto;">
         </div>
         <h1 style="color: #8B2222; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">KIEL HELMET SHOP</h1>
         <div style="width: 40px; height: 3px; background-color: #E66E33; margin: 12px auto;"></div>
      </div>

      <div style="padding-top: 10px;">
        <h2 style="color: #2D2926; font-size: 22px; font-weight: 700; margin-bottom: 16px; text-align: center;">Reset your password?</h2>
        
        <p style="color: #2D2926; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
          Hello <strong>${name}</strong>,<br>
          We received a request to access your account. Please use the verification code below to securely complete your password reset.
        </p>

        <div style="background-color: #F3EBDD; border-radius: 16px; padding: 35px 20px; text-align: center; border: 2px dashed #E66E3388; margin-bottom: 32px;">
          <span style="display: block; font-size: 13px; font-weight: 700; color: #8B2222; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 16px;">One-Time Password (OTP)</span>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #8B2222; letter-spacing: 8px; display: block; margin-top: 10px; white-space: nowrap;">${otp}</span>
        </div>

        <div style="background-color: #FDF5E6; border-left: 5px solid #E66E33; padding: 18px; margin-bottom: 32px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
          <p style="color: #2D2926; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong style="color: #8B2222;">Validity:</strong> This code is valid for <strong style="color: #8B2222;">1 hour</strong>. For your security, never share this code with anyone.
          </p>
        </div>

        <p style="color: #666; font-size: 13px; line-height: 1.5; text-align: center; padding: 0 20px;">
          Didn't request this? Relax! You can safely ignore this email. Your password will remain unchanged until you use this code.
        </p>

        <hr style="border: 0; border-top: 1px solid #E66E3333; margin: 32px 0;">

        <p style="color: #999; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
          &copy; 2026 Kiel Helmet Shop E-Commerce. <br> Premium Protection for Real Riders.
        </p>
      </div>
    </div>
  `;
};

export default forgotPasswordTemplate;
