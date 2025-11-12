import { ArrowLeft, Clock, ChefHat, Check, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RecipesScreenProps {
  onBack: () => void;
}

export function RecipesScreen({ onBack }: RecipesScreenProps) {
  const recipes = [
    {
      id: '1',
      name: 'Strawberry Smoothie Bowl',
      prepTime: '10 min',
      matchedIngredients: ['Strawberries', 'Yogurt', 'Bananas'],
      missingIngredients: ['Granola', 'Honey'],
      image: 'smoothie bowl',
    },
    {
      id: '2',
      name: 'Chicken Caesar Salad',
      prepTime: '20 min',
      matchedIngredients: ['Chicken Breast', 'Lettuce'],
      missingIngredients: ['Caesar Dressing', 'Parmesan'],
      image: 'caesar salad',
    },
    {
      id: '3',
      name: 'Banana Bread',
      prepTime: '60 min',
      matchedIngredients: ['Bananas', 'Milk'],
      missingIngredients: ['Flour', 'Sugar', 'Eggs'],
      image: 'banana bread',
    },
    {
      id: '4',
      name: 'Grilled Chicken with Veggies',
      prepTime: '30 min',
      matchedIngredients: ['Chicken Breast', 'Lettuce'],
      missingIngredients: ['Bell Peppers', 'Olive Oil'],
      image: 'grilled chicken',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Recipe Suggestions</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <h2>Recipes using expiring items</h2>
          </div>
          <p className="text-muted-foreground">
            Make the most of your ingredients before they go bad
          </p>
        </div>

        {/* Recipe Cards */}
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.prepTime}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-3">{recipe.name}</h3>
                
                {/* Matched Ingredients */}
                <div className="mb-3">
                  <p className="text-muted-foreground mb-2">You have:</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.matchedIngredients.map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Check className="w-3 h-3 mr-1" />
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Ingredients */}
                {recipe.missingIngredients.length > 0 && (
                  <div className="mb-4">
                    <p className="text-muted-foreground mb-2">You need:</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.missingIngredients.map((ingredient, idx) => (
                        <Badge key={idx} variant="outline" className="text-muted-foreground">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1">View Recipe</Button>
                  <Button variant="outline" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
