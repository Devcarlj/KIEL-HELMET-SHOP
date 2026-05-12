import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";


// Add to cart (or increment if already exists)
export const addToCartController = async (request, response) => {
    try {
        const userId = request.userId;
        const { productId, variations, quantity = 1 } = request.body;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Validate stock for variations
        if (product.variationStocks && product.variationStocks.length > 0) {
            // Find the matching variation stock
            const variationStock = product.variationStocks.find(vs => {
                // Variations in request are usually an array of { name, value }
                // variations in combinations are an object { name: value }
                return Object.entries(vs.combinations).every(([name, value]) => {
                    const reqVar = variations.find(v => v.name === name);
                    return reqVar && reqVar.value === value;
                });
            });

            if (!variationStock) {
                return response.status(400).json({
                    message: "Invalid variation selected",
                    error: true,
                    success: false
                });
            }

            const user = await UserModel.findById(userId);
            const existingItem = user.shopping_cart.find(
                (item) =>
                    item.productId.toString() === productId &&
                    JSON.stringify(item.variations) === JSON.stringify(variations)
            );

            const currentInCart = existingItem ? existingItem.quantity : 0;
            const requestedTotal = currentInCart + quantity;

            if (requestedTotal > variationStock.stock) {
                return response.status(400).json({
                    message: `Only ${variationStock.stock} units available. You already have ${currentInCart} in cart.`,
                    error: true,
                    success: false
                });
            }

            if (existingItem) {
                existingItem.quantity = requestedTotal;
                await user.save();
                return response.json({
                    message: "Item quantity updated",
                    data: existingItem,
                    error: false,
                    success: true
                });
            }

            user.shopping_cart.push({ productId, quantity, variations });
            await user.save();
            const newItem = user.shopping_cart[user.shopping_cart.length - 1];
            return response.json({
                message: "Item added to cart",
                data: newItem,
                error: false,
                success: true
            });

        } else {
            // No variations, check general stock
            const user = await UserModel.findById(userId);
            const existingItem = user.shopping_cart.find(
                (item) => item.productId.toString() === productId && (!item.variations || item.variations.length === 0)
            );

            const currentInCart = existingItem ? existingItem.quantity : 0;
            const requestedTotal = currentInCart + quantity;

            if (requestedTotal > product.stock) {
                return response.status(400).json({
                    message: `Only ${product.stock} units available. You already have ${currentInCart} in cart.`,
                    error: true,
                    success: false
                });
            }

            if (existingItem) {
                existingItem.quantity = requestedTotal;
                await user.save();
                return response.json({
                    message: "Item quantity updated",
                    data: existingItem,
                    error: false,
                    success: true
                });
            }

            user.shopping_cart.push({ productId, quantity, variations });
            await user.save();
            const newItem = user.shopping_cart[user.shopping_cart.length - 1];
            return response.json({
                message: "Item added to cart",
                data: newItem,
                error: false,
                success: true
            });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};


// Get cart items (populated with product data)
export const getCartItemsController = async (request, response) => {
    try {
        const userId = request.userId;

        const user = await UserModel.findById(userId)
            .populate('shopping_cart.productId');

        if (!user) {
            return response.status(401).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Cart items fetched",
            data: user.shopping_cart,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Update cart item quantity
export const updateCartItemController = async (request, response) => {
    try {
        const userId = request.userId;
        const { _id, quantity } = request.body;

        if (!_id || quantity === undefined) {
            return response.status(400).json({
                message: "Cart item ID and quantity are required",
                error: true,
                success: false
            });
        }

        if (quantity < 1) {
            return response.status(400).json({
                message: "Quantity must be at least 1",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const cartItem = user.shopping_cart.id(_id);
        if (!cartItem) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            });
        }

        // Check stock before updating
        const product = await ProductModel.findById(cartItem.productId);
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        let availableStock = product.stock;

        if (product.variationStocks && product.variationStocks.length > 0 && cartItem.variations && cartItem.variations.length > 0) {
            const variationStock = product.variationStocks.find(vs => {
                return Object.entries(vs.combinations).every(([name, value]) => {
                    const cartVar = cartItem.variations.find(v => v.name === name);
                    return cartVar && cartVar.value === value;
                });
            });
            if (variationStock) {
                availableStock = variationStock.stock;
            }
        }

        if (quantity > availableStock) {
            return response.status(400).json({
                message: `Only ${availableStock} units available for this selection.`,
                error: true,
                success: false
            });
        }

        cartItem.quantity = quantity;
        await user.save();

        return response.json({
            message: "Cart item updated",
            data: cartItem,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};


// Delete cart item
export const deleteCartItemController = async (request, response) => {
    try {
        const userId = request.userId;
        const { _id } = request.body;

        if (!_id) {
            return response.status(400).json({
                message: "Cart item ID is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const cartItem = user.shopping_cart.id(_id);

        if (!cartItem) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            });
        }

        // Remove the subdocument using pull
        user.shopping_cart.pull({ _id });
        await user.save();

        return response.json({
            message: "Item removed from cart",
            data: cartItem,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
