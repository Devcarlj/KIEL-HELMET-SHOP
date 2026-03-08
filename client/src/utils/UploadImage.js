import Axios from "../utils/Axios.js";
import SummaryApi from "../common/SummaryApi.js";

const uploadImage = async (image, folder) => {
    const formData = new FormData()
    if (folder) {
        formData.append('folder', folder)
    }
    formData.append('image', image)

    const response = await Axios({
        ...SummaryApi.uploadImage,
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}

export default uploadImage