import axiosInstance from '@/api/axiosConfig';
import { getCustomerRMA } from '@/api/rmaApi';

jest.mock('@/api/axiosConfig');

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('getCustomerRMA', () => {
  const mockData = [
    {
      id: "3433",
      orderRef: "#1000319452",
      createdDate: "2025-03-11 23:15:34",
      rmaStatus: "Résolu",
      orderStatus: "Non livré",
    },
  ];

  it('should return RMA data on successful API call', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await getCustomerRMA("123");
    expect(mockedAxios.get).toHaveBeenCalledWith('rest/V1/rmaapi/customer/123');
    expect(result).toEqual(mockData);
  });

  it('should throw an error when API call fails', async () => {
    const error = new Error("Network error");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(getCustomerRMA("123")).rejects.toThrow("Network error");
  });
});
