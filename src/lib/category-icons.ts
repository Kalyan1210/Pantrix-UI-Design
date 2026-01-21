// Category-based emoji icons for items

export const categoryIcons: Record<string, string> = {
  produce: '🥬',
  dairy: '🥛',
  meat: '🍖',
  bakery: '🍞',
  frozen: '🧊',
  beverages: '🥤',
  snacks: '🍿',
  canned: '🥫',
  condiments: '🧂',
  grains: '🌾',
  seafood: '🐟',
  eggs: '🥚',
  other: '📦',
};

// Specific item icons for common items
export const itemIcons: Record<string, string> = {
  // Produce
  apple: '🍎',
  apples: '🍎',
  banana: '🍌',
  bananas: '🍌',
  orange: '🍊',
  oranges: '🍊',
  strawberry: '🍓',
  strawberries: '🍓',
  grapes: '🍇',
  lemon: '🍋',
  lemons: '🍋',
  watermelon: '🍉',
  peach: '🍑',
  peaches: '🍑',
  pear: '🍐',
  pears: '🍐',
  cherry: '🍒',
  cherries: '🍒',
  tomato: '🍅',
  tomatoes: '🍅',
  carrot: '🥕',
  carrots: '🥕',
  corn: '🌽',
  broccoli: '🥦',
  lettuce: '🥬',
  cucumber: '🥒',
  avocado: '🥑',
  potato: '🥔',
  potatoes: '🥔',
  onion: '🧅',
  onions: '🧅',
  garlic: '🧄',
  pepper: '🌶️',
  peppers: '🫑',
  mushroom: '🍄',
  mushrooms: '🍄',
  
  // Dairy
  milk: '🥛',
  cheese: '🧀',
  butter: '🧈',
  yogurt: '🥛',
  egg: '🥚',
  eggs: '🥚',
  
  // Meat & Protein
  chicken: '🍗',
  'chicken thighs': '🍗',
  'chicken breast': '🍗',
  'chicken wings': '🍗',
  beef: '🥩',
  steak: '🥩',
  pork: '🥓',
  bacon: '🥓',
  ham: '🍖',
  sausage: '🌭',
  turkey: '🦃',
  fish: '🐟',
  salmon: '🐟',
  shrimp: '🦐',
  
  // Bakery
  bread: '🍞',
  croissant: '🥐',
  bagel: '🥯',
  cake: '🎂',
  cookie: '🍪',
  cookies: '🍪',
  pie: '🥧',
  donut: '🍩',
  
  // Beverages
  coffee: '☕',
  tea: '🍵',
  juice: '🧃',
  water: '💧',
  soda: '🥤',
  wine: '🍷',
  beer: '🍺',
  
  // Snacks
  chips: '🍟',
  popcorn: '🍿',
  pretzel: '🥨',
  chocolate: '🍫',
  candy: '🍬',
  
  // Condiments
  salt: '🧂',
  honey: '🍯',
  ketchup: '🍅',
  
  // Grains
  rice: '🍚',
  pasta: '🍝',
  noodles: '🍜',
  cereal: '🥣',
};

/**
 * Get the appropriate emoji icon for an item
 * First checks for specific item match, then falls back to category
 */
export function getItemIcon(itemName: string, category?: string): string {
  const name = itemName.toLowerCase().trim();
  
  // Check for specific item icon
  if (itemIcons[name]) {
    return itemIcons[name];
  }
  
  // Check for partial matches
  for (const [key, icon] of Object.entries(itemIcons)) {
    if (name.includes(key) || key.includes(name)) {
      return icon;
    }
  }
  
  // Fall back to category icon
  if (category && categoryIcons[category.toLowerCase()]) {
    return categoryIcons[category.toLowerCase()];
  }
  
  return '📦'; // Default icon
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  return categoryIcons[category?.toLowerCase()] || '📦';
}

