import { useState, useEffect } from "react";
import { ArrowLeft, Clock, ChefHat, Check, Plus, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { getInventoryItems, calculateDaysUntilExpiry } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "../lib/haptics";
import { Skeleton } from "./ui/skeleton-loader";
import { toast } from "sonner";
import { getApiUrl } from "../lib/api-config";

interface RecipesScreenProps {
  onBack: () => void;
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

interface InventoryItemForAPI {
  name: string;
  quantity: number;
  daysUntilExpiry: number | null;
  category: string;
}

export function RecipesScreen({ onBack }: RecipesScreenProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expiringCount, setExpiringCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipeSuggestions();
  }, []);

  const loadRecipeSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        setError("Please sign in to get recipe suggestions");
        setIsLoading(false);
        return;
      }

      const items = await getInventoryItems(user.id);
      
      if (items.length === 0) {
        setError("Add items to your pantry to get personalized recipes!");
        setIsLoading(false);
        return;
      }

      setTotalItems(items.length);

      // Format items for the API
      const formattedItems: InventoryItemForAPI[] = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        daysUntilExpiry: calculateDaysUntilExpiry(item.expiry_date),
        category: item.category || 'other'
      }));

      // Count expiring items
      const expiring = formattedItems.filter(
        item => item.daysUntilExpiry !== null && item.daysUntilExpiry <= 5
      );
      setExpiringCount(expiring.length);

      // Call the AI recipe API using centralized config
      const apiUrl = getApiUrl('/api/generate-recipes');
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: formattedItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setRecipes(data.recipes || []);
      
      if (data.recipes?.length > 0) {
        toast.success(`Found ${data.recipes.length} recipes for you! 🍳`);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError("Couldn't generate recipes. Please try again.");
      hapticError();
      toast.error('Failed to generate recipes');
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

  const toggleRecipeExpand = (recipeId: string) => {
    hapticLight();
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
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
            className={`touch-feedback ${isLoading ? 'animate-spin' : ''}`}
            onClick={() => {
              hapticMedium();
              loadRecipeSuggestions();
            }}
            disabled={isLoading}
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
            <h2 className="font-medium">AI-Powered Recipes</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Personalized suggestions from {totalItems} pantry items
            {expiringCount > 0 && (
              <span className="text-secondary"> • Prioritizing {expiringCount} expiring item{expiringCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center py-4 mb-4">
              <div className="text-4xl mb-3 animate-bounce">🧑‍🍳</div>
              <p className="text-muted-foreground text-sm">
                Claude is cooking up recipe ideas...
              </p>
            </div>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2 font-medium">No recipes yet</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {error}
            </p>
            <Button onClick={onBack} className="touch-feedback">
              Go to Inventory
            </Button>
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
                className="overflow-hidden card-interactive animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Recipe header with emoji */}
                <div 
                  className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 flex items-center gap-4 cursor-pointer"
                  onClick={() => toggleRecipeExpand(recipe.id)}
                >
                  <div className="w-16 h-16 rounded-2xl bg-card shadow-sm flex items-center justify-center text-4xl">
                    {recipe.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{recipe.name}</h3>
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
                  <div className="text-muted-foreground">
                    {expandedRecipe === recipe.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                <div className="p-4 pt-3">
                  {/* Matched Ingredients */}
                  {recipe.matchedIngredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-muted-foreground text-xs mb-2">✅ You have:</p>
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
                      <p className="text-muted-foreground text-xs mb-2">🛒 You need:</p>
                      <div className="flex flex-wrap gap-2">
                        {recipe.missingIngredients.slice(0, 5).map((ingredient, idx) => (
                          <Badge key={idx} variant="outline" className="text-muted-foreground">
                            {ingredient}
                          </Badge>
                        ))}
                        {recipe.missingIngredients.length > 5 && (
                          <Badge variant="outline" className="text-muted-foreground">
                            +{recipe.missingIngredients.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expanded Instructions */}
                  {expandedRecipe === recipe.id && recipe.instructions && (
                    <div className="mt-4 pt-4 border-t animate-fade-in">
                      <p className="text-muted-foreground text-xs mb-3">📝 Quick Steps:</p>
                      <ol className="space-y-2">
                        {recipe.instructions.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                              {idx + 1}
                            </span>
                            <span className="text-foreground/80 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                      {recipe.tip && (
                        <div className="mt-4 p-3 rounded-lg bg-secondary/10 text-sm">
                          <span className="text-secondary">💡 Tip:</span> {recipe.tip}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline"
                      className="flex-1 touch-feedback"
                      onClick={() => toggleRecipeExpand(recipe.id)}
                    >
                      {expandedRecipe === recipe.id ? 'Hide Steps' : 'View Steps'}
                    </Button>
                    {recipe.missingIngredients.length > 0 && (
                      <Button 
                        variant="default"
                        className="touch-feedback"
                        onClick={() => addMissingToShoppingList(recipe.missingIngredients)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Missing
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer tip */}
        {recipes.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-muted/50 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">
              ✨ Tap refresh for new recipe ideas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
