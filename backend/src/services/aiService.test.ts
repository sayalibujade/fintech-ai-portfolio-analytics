import { GoogleGenAI } from '@google/genai';
import { analyzePortfolioContext } from './aiService';

jest.mock("@google/genai", () => {
    const  mockGenerateContentFn = jest.fn();
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({
            models: {
                generateContent: mockGenerateContentFn
            }
        }))
    };
});

describe('AI Service', () => {
    let analyzeContextFn: any;
    let mockGenerateContent: jest.Mock;

    beforeAll(async () => {
        const aiModule = await import('./aiService');
        analyzeContextFn = aiModule.analyzePortfolioContext;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        jest.spyOn(console, 'error').mockImplementation(() => {});

        const mockClientInstance = new GoogleGenAI({ apiKey: 'test' }) as any;
        mockGenerateContent = mockClientInstance.models.generateContent;
    });

    it('should pass contextual strings to Gemini models and return the parsed response text', async () => {
        mockGenerateContent.mockResolvedValue({
            text: '#### Valuation Synthesis\n- Allocations are optimized with neutral risk profiles.'
        });

        const mockPortfolio = { holdings: [{ symbol: 'AAPL', shares: 10 }] };
        const userPrompt = 'Provide macro risk analysis targeting my current tech allocation weights.';

        const analysisResult = await analyzeContextFn(userPrompt, mockPortfolio);

        expect(mockGenerateContent).toHaveBeenCalledWith({
            model: 'gemini-3.8-flash',
            contents: [
                { text: 'Portfolio Context: {"holdings":[{"symbol":"AAPL","shares":10}]}' },
                { text: 'User Question: Provide macro risk analysis targeting my current tech allocation weights.' }
            ],
            config: {
                systemInstruction: expect.any(String),
                temperature: 0.2
            }
        });
        expect(analysisResult).toBe('#### Valuation Synthesis\n- Allocations are optimized with neutral risk profiles.');
    });

    it('should fallback to a standard message string if the model response contains empty text params', async () => {
        mockGenerateContent.mockResolvedValue({
            text: null
        });

        const result = await analyzeContextFn('Check weights', {});
        expect(result).toBe('Unable to generate analysis');
    });

    it('should trace execution errors inside console logs throw exceptions when the SDK pipeline drops', async () => {
        const sdkNetworkCrashError = new Error('API operational socket limit quota exceeded.');
        mockGenerateContent.mockRejectedValue(sdkNetworkCrashError);

        await expect(analyzePortfolioContext('Analyze', {}))
            .rejects
            .toThrow(sdkNetworkCrashError);

        expect(console.error).toHaveBeenCalledWith('Gemini SDK Execution failure:', sdkNetworkCrashError)
    });
});