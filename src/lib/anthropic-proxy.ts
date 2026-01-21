// Anthropic API client using Vercel serverless function
// This calls /api/analyze-image to avoid CORS issues

export interface AnalysisResult {
  type: 'receipt' | 'product' | 'unknown';
  receiptData?: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      category: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
    total?: number;
    store?: string;
    date?: string;
  };
  productData?: {
    name: string;
    brand?: string;
    quantity?: number;
    category: string;
    estimatedExpiry?: string;
    confidence: 'high' | 'medium' | 'low';
  };
  error?: string;
  detected?: string;
}

export async function analyzeImageViaProxy(imageBase64: string): Promise<AnalysisResult> {
  try {
    // Use relative URL - works both locally and on Vercel
    const apiUrl = '/api/analyze-image';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }

    const data: AnalysisResult = await response.json();
    
    // Handle "unknown" type with friendly, specific messages
    if (data.type === 'unknown') {
      // Use the error message from Claude, or generate a friendly one
      const friendlyMessage = data.error || getFriendlyErrorMessage(data.detected);
      throw new Error(friendlyMessage);
    }
    
    return data;
  } catch (error: any) {
    console.error('Image analysis error:', error);
    throw new Error(
      error.message || 'Unable to analyze this image. Please try a photo of food items or a grocery receipt.'
    );
  }
}

/**
 * Generate friendly error messages based on what was detected
 */
function getFriendlyErrorMessage(detected?: string): string {
  switch (detected) {
    case 'person':
    case 'selfie':
      return "😊 I see a person! But I need a photo of food items or a grocery receipt to help you track your pantry.";
    case 'document':
      return "📄 This looks like a document, but not a grocery receipt. Please upload a shopping receipt or photo of food.";
    case 'screenshot':
      return "📱 Please take a photo of actual food items, not a screenshot.";
    case 'object':
      return "🤔 I don't recognize any food items here. Please try a photo of groceries or a shopping receipt.";
    case 'unclear':
      return "😵 The image is too blurry or unclear. Please take a clearer photo.";
    default:
      return "🤔 Hmm, I can't identify any food in this image. Please try a photo of groceries or a shopping receipt!";
  }
}
