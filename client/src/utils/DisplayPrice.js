/**
 * Formats a number as Philippine Peso (PHP) with commas.
 * @param {number} price - The price to format.
 * @returns {string} - The formatted price string with ₱ symbol and commas.
 */
export const DisplayPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};
