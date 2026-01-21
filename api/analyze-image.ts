import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Detect media type from base64 data
    const mediaType = getMediaType(imageBase64);

    // Get today's date for expiry calculation
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const prompt = `TODAY'S DATE: ${todayStr}

You are analyzing an image for a GROCERY/PANTRY management app called Pantrix.

FIRST: Determine what type of image this is:
- If it's a grocery RECEIPT → extract food items
- If it's FOOD/GROCERY products → identify them and count quantity
- If it's NEITHER (person, selfie, random object, document, screenshot, etc.) → return "unknown"

IMPORTANT RULES:
1. COUNT the actual number of food items visible (e.g., 3 apples, 2 bananas)
2. Calculate expiry dates from TODAY (${todayStr}) using typical shelf life
3. Be STRICT - if it's not clearly food or a receipt, return "unknown"

SHELF LIFE GUIDE:
- Produce (fruits/vegetables): 5-7 days
- Dairy (milk, cheese, yogurt): 7-14 days
- Meat/Poultry: 3-5 days
- Bakery (bread, pastries): 5-7 days
- Frozen items: 30-90 days
- Canned goods: 1+ year
- Beverages: 7-30 days

---

If it's a RECEIPT with grocery items:
{
  "type": "receipt",
  "receiptData": {
    "store": "Store name if visible",
    "date": "Date if visible",
    "items": [
      {
        "name": "Item name",
        "quantity": 1,
        "price": 2.99,
        "category": "dairy|produce|meat|bakery|frozen|beverages|snacks|canned|condiments|grains|other",
        "confidence": "high|medium|low"
      }
    ],
    "total": 0.00
  }
}

---

If it's FOOD PRODUCTS (actual groceries/food items):
{
  "type": "product",
  "productData": {
    "name": "Product name (e.g., Apple, Banana, Milk carton)",
    "brand": "Brand if visible",
    "quantity": <ACTUAL COUNT of items in image - look carefully!>,
    "category": "dairy|produce|meat|bakery|frozen|beverages|snacks|canned|condiments|grains|other",
    "estimatedExpiry": "YYYY-MM-DD",
    "confidence": "high|medium|low"
  }
}

---

If it's NOT food/groceries or receipt (person, selfie, object, document, screenshot, pet, landscape, etc.):
{
  "type": "unknown",
  "error": "<Friendly message explaining what you see and asking for food/receipt>",
  "detected": "person|selfie|document|object|screenshot|unclear|other"
}

EXAMPLES of "unknown" responses:
- Selfie/face: {"type": "unknown", "error": "I see a person, but I need a photo of food items or a grocery receipt to help you track your pantry!", "detected": "selfie"}
- Random object: {"type": "unknown", "error": "That doesn't look like food. Please take a photo of groceries or a shopping receipt.", "detected": "object"}
- Blurry image: {"type": "unknown", "error": "The image is too blurry to identify. Please take a clearer photo.", "detected": "unclear"}
- Document/text: {"type": "unknown", "error": "This looks like a document but not a grocery receipt. Please upload a shopping receipt or photo of food.", "detected": "document"}

---

Return ONLY valid JSON, no other text.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return res.status(response.status).json({ 
        error: `Anthropic API error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    
    const textContent = data.content?.find((c: any) => c.type === 'text');
    if (!textContent?.text) {
      return res.status(500).json({ error: 'No text response from Claude' });
    }

    let result;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(textContent.text);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text);
      return res.status(500).json({ 
        error: 'Failed to parse response',
        rawResponse: textContent.text 
      });
    }

    // Validate and fix expiry date if it's in the past
    if (result.type === 'product' && result.productData?.estimatedExpiry) {
      const expiry = new Date(result.productData.estimatedExpiry);
      if (expiry < today) {
        const daysToAdd = getShelfLifeDays(result.productData.category);
        result.productData.estimatedExpiry = addDays(today, daysToAdd);
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in analyze-image:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Detect media type from base64 data signature
 */
function getMediaType(base64: string): string {
  // Check first few characters of base64 for file signature
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw')) return 'image/png';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('AAAA')) return 'image/heic'; // HEIC/HEIF
  
  // Default to JPEG as it's most common
  return 'image/jpeg';
}

/**
 * Add days to a date and return YYYY-MM-DD string
 */
function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

/**
 * Get typical shelf life in days based on category
 */
function getShelfLifeDays(category: string): number {
  const shelfLife: Record<string, number> = {
    produce: 7,
    dairy: 10,
    meat: 4,
    bakery: 5,
    frozen: 60,
    beverages: 30,
    snacks: 90,
    canned: 365,
    condiments: 180,
    grains: 180,
    other: 14,
  };
  return shelfLife[category?.toLowerCase()] || 14;
}
