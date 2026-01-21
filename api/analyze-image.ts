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

    // Get today's date for expiry calculation
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const prompt = `TODAY'S DATE: ${todayStr}

Analyze this image and determine if it's a grocery receipt or food/grocery product(s).

IMPORTANT INSTRUCTIONS:
1. COUNT the actual number of items visible in the image carefully
2. Calculate expiry dates from TODAY (${todayStr}), not arbitrary past dates
3. Use typical shelf life: produce (5-7 days), dairy (7-14 days), meat (3-5 days), bakery (5-7 days), frozen (30+ days), canned (1+ year)

If it's a RECEIPT, extract all food/grocery items:
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

If it's a PRODUCT or PRODUCTS, identify what you see:
{
  "type": "product",
  "productData": {
    "name": "Product name (e.g., Apples, Bananas, Milk)",
    "brand": "Brand if visible",
    "quantity": <COUNT THE ACTUAL NUMBER OF ITEMS IN THE IMAGE>,
    "category": "dairy|produce|meat|bakery|frozen|beverages|snacks|canned|condiments|grains|other",
    "estimatedExpiry": "YYYY-MM-DD (calculate from ${todayStr} + typical shelf life)",
    "confidence": "high|medium|low"
  }
}

EXAMPLES of correct expiry calculation from today (${todayStr}):
- Apples: ${addDays(today, 7)} (7 days)
- Milk: ${addDays(today, 10)} (10 days)
- Chicken: ${addDays(today, 3)} (3 days)
- Bread: ${addDays(today, 5)} (5 days)

If you cannot identify the image:
{
  "type": "unknown",
  "error": "Could not identify as receipt or product"
}

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
                  media_type: 'image/jpeg',
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
        // Expiry is in past, recalculate based on category
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

// Helper function to add days to a date
function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

// Get typical shelf life in days based on category
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
