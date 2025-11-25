// Proxy-based Anthropic API client for browser usage
// This calls a backend proxy server to avoid CORS issues

const PROXY_URL = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001';

export async function analyzeImageViaProxy(imageBase64: string): Promise<{
  type: 'receipt' | 'product';
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
    category: string;
    estimatedExpiry?: string;
    confidence: 'high' | 'medium' | 'low';
  };
}> {
  try {
    const response = await fetch(`${PROXY_URL}/api/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Proxy API error:', error);
    throw error;
  }
}

