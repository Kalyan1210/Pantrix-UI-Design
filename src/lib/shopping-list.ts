// Shopping list utilities

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  priority: 'urgent' | 'normal';
  reason: 'expiring' | 'low' | 'manual' | 'expired';
  completed: boolean;
  completedAt?: number;
}

const STORAGE_KEY = 'shopping_list_items';

export function getShoppingList(): ShoppingItem[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading shopping list:', e);
    }
  }
  return [];
}

export function saveShoppingList(items: ShoppingItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToShoppingList(item: {
  name: string;
  quantity: number;
  category: string;
  reason: 'expiring' | 'low' | 'manual' | 'expired';
}): ShoppingItem {
  const items = getShoppingList();
  
  // Check if item already exists (by name, case-insensitive)
  const existingIndex = items.findIndex(
    i => i.name.toLowerCase() === item.name.toLowerCase() && !i.completed
  );
  
  if (existingIndex !== -1) {
    // Update quantity of existing item
    items[existingIndex].quantity += item.quantity;
    saveShoppingList(items);
    return items[existingIndex];
  }
  
  // Create new item
  const newItem: ShoppingItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: item.name,
    quantity: item.quantity,
    category: item.category,
    priority: item.reason === 'expiring' || item.reason === 'expired' ? 'urgent' : 'normal',
    reason: item.reason,
    completed: false,
  };
  
  items.push(newItem);
  saveShoppingList(items);
  return newItem;
}

export function removeFromShoppingList(id: string): void {
  const items = getShoppingList();
  const filtered = items.filter(item => item.id !== id);
  saveShoppingList(filtered);
}

export function toggleShoppingItem(id: string): void {
  const items = getShoppingList();
  const updated = items.map(item =>
    item.id === id
      ? { ...item, completed: !item.completed, completedAt: !item.completed ? Date.now() : undefined }
      : item
  );
  saveShoppingList(updated);
}

export function getActiveShoppingCount(): number {
  const items = getShoppingList();
  return items.filter(item => !item.completed).length;
}

export function addMultipleToShoppingList(itemsToAdd: {
  name: string;
  quantity: number;
  category: string;
  reason: 'expiring' | 'low' | 'manual' | 'expired';
}[]): void {
  itemsToAdd.forEach(item => addToShoppingList(item));
}
