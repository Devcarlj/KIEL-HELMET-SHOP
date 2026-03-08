import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi.js";

const fetchCartItems = async () => {
    try {
        const response = await Axios({
            ...SummaryApi.getCartItems
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return null;
    }
}

export default fetchCartItems;
