import toast from "react-hot-toast"

const AxiosToastError = (error) => {
    // 1. Check if the server sent a specific message
    const message = error?.response?.data?.message || 
                    error?.message || 
                    "Something went wrong";
    
    toast.error(message);
}

export default AxiosToastError;