import UserModel from "../models/user.model.js";

// Add to cart (or increment if already exists)
export const addToCartController = async (request, response) => {
    try {
        const userId = request.userId;
        const { productId, variations } = request.body;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return response.status(401).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Check if product already exists in shopping_cart
        const existingItem = user.shopping_cart.find(
            (item) =>
                item.productId.toString() === productId &&
                JSON.stringify(item.variations) === JSON.stringify(variations)
        );

        if (existingItem) {
            // Increment quantity
            existingItem.quantity += 1;
            await user.save();

            return response.json({
                message: "Item quantity updated",
                data: existingItem,
                error: false,
                success: true
            });
        }

        // Add new item to shopping_cart
        user.shopping_cart.push({ productId, quantity: 1, variations });
        await user.save();

        // Get the newly added item (last one in array)
        const newItem = user.shopping_cart[user.shopping_cart.length - 1];

        return response.json({
            message: "Item added to cart",
            data: newItem,
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
