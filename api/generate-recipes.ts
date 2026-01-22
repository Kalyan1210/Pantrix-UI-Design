import type { VercelRequest, VercelResponse } from '@vercel/node';

interface InventoryItem {
  name: string;
  quantity: number;
  daysUntilExpiry: number | null;
  category: string;
}

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  prepTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  instructions: string[];
  tip?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body as { items: InventoryItem[] };

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        error: 'No inventory items provided',
        recipes: []
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Format inventory for Claude
    const expiringItems = items
      .filter(item => item.daysUntilExpiry !== null && item.daysUntilExpiry <= 5)
      .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999));
    
    const otherItems = items.filter(
      item => item.daysUntilExpiry === null || item.daysUntilExpiry > 5
    );

    const inventoryDescription = `
EXPIRING SOON (USE FIRST):
${expiringItems.length > 0 
  ? expiringItems.map(i => `- ${i.name} (qty: ${i.quantity}, expires in ${i.daysUntilExpiry} days)`).join('\n')
  : '- None'}

OTHER AVAILABLE ITEMS:
${otherItems.map(i => `- ${i.name} (qty: ${i.quantity})`).join('\n')}
    `.trim();

    const prompt = `You are a helpful chef assistant. Based on the user's available ingredients, suggest exactly 5 practical recipes they can make.

AVAILABLE INGREDIENTS:
${inventoryDescription}

RULES:
1. PRIORITIZE recipes that use expiring items first
2. Keep recipes simple and practical (under 30 min when possible)
3. Each recipe should use at least 2-3 of their available ingredients
4. Missing ingredients should be common pantry staples (salt, pepper, oil, etc.)
5. Vary the recipes (don't suggest 5 chicken dishes if they only have chicken)
6. Include a mix of difficulties

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "recipes": [
    {
      "id": "1",
      "name": "Recipe Name",
      "emoji": "🍳",
      "prepTime": "15 min",
      "difficulty": "easy",
      "servings": 2,
      "matchedIngredients": ["ingredient1", "ingredient2"],
      "missingIngredients": ["salt", "pepper"],
      "instructions": ["Step 1...", "Step 2...", "Step 3..."],
      "tip": "Optional cooking tip"
    }
  ]
}

Keep instructions concise (3-5 steps each). Use appropriate food emojis.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return res.status(500).json({ error: 'Failed to generate recipes' });
    }

    const data = await response.json();
    const textContent = data.content?.[0]?.text;

    if (!textContent) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Parse the JSON response
    try {
      // Clean up any potential markdown formatting
      let cleanJson = textContent.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      // Validate and ensure we have recipes
      if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
        throw new Error('Invalid recipe format');
      }

      // Take only top 5 and add IDs if missing
      const recipes: Recipe[] = parsed.recipes.slice(0, 5).map((r: any, index: number) => ({
        id: r.id || String(index + 1),
        name: r.name || 'Unnamed Recipe',
        emoji: r.emoji || '🍽️',
        prepTime: r.prepTime || '20 min',
        difficulty: r.difficulty || 'medium',
        servings: r.servings || 2,
        matchedIngredients: r.matchedIngredients || [],
        missingIngredients: r.missingIngredients || [],
        instructions: r.instructions || ['Follow your cooking instincts!'],
        tip: r.tip,
      }));

      return res.status(200).json({ 
        recipes,
        expiringCount: expiringItems.length,
        totalItems: items.length
      });
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', textContent);
      return res.status(500).json({ 
        error: 'Failed to parse recipes',
        raw: textContent 
      });
    }
  } catch (error) {
    console.error('Recipe generation error:', error);
    return res.status(500).json({ error: 'Failed to generate recipes' });
  }
}

