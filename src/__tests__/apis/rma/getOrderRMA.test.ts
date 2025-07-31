import axiosInstance from '@/api/axiosConfig';
import { getOrdersRMA } from '@/api/rmaApi';

jest.mock('@/api/axiosConfig');

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('getOrdersRMA', () => {
  const mockData = [
    {
      "id": "3333",
      "name": "Caleçon enfant Blue marine",
      "price": "14,000 DT",
      "qty": 1,
      "image": "https://www.wamia.tn/media/catalog/product/cache/806923f75c3f6c2bfef286e0bb0dcbf6/C/E/CEP4BM_1.jpg",
      "seller": {
        "seller_id": "1111",
        "seller_name": "QWERTY"
      }
    },
  ];

  it('should return RMA resons  on successful API call', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await getOrdersRMA("123");
    expect(mockedAxios.get).toHaveBeenCalledWith('rest/V1/rmaapi/customer/order/123');
    expect(result).toEqual(mockData);
  });

  it('should throw an error when API call fails', async () => {
    const error = new Error("Network error");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(getOrdersRMA("123")).rejects.toThrow("Network error");
  });
});
