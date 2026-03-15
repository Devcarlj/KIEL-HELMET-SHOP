import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'c:/VScodes/KIEL HELMET SHOP/server/.env' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY.trim()
});

const logoPath = 'c:/VScodes/KIEL HELMET SHOP/client/src/assets/KielHelmetShop2.png';

async function upload() {
    try {
        const result = await cloudinary.uploader.upload(logoPath, {
            folder: 'kielHelmetShop/assets',
            public_id: 'logo',
            overwrite: true
        });
        fs.writeFileSync('logo_result.json', JSON.stringify({ url: result.secure_url }));
        console.log('DONE');
    } catch (error) {
        fs.writeFileSync('logo_result.json', JSON.stringify({ error: error.message }));
        console.log('FAIL');
    }
}

upload();
