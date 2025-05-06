export const BASE_URL_WS = import.meta.env.VITE_URL_WS
export const BASE_URL_ENDPOINT = import.meta.env.VITE_URL_ENDPOINT
export const options = (token) => {
  const res = {
    headers: {
      "Content-Type": "application/json",
    },
    cachePolicy: 'no-cache'
  }
  if (token) {
    res.headers.Authorization = `Bearer ${token}`;
  }
  return res;
}