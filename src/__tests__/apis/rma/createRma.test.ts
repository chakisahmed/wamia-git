import { createRma, CreateRmaPayload, RMA } from '@/api/rmaApi';
import axiosInstance from '@/api/axiosConfig'; // This will be the mock instance

// Tell Jest to use the mock we defined for the axiosInstance module.
// The path should match how it's imported in rmaApi.ts.
// Assuming it's a sibling file to rmaApi.ts.
jest.mock('@/api/axiosConfig');

// Cast the imported mock to a Jest Mock type for type-safe mock functions
const mockedAxiosPost = axiosInstance.post as jest.Mock;

describe('createRma API function', () => {
    
    // Clear mock history before each test to ensure tests are isolated
    beforeEach(() => {
        mockedAxiosPost.mockClear();
    });

    // Define a sample payload that we can reuse in our tests
    const mockPayload: CreateRmaPayload = {
        order_id: "123",
        item_ids: ["45", "46"],
        total_qty: { "45": 1, "46": 1 },
        reason_ids: { "45": 2, "46": 3 },
        is_checked: 0,
        is_virtual: false,
        image: [],
    };

    it('should call axiosInstance.post with the correct URL and payload, and return data on success', async () => {
        // Arrange: Define what a successful response should look like
        const mockSuccessResponse: string = "123";

        // Arrange: Configure the mock to simulate a successful API call
        // We resolve with { data: ... } to mimic the structure of an Axios response.
        mockedAxiosPost.mockResolvedValueOnce({ data: mockSuccessResponse });
        
        // Act: Call the function we are testing
        const result = await createRma(mockPayload);
        
        // Assert: Check if the function behaved as expected
        // 1. Was axiosInstance.post called one time?
        expect(mockedAxiosPost).toHaveBeenCalledTimes(1);

        // 2. Was it called with the correct endpoint and data?
        expect(mockedAxiosPost).toHaveBeenCalledWith(
            'rest/V1/rmaapi', // The URL from your function
            { data: mockPayload }  // The body from your function
        );

        // 3. Did the createRma function return the expected data?
        expect(result).toEqual(mockSuccessResponse);
    });

    it('should throw an error when the API call fails', async () => {
        // Arrange: Define the error that the mock should throw
        const mockError = new Error('API request failed with status 500');

        // Arrange: Configure the mock to simulate a failed API call
        mockedAxiosPost.mockRejectedValueOnce(mockError);

        // Act & Assert:
        // We expect that calling createRma will result in a rejected promise.
        // The .rejects.toThrow() matcher is perfect for this.
        await expect(createRma(mockPayload)).rejects.toThrow('API request failed with status 500');

        // We can also assert that the post method was still called
        expect(mockedAxiosPost).toHaveBeenCalledTimes(1);
        expect(mockedAxiosPost).toHaveBeenCalledWith(
            'rest/V1/rmaapi',
            { data: mockPayload }
        );
    });
});