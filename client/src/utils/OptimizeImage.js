/**
 * Cloudinary Optimization Helper
 * Ensures we use f_auto (format), q_auto (quality) and optional width/height
 */
export const getOptimizedImageUrl = (url, { width, height, crop = 'scale', quality = 'auto', format = 'auto' } = {}) => {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;

    // If it's already optimized or has transformations, we need to be careful
    // But for simple Cloudinary URLs, we can inject transformations after 'upload/'
    if (!url.includes('upload/')) return url;

    const [base, rest] = url.split('upload/');

    // Build transformation string
    const transforms = [];
    if (format) transforms.push(`f_${format}`);
    if (quality) transforms.push(`q_${quality}`);
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (width || height) transforms.push(`c_${crop}`);

    const transformString = transforms.join(',');

    return `${base}upload/${transformString}/${rest}`;
};
