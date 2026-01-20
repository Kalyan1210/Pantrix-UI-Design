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

    // Detect if it's a receipt or product
    const prompt = `Analyze this image and determine if it's a grocery receipt or a food/grocery product.

If it's a RECEIPT, extract all food/grocery items and return JSON like:
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

If it's a PRODUCT, identify the product and return JSON like:
{
  "type": "product",
  "productData": {
    "name": "Product name",
    "brand": "Brand if visible",
    "category": "dairy|produce|meat|bakery|frozen|beverages|snacks|canned|condiments|grains|other",
    "estimatedExpiry": "YYYY-MM-DD (estimate based on typical shelf life)",
    "confidence": "high|medium|low"
  }
}

If you cannot identify the image as either, return:
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
    
    // Extract the text content from Claude's response
    const textContent = data.content?.find((c: any) => c.type === 'text');
    if (!textContent?.text) {
      return res.status(500).json({ error: 'No text response from Claude' });
    }

    // Parse the JSON from Claude's response
    let result;
    try {
      // Try to extract JSON from the response (in case there's extra text)
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

    // Set CORS headers
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

