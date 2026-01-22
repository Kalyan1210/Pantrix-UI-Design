import { useState, useEffect } from "react";
import { ArrowLeft, Clock, ChefHat, Check, Plus, Sparkles, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { getInventoryItems, calculateDaysUntilExpiry } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { hapticLight, hapticMedium, hapticSuccess } from "../lib/haptics";
import { Skeleton } from "./ui/skeleton-loader";
import { toast } from "sonner";

interface RecipesScreenProps {
  onBack: () => void;
}

interface Recipe {
  id: string;
  name: string;
  prepTime: string;
  matchedIngredients: string[];
  missingIngredients: string[];
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  usesExpiring: boolean;
}

// Recipe database - maps ingredients to possible recipes
const recipeDatabase: Recipe[] = [
  {
    id: '1',
    name: 'Quick Stir Fry',
    prepTime: '15 min',
    matchedIngredients: ['chicken', 'vegetables', 'rice'],
    missingIngredients: ['soy sauce', 'garlic'],
    emoji: '🥘',
    difficulty: 'easy',
    servings: 2,
    usesExpiring: false,
  },
  {
    id: '2',
    name: 'Fresh Fruit Salad',
    prepTime: '10 min',
    matchedIngredients: ['apples', 'bananas', 'strawberries', 'grapes'],
    missingIngredients: ['honey', 'mint'],
    emoji: '🥗',
    difficulty: 'easy',
    servings: 4,
    usesExpiring: false,
  },
  {
    id: '3',
    name: 'Classic Omelette',
    prepTime: '10 min',
    matchedIngredients: ['eggs', 'cheese', 'milk'],
    missingIngredients: ['butter'],
    emoji: '🍳',
    difficulty: 'easy',
    servings: 1,
    usesExpiring: false,
  },
  {
    id: '4',
    name: 'Banana Smoothie',
    prepTime: '5 min',
    matchedIngredients: ['bananas', 'milk', 'yogurt'],
    missingIngredients: ['honey'],
    emoji: '🥤',
    difficulty: 'easy',
    servings: 2,
    usesExpiring: false,
  },
  {
    id: '5',
    name: 'Grilled Chicken Salad',
    prepTime: '20 min',
    matchedIngredients: ['chicken', 'lettuce', 'tomatoes'],
    missingIngredients: ['dressing', 'croutons'],
    emoji: '🥙',
    difficulty: 'medium',
    servings: 2,
    usesExpiring: false,
  },
  {
    id: '6',
    name: 'Pasta Primavera',
    prepTime: '25 min',
    matchedIngredients: ['pasta', 'vegetables', 'cheese'],
    missingIngredients: ['olive oil', 'garlic'],
    emoji: '🍝',
    difficulty: 'medium',
    servings: 4,
    usesExpiring: false,
  },
  {
    id: '7',
    name: 'Vegetable Soup',
    prepTime: '30 min',
    matchedIngredients: ['carrots', 'celery', 'onions', 'potatoes'],
    missingIngredients: ['broth', 'herbs'],
    emoji: '🍲',
    difficulty: 'easy',
    servings: 6,
    usesExpiring: false,
  },
  {
    id: '8',
    name: 'Rice Bowl',
    prepTime: '20 min',
    matchedIngredients: ['rice', 'vegetables', 'protein'],
    missingIngredients: ['sauce'],
    emoji: '🍚',
    difficulty: 'easy',
    servings: 2,
    usesExpiring: false,
  },
  {
    id: '9',
    name: 'Breakfast Wrap',
    prepTime: '15 min',
    matchedIngredients: ['eggs', 'tortillas', 'cheese', 'vegetables'],
    missingIngredients: ['salsa'],
    emoji: '🌯',
    difficulty: 'easy',
    servings: 2,
    usesExpiring: false,
  },
  {
    id: '10',
    name: 'Apple Cinnamon Toast',
    prepTime: '10 min',
    matchedIngredients: ['bread', 'apples', 'butter'],
    missingIngredients: ['cinnamon', 'sugar'],
    emoji: '🍞',
    difficulty: 'easy',
    servings: 2,
    usesExpiring: false,
  },
];

export function RecipesScreen({ onBack }: RecipesScreenProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<string[]>([]);
  const [expiringItems, setExpiringItems] = useState<string[]>([]);

  useEffect(() => {
    loadRecipeSuggestions();
  }, []);

  const loadRecipeSuggestions = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const items = await getInventoryItems(user.id);
      
      // Get item names (lowercase for matching)
      const itemNames = items.map(item => item.name.toLowerCase());
      setInventoryItems(itemNames);
      
      // Get expiring items (within 5 days)
      const expiring = items
        .filter(item => {
          const days = calculateDaysUntilExpiry(item.expiry_date);
          return days !== null && days <= 5;
        })
        .map(item => item.name.toLowerCase());
      setExpiringItems(expiring);

      // Match recipes to inventory
      const matchedRecipes = recipeDatabase.map(recipe => {
        const matched = recipe.matchedIngredients.filter(ing => 
          itemNames.some(item => item.includes(ing) || ing.includes(item))
        );
        const missing = recipe.matchedIngredients.filter(ing => 
          !itemNames.some(item => item.includes(ing) || ing.includes(item))
        );
        
        // Check if recipe uses expiring items
        const usesExpiring = matched.some(m => 
          expiring.some(exp => exp.includes(m) || m.includes(exp))
        );

        return {
          ...recipe,
          matchedIngredients: matched,
          missingIngredients: [...missing, ...recipe.missingIngredients],
          usesExpiring,
        };
      });

      // Sort: recipes using expiring items first, then by number of matched ingredients
      matchedRecipes.sort((a, b) => {
        if (a.usesExpiring && !b.usesExpiring) return -1;
        if (!a.usesExpiring && b.usesExpiring) return 1;
        return b.matchedIngredients.length - a.matchedIngredients.length;
      });

      // Filter to recipes with at least 1 matched ingredient
      const relevantRecipes = matchedRecipes.filter(r => r.matchedIngredients.length > 0);
      
      setRecipes(relevantRecipes.slice(0, 6));
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const addMissingToShoppingList = (ingredients: string[]) => {
    hapticSuccess();
    const existingList = JSON.parse(localStorage.getItem('shopping_list_items') || '[]');
    const newItems = ingredients.map(ing => ({
      id: Date.now().toString() + Math.random(),
      name: ing,
      quantity: '1',
      completed: false,
      addedAt: new Date().toISOString()
    }));
    localStorage.setItem('shopping_list_items', JSON.stringify([...existingList, ...newItems]));
    toast.success(`Added ${ingredients.length} items to shopping list`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-primary/10 text-primary border-primary/20';
      case 'medium': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8 safe-area-top">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 animate-fade-in">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="touch-feedback"
            onClick={() => {
              hapticLight();
              onBack();
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium flex-1">Recipe Ideas</h1>
          <Button
            variant="ghost"
            size="icon"
            className="touch-feedback"
            onClick={() => {
              hapticMedium();
              loadRecipeSuggestions();
            }}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Hero section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-secondary" />
            <h2 className="font-medium">What can you make?</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Recipes based on what's in your pantry
            {expiringItems.length > 0 && (
              <span className="text-secondary"> • Using {expiringItems.length} expiring item{expiringItems.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2 font-medium">No recipe matches</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Add more items to your pantry to get recipe suggestions!
            </p>
            <Button onClick={onBack} className="touch-feedback">
              Go to Inventory
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe, index) => (
              <Card 
                key={recipe.id} 
                className={`overflow-hidden card-interactive ${
                  recipe.usesExpiring ? 'ring-2 ring-secondary/30' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Recipe header with emoji */}
                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-card shadow-sm flex items-center justify-center text-4xl">
                    {recipe.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{recipe.name}</h3>
                      {recipe.usesExpiring && (
                        <Badge variant="secondary" className="text-xs">
                          Uses expiring items
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </Badge>
                      <span>{recipe.servings} servings</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-3">
                  {/* Matched Ingredients */}
                  {recipe.matchedIngredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-muted-foreground text-xs mb-2">You have:</p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.matchedIngredients.map((ingredient, idx) => (
                          <Badge key={idx} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            <Check className="w-3 h-3 mr-1" />
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Ingredients */}
                  {recipe.missingIngredients.length > 0 && (
                    <div className="mb-4">
                      <p className="text-muted-foreground text-xs mb-2">You need:</p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.missingIngredients.slice(0, 4).map((ingredient, idx) => (
                          <Badge key={idx} variant="outline" className="text-muted-foreground">
                            {ingredient}
                          </Badge>
                        ))}
                        {recipe.missingIngredients.length > 4 && (
                          <Badge variant="outline" className="text-muted-foreground">
                            +{recipe.missingIngredients.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 touch-feedback"
                      onClick={() => {
                        hapticMedium();
                        // In a real app, this would open recipe details
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(recipe.name + ' recipe')}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Find Recipe
                    </Button>
                    {recipe.missingIngredients.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="touch-feedback"
                        onClick={() => addMissingToShoppingList(recipe.missingIngredients)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tip */}
        {recipes.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-muted/50 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-sm text-muted-foreground">
              💡 Tip: Add more items to your pantry to unlock more recipe ideas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
