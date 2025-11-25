// Simple Express proxy server for Anthropic API
// This solves CORS issues when calling Anthropic API from the browser
// Run with: node api-proxy-server.js

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
});

// Proxy endpoint for image analysis
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!anthropic) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Detect image type
    const detectionMessage = await anthropic.messages.create({
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
                data: imageBase64,
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

    const detectionText = detectionMessage.content[0];
    let imageType = 'product';
    
    if (detectionText.type === 'text') {
      const jsonMatch = detectionText.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        imageType = parsed.type === 'receipt' ? 'receipt' : 'product';
      }
    }

    // Parse based on type
    if (imageType === 'receipt') {
      const receiptMessage = await anthropic.messages.create({
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

Be thorough and extract all items.`,
              },
            ],
          },
        ],
      });

      const receiptText = receiptMessage.content[0];
      if (receiptText.type === 'text') {
        const jsonMatch = receiptText.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            type: 'receipt',
            receiptData: parsed,
          });
        }
      }
    } else {
      const productMessage = await anthropic.messages.create({
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
                text: `Analyze this product image and extract product information. Return a JSON object with this exact structure:
{
  "name": "product name",
  "category": "dairy|meat|seafood|produce|vegetables|fruits|frozen|beverages|condiments|snacks|grains|canned|bakery|other",
  "estimatedExpiry": "YYYY-MM-DD if visible on packaging",
  "confidence": "high|medium|low"
}`,
              },
            ],
          },
        ],
      });

      const productText = productMessage.content[0];
      if (productText.type === 'text') {
        const jsonMatch = productText.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            type: 'product',
            productData: parsed,
          });
        }
      }
    }

    throw new Error('Failed to parse response');
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to analyze image',
      details: error.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`API Proxy server running on http://localhost:${PORT}`);
  console.log('Make sure to set VITE_ANTHROPIC_API_KEY in your .env file');
});

