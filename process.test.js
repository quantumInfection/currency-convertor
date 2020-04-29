import { getSingleTransaction, getCurrencyRates} from './index';

const {processTransaction} = jest.requireActual('./index');

const mockTransaction = {
    "createdAt": "2018-01-11T15:15:25.305Z",
    "currency": "ZAR",
    "amount": 867,
    "exchangeUrl": "https://api.exchangeratesapi.io/Y-M-D?base=EUR",
    "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
};

jest.mock('./index', () => ({
    getSingleTransaction: jest.fn(() => Promise.resolve(mockTransaction)),
    getCurrencyRates: jest.fn(() => Promise.resolve(14.9744))
}));

test('Test mock currency', async () => {
    await expect(getCurrencyRates()).resolves.toBe(14.9744);
});

test('Test mock single transaction', async () => {
    await expect(getSingleTransaction()).resolves.toMatchObject({
        "createdAt": "2018-01-11T15:15:25.305Z",
        "currency": "ZAR",
        "amount": 867,
        "exchangeUrl": "https://api.exchangeratesapi.io/Y-M-D?base=EUR",
        "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
    });
});

test('Test process transaction true positive', async () => {
    await expect(processTransaction(mockTransaction, "EUR", 0)).resolves.toMatchObject({
        "createdAt": "2018-01-11T15:15:25.305Z",
        "currency": "ZAR",
        "convertedAmount": 57.8988, // True value
        "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
      });
});

test('Test process transaction false converted amount', async () => {
    await expect(processTransaction(mockTransaction, "EUR", 0)).resolves.not.toMatchObject({
        "createdAt": "2018-01-11T15:15:25.305Z",
        "currency": "ZAR",
        "convertedAmount": 58.8988,
        "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
      });
});

test('Test process transaction false converted createdAt', async () => {
    await expect(processTransaction(mockTransaction, "EUR", 0)).resolves.not.toMatchObject({
        "createdAt": "2012-01-11T15:15:25.305Z",
        "currency": "ZAR",
        "convertedAmount": 57.8988,
        "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
      });
});


test('Test process transaction false currency', async () => {
    await expect(processTransaction(mockTransaction, "EUR", 0)).resolves.not.toMatchObject({
        "createdAt": "2018-01-11T15:15:25.305Z",
        "currency": "EUR",
        "convertedAmount": 57.8988,
        "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
      });
});


test('Test process transaction false checksum', async () => {
    await expect(processTransaction(mockTransaction, "EUR", 0)).resolves.not.toMatchObject({
        "createdAt": "2018-01-11T15:15:25.305Z",
        "currency": "ZAR",
        "convertedAmount": 57.8988, // False value
        "checksum": "ad91707809bec3b88947638155de1c88300dd8481970be7abc505b734d90ab7x"
      });
});