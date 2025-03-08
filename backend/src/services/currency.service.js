import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let cachedRates = null;
let lastFetchTime = 0;

export async function getExchangeRates() {
  const now = Date.now();
  // Cache rates for 1 hour (3600000 ms)
  if (now - lastFetchTime < 3600000 && cachedRates) return cachedRates;

  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
    );
    cachedRates = response.data.conversion_rates;
    lastFetchTime = now;
    return cachedRates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    throw new Error("Exchange rate service unavailable");
  }
}

export async function convertCurrency(amount, fromCurrency, toCurrency) {
  const rates = await getExchangeRates();
  const usdAmount = amount / rates[fromCurrency]; // Convert to USD first
  return usdAmount * rates[toCurrency];
}