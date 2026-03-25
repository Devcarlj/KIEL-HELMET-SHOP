import Axios from "./Axios";

/**
 * Standard fetcher function for SWR using the pre-configured Axios instance.
 * @param {string|object} urlOrConfig - The URL string or Axios config object.
 * @returns {Promise<any>}
 */
const fetcher = async (urlOrConfig) => {
  const config = typeof urlOrConfig === 'string' ? { url: urlOrConfig, method: 'get' } : urlOrConfig;
  const response = await Axios(config);
  return response.data;
};

export default fetcher;
