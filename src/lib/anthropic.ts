import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Don't throw error on import - check at runtime instead
let anthropic: Anthropic | null = null;

if (apiKey && apiKey !== 'your_anthropic_api_key_here') {
  try {
    anthropic = new Anthropic({
      apiKey: apiKey,
    });
  } catch (error) {
    console.error('Failed to initialize Anthropic client:', error);
  }
}

export { anthropic };

// Category mapping for location assignment
const categoryLocationMap: Record<string, 'fridge' | 'freezer' | 'pantry' | 'counter'> = {
  'dairy': 'fridge',
  'meat': 'fridge',
  'seafood': 'fridge',
  'produce': 'fridge',
  'vegetables': 'fridge',
  'fruits': 'counter',
  'frozen': 'freezer',
  'beverages': 'fridge',
  'condiments': 'fridge',
  'snacks': 'pantry',
  'grains': 'pantry',
  'canned': 'pantry',
  'bakery': 'counter',
  'default': 'pantry',
};

// Estimate expiry dates based on category
const categoryExpiryDays: Record<string, number> = {
  'dairy': 7,
  'meat': 3,
  'seafood': 2,
  'produce': 5,
  'vegetables': 7,
  'fruits': 5,
  'frozen': 90,
  'beverages': 30,
  'condiments': 60,
  'snacks': 90,
  'grains': 365,
  'canned': 365,
  'bakery': 3,
  'default': 7,
};

export function getLocationForCategory(category: string): 'fridge' | 'freezer' | 'pantry' | 'counter' {
  const normalizedCategory = category.toLowerCase();
  return categoryLocationMap[normalizedCategory] || categoryLocationMap['default'];
}

export function estimateExpiryDate(category: string): Date {
  const normalizedCategory = category.toLowerCase();
  const days = categoryExpiryDays[normalizedCategory] || categoryExpiryDays['default'];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}

export async function parseReceipt(imageBase64: string): Promise<{
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
}> {
  try {
    if (!anthropic) {
      throw new Error('Anthropic API client not initialized. Please check your API key in .env file.');
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this receipt image and extract all items with their details. Return a JSON object with this exact structure:
{
  "items": [
    {
      "name": "item name",
      "quantity": 1,
      "price": 0.00,
      "category": "dairy|meat|seafood|produce|vegetables|fruits|frozen|beverages|condiments|snacks|grains|canned|bakery|other",
      "confidence": "high|medium|low"
    }
  ],
  "total": 0.00,
  "store": "store name if visible",
  "date": "YYYY-MM-DD if visible"
}

Be thorough and extract all items. If you're uncertain about any field, use "medium" or "low" confidence. Categories should be one of: dairy, meat, seafood, produce, vegetables, fruits, frozen, beverages, condiments, snacks, grains, canned, bakery, or other.`,
            },
          ],
        },
      ],
    });

    const textContent = message.content[0];
    if (textContent.type === 'text') {
      // Extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    }

    throw new Error('Failed to parse receipt data');
  } catch (error) {
    console.error('Error parsing receipt:', error);
    throw error;
  }
}

export async function parseProduct(imageBase64: string): Promise<{
  name: string;
  category: string;
  estimatedExpiry?: string;
  confidence: 'high' | 'medium' | 'low';
}> {
  try {
    if (!anthropic) {
      throw new Error('Anthropic API client not initialized. Please check your API key in .env file.');
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this product image (packaging, label, or product itself) and extract product information. Return a JSON object with this exact structure:
{
  "name": "product name",
  "category": "dairy|meat|seafood|produce|vegetables|fruits|frozen|beverages|condiments|snacks|grains|canned|bakery|other",
  "estimatedExpiry": "YYYY-MM-DD if visible on packaging",
  "confidence": "high|medium|low"
}

If you see an expiry date on the packaging, include it. Otherwise, estimate based on the product type. Categories should be one of: dairy, meat, seafood, produce, vegetables, fruits, frozen, beverages, condiments, snacks, grains, canned, bakery, or other.`,
            },
          ],
        },
      ],
    });

    const textContent = message.content[0];
    if (textContent.type === 'text') {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    }

    throw new Error('Failed to parse product data');
  } catch (error) {
    console.error('Error parsing product:', error);
    throw error;
  }
}

// Helper function to compress image if needed
function compressImageIfNeeded(imageBase64: string, maxSizeKB: number = 5000): string {
  // Calculate approximate size in KB (base64 is ~33% larger than binary)
  const sizeKB = (imageBase64.length * 3) / 4 / 1024;
  
  if (sizeKB <= maxSizeKB) {
    return imageBase64;
  }

  // If image is too large, we'll need to compress it
  // For now, return as-is and let the API handle it
  // In production, you might want to use canvas to resize
  console.warn(`Image size is ${sizeKB.toFixed(2)}KB, which may be too large`);
  return imageBase64;
}

// Unified function to analyze any image - detects if it's a receipt or product
export async function analyzeImage(imageBase64: string): Promise<{
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
    // Check if API key is set
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      throw new Error('Anthropic API key is not configured. Please check your .env file.');
    }

    if (!anthropic) {
      throw new Error('Anthropic API client not initialized. Please check your API key in .env file.');
    }

    // Compress image if needed (Anthropic has a 5MB limit)
    const processedImage = compressImageIfNeeded(imageBase64, 5000);

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout: The API took too long to respond. Please try again.')), 60000); // 60 second timeout
    });

    // First, detect what type of image it is
    const detectionPromise = anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: processedImage,
              },
            },
            {
              type: 'text',
              text: `Look at this image and determine if it's a RECEIPT (shopping receipt with multiple items and prices) or a PRODUCT (single product packaging, label, or item). 

Return ONLY a JSON object with this exact structure:
{
  "type": "receipt" or "product"
}

Be accurate - receipts have multiple items listed, totals, store names. Products are single items with packaging or labels.`,
            },
          ],
        },
      ],
    });

    const detectionMessage = await Promise.race([detectionPromise, timeoutPromise]) as any;

    const detectionText = detectionMessage.content[0];
    let imageType: 'receipt' | 'product' = 'product';
    
    if (detectionText.type === 'text') {
      const jsonMatch = detectionText.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        imageType = parsed.type === 'receipt' ? 'receipt' : 'product';
      }
    }

    // Now parse based on the detected type
    if (imageType === 'receipt') {
      const receiptData = await parseReceipt(processedImage);
      return {
        type: 'receipt',
        receiptData,
      };
    } else {
      const productData = await parseProduct(processedImage);
      return {
        type: 'product',
        productData,
      };
    }
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusCode: error.statusCode,
      code: error.code,
      cause: error.cause,
      stack: error.stack,
    });
    
    // Provide more specific error messages
    if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      throw new Error('API key error: Please check your Anthropic API key in .env file');
    } else if (error.status === 401 || error.statusCode === 401) {
      throw new Error('Authentication failed: Invalid API key. Please verify your API key is correct.');
    } else if (error.status === 429 || error.statusCode === 429) {
      throw new Error('Rate limit exceeded: Please wait a moment and try again.');
    } else if (error.status === 400 || error.statusCode === 400) {
      throw new Error('Invalid request: Image may be too large or corrupted. Please try a different image.');
    } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      throw new Error('Request timeout: The API took too long to respond. Please try again.');
    } else if (error.message?.includes('CORS') || error.message?.includes('cors') || error.code === 'ERR_NETWORK') {
      throw new Error('CORS error: The API cannot be called directly from the browser. Please set up a backend proxy or use a serverless function.');
    } else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch') || error.code === 'ERR_NETWORK') {
      throw new Error('Network error: Please check your internet connection. If this persists, the API may need to be called from a backend server due to CORS restrictions.');
    } else if (error.message?.includes('Connection') || error.message?.includes('connection')) {
      throw new Error('Connection error: Unable to reach the API. This may be due to CORS restrictions. The Anthropic API typically requires a backend proxy when called from a browser.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Connection error: Unable to reach the API. Please check your internet connection and API key. Note: The Anthropic API may require a backend proxy due to CORS restrictions.');
    }
  }
}

