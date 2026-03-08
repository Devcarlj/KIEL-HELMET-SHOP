import Axios from "./Axios"; // Ensure you are using your custom instance
import SummaryApi from "../common/SummaryApi.js";

const fetchUserDetails = async() => {
    try {
        const response = await Axios({
            ...SummaryApi.userDetails
        });
        
        // Return only the data part of the response
        return response.data; 
    } catch (error) {
        console.error("Error in fetchUserDetails:", error);
        return null; // Return null instead of letting it be undefined
    }
}

export default fetchUserDetails;