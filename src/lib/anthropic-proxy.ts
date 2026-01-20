// Anthropic API client using Vercel serverless function
// This calls /api/analyze-image to avoid CORS issues

export async function analyzeImageViaProxy(imageBase64: string): Promise<{
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
    category: string;
    estimatedExpiry?: string;
    confidence: 'high' | 'medium' | 'low';
  };
  error?: string;
}> {
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

    const data = await response.json();
    
    // Handle error response from Claude
    if (data.type === 'unknown') {
      throw new Error(data.error || 'Could not identify the image');
    }
    
    return data;
  } catch (error: any) {
    console.error('Image analysis error:', error);
    throw new Error(
      error.message || 'Connection error: Unable to reach the API. This may be due to CORS restrictions.'
    );
  }
}
