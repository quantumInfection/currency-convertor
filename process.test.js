import { getSingleTransaction, getCurrencyRates } from './index';

jest.mock('./index', () => ({
    getSingleTransaction: jest.fn(() => Promise.resolve({
        "createdAt": "2018-01-11T15:15:25.305Z",
        "currency": "ZAR",
        "amount": 867,
        "exchangeUrl": "https://api.exchangeratesapi.io/Y-M-D?base=EUR",
        "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
    })),
    getCurrencyRates: jest.fn(() => Promise.resolve(14.9744))
}));

test('Test mock currency', async () => {
    await expect(getCurrencyRates()).resolves.toBe(14.9744);
});
  