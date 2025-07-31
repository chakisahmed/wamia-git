import axiosInstance from '@/api/axiosConfig';
import { getReasonsRMA } from '@/api/rmaApi';

jest.mock('@/api/axiosConfig');

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('getReasonsRMA', () => {
  const mockData = [
    {
        id: "19",
        reason: "Échange"
    },
    {
        id: "20",
        reason: "Pièces ou accessoires manquants"
    }
  ];

  it('should return RMA resons  on successful API call', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await getReasonsRMA();
    expect(mockedAxios.get).toHaveBeenCalledWith('rest/V1/rmaapi/reasons');
    expect(result).toEqual(mockData);
  });

  it('should throw an error when API call fails', async () => {
    const error = new Error("Network error");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(getReasonsRMA()).rejects.toThrow("Network error");
  });
});
