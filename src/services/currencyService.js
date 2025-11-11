import axios from 'axios';

const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

export const getExchangeRate = async (fromCurrency, toCurrency, amount) => {
  try {
    const response = await axios.get(`${BASE_URL}/pair/${fromCurrency}/${toCurrency}/${amount}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

export const getSupportedCurrencies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/codes`);
    return response.data.supported_codes;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
};