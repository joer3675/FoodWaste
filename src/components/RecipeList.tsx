import React, { useState } from "react";
import Recipe from "./Recipes";
import { Props as ItemProps } from "./Item";
import "./css/style.css";
import Button from "./Button";
import { faAdd, faBowlFood } from "@fortawesome/free-solid-svg-icons";
import { loadImage } from "./LoadImageUrl";

interface Props {
  items: ItemProps[];
  updateItems: (updateItems: ItemProps[]) => void;
  onMissingIngredients: (missingIngredients: Ingredient[]) => void;
}
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  firestoreId: string;
}

function RecipeList({ items, updateItems, onMissingIngredients }: Props) {
  let toBuy: Ingredient[] = [];
  const recipes = [
    {
      title: "Spaghetti Carbonara",
      ingredients: [
        { name: "Spaghetti", amount: "0.2", unit: "Kg", firestoreId: "" },
        { name: "Egg", amount: "2", unit: "St", firestoreId: "" },
        { name: "Parmesan", amount: "0.05", unit: "Kg", firestoreId: "" },
        { name: "Garlic", amount: "1", unit: "cloves", firestoreId: "" },

        { name: "Pancetta", amount: "0.1", unit: "Kg", firestoreId: "" },
        { name: "Pepper", amount: "0.01", unit: "Kg", firestoreId: "" },
      ],
      instructions:
        "Boil pasta. Cook pancetta. Mix eggs and Parmesan. Combine all with pasta.",
    },
    {
      title: "Chicken Caesar Salad",
      ingredients: [
        { name: "Chicken Breast", amount: "0.2", unit: "Kg", firestoreId: "" },
        { name: "Romaine Lettuce", amount: "1", unit: "Kg", firestoreId: "" },
        { name: "Parmesan", amount: "0.03", unit: "Kg", firestoreId: "" },
        { name: "Croutons", amount: "0.05", unit: "Kg", firestoreId: "" },
        { name: "Caesar Dressing", amount: "0.03", unit: "L", firestoreId: "" },
      ],
      instructions:
        "Grill chicken. Chop lettuce and mix with dressing. Top with chicken, croutons, and Parmesan.",
    },
    {
      title: "Tomato Basil Soup",
      ingredients: [
        { name: "Tomatoes", amount: "0.5", unit: "Kg", firestoreId: "" },
        { name: "Onion", amount: "0.1", unit: "Kg", firestoreId: "" },
        { name: "Garlic", amount: "2", unit: "cloves", firestoreId: "" },
        { name: "Basil", amount: "0.02", unit: "Kg", firestoreId: "" },
        { name: "Vegetable Broth", amount: "0.5", unit: "L", firestoreId: "" },
        { name: "Salt", amount: "to taste", unit: "", firestoreId: "" },
        { name: "Pepper", amount: "to taste", unit: "", firestoreId: "" },
      ],
      instructions:
        "Sauté onion and garlic. Add tomatoes and broth. Simmer until soft. Blend and add basil.",
    },
    {
      title: "Pancakes",
      ingredients: [
        { name: "Flour", amount: "0.15", unit: "Kg", firestoreId: "" },
        { name: "Milk", amount: "0.25", unit: "L", firestoreId: "" },
        { name: "Egg", amount: "1", unit: "St", firestoreId: "" },
        { name: "Butter", amount: "0.02", unit: "Kg", firestoreId: "" },
        { name: "Sugar", amount: "1", unit: "g", firestoreId: "" },
        { name: "Salt", amount: "1/4", unit: "g", firestoreId: "" },
      ],
      instructions:
        "Mix flour, milk, egg, sugar, and salt. Melt butter in a pan. Pour batter and cook until golden on both sides.",
    },
    {
      title: "Guacamole",
      ingredients: [
        { name: "Avocado", amount: "1", unit: "St", firestoreId: "" },
        { name: "Tomato", amount: "0,05", unit: "Kg", firestoreId: "" },
        { name: "Onion", amount: "0,03", unit: "Kg", firestoreId: "" },
        { name: "Lime Juice", amount: "1", unit: "tbsp", firestoreId: "" },
        { name: "Salt", amount: "to taste", unit: "", firestoreId: "" },
        { name: "Cilantro", amount: "to taste", unit: "", firestoreId: "" },
      ],
      instructions:
        "Mash avocado. Finely chop tomato and onion. Mix all ingredients together and add lime juice.",
    },
    {
      title: "Vegetable Stir Fry",
      ingredients: [
        { name: "Broccoli", amount: "0.1", unit: "Kg", firestoreId: "" },
        { name: "Bell Pepper", amount: "0.1", unit: "Kg", firestoreId: "" },
        { name: "Carrot", amount: "0.05", unit: "Kg", firestoreId: "" },
        { name: "Soy Sauce", amount: "2", unit: "tbsp", firestoreId: "" },
        { name: "Garlic", amount: "1", unit: "clove", firestoreId: "" },
        { name: "Olive Oil", amount: "1", unit: "tbsp", firestoreId: "" },
      ],
      instructions:
        "Heat oil in a pan. Add garlic and vegetables. Stir-fry until tender. Add soy sauce and mix well.",
    },
    {
      title: "Avocado Toast",
      ingredients: [
        { name: "Bread", amount: "1", unit: "slice", firestoreId: "" },
        { name: "Avocado", amount: "1/2", unit: "slice", firestoreId: "" },
        { name: "Salt", amount: "to taste", unit: "", firestoreId: "" },
        { name: "Pepper", amount: "to taste", unit: "", firestoreId: "" },
        { name: "Chili Flakes", amount: "1/4", unit: "tsp", firestoreId: "" },
      ],
      instructions:
        "Toast bread. Mash avocado. Spread on bread and add toppings.",
    },
  ];
  const isInItems = (ingredient: Ingredient) => {
    return items.some((item) => {
      const itemAmount = isNaN(parseFloat(String(item.amount)))
        ? 0.01
        : parseFloat(String(item.amount));
      const ingredientAmount = isNaN(parseFloat(String(ingredient.amount)))
        ? 0.01
        : parseFloat(String(ingredient.amount));
      const ingredientUnit =
        ingredient.unit === "" || "g" || "hg" || "cloves"
          ? item.unit
          : ingredient.unit;

      return (
        item.name.toLowerCase() === ingredient.name.toLowerCase() &&
        item.unit === ingredientUnit &&
        itemAmount >= parseFloat(unitConverter(ingredient) ?? "0")
      );
    });
  };
  const removeItemsFromStorage = (ingredients: Ingredient[]) => {
    let hasMissingItem = false;
    toBuy = [];

    ingredients.forEach((ingredient) => {
      const matchingItem = items.find(
        (item) =>
          item.name.toLowerCase() === ingredient.name.toLowerCase() &&
          item.unit === ingredient.unit
      );

      if (matchingItem) {
        if (
          parseFloat(String(matchingItem.amount)) <
          parseFloat(ingredient.amount)
        ) {
          hasMissingItem = true;
          const id = matchingItem.firestoreId;
          const amountMissing = (
            parseFloat(ingredient.amount) -
            parseFloat(String(matchingItem.amount))
          ).toString();
          toBuy.push({ ...ingredient, amount: amountMissing, firestoreId: id });
        }
      } else {
        hasMissingItem = true;
        toBuy.push(ingredient);
      }
    });

    if (hasMissingItem) {
      onMissingIngredients(toBuy);
      return; // Stop here, do not update item amounts
    }

    const updatedItems = items.map((item) => {
      const matchingIngredient = ingredients.find(
        (ingredient) =>
          ingredient.name.toLowerCase() === item.name.toLowerCase() &&
          ingredient.unit === item.unit
      );

      if (matchingIngredient) {
        const newAmount =
          parseFloat(String(item.amount)) -
          parseFloat(matchingIngredient.amount);
        return {
          ...item,
          amount: newAmount > 0 ? newAmount.toFixed(2) : "0",
        };
      }

      return item;
    });
    // Update items in the parent component
    updateItems(updatedItems);
  };

  return (
    <div className="row gy-5 justify-content-around">
      {recipes.map((recipe, index) => {
        const missingIngredients = recipe.ingredients.some(
          (ingredient) => !isInItems(ingredient)
        );
        return (
          <div
            className="col-lg-5 border rounded-3 shadow bg-light "
            key={index}
          >
            <div className="p-3 ">
              <Recipe
                title={recipe.title}
                ingredients={recipe.ingredients}
                instructions={recipe.instructions}
              />
              {missingIngredients && (
                <div className="bg-light-red ">
                  <h3 className="text-danger">
                    <b>Missing Ingredients:</b>
                  </h3>
                  <ul>
                    {recipe.ingredients.map(
                      (ingredient, i) =>
                        !isInItems(ingredient) && (
                          <li key={i}>
                            <p className="">
                              {/* {ingredient.amount} {ingredient.unit}{" "} */}
                              {ingredient.name}
                            </p>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Button
              faButton={missingIngredients ? faAdd : faBowlFood}
              color={missingIngredients ? "secondary" : "primary"}
              onClick={() => removeItemsFromStorage(recipe.ingredients)}
            ></Button>
          </div>
        );
      })}
    </div>
  );
}

function unitConverter(ingredient: Ingredient) {
  switch (ingredient.unit) {
    case "g":
      return (parseFloat(ingredient.amount) / 1000).toFixed(2);

    case "hg":
      return (parseFloat(ingredient.amount) / 10).toFixed(2);

    default:
      return ingredient.amount;
  }
}

export default RecipeList;
