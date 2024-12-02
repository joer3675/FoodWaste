import React, { FormEvent, ReactEventHandler, useRef, useState } from "react";
import Button from "./Button";
import {
  faDownLong,
  faMinimize,
  faMinus,
  faPlus,
  faUpLong,
} from "@fortawesome/free-solid-svg-icons";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Recipe {
  title: string;
  instructions: string;
  ingredients: Ingredient[];
}

function RecipeBuilder() {
  const [recipe, setRecipie] = useState<Recipe | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  const ingredientNameRef = useRef<HTMLInputElement>(null);
  const ingredientAmountRef = useRef<HTMLInputElement>(null);
  const ingredientUnitRef = useRef<HTMLSelectElement>(null);

  const [ingredientList, setIngredientList] = useState<Ingredient[]>([]);

  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Handle Submit");
    // Create new recipe object
    const newRecipe = {
      title: titleRef.current?.value || "",
      instructions: instructionsRef.current?.value || "",
      ingredients: ingredientList,
    };
    setRecipie(newRecipe);
  };

  const addIngredient = () => {
    const amount = ingredientAmountRef.current?.value || "";
    const unit = ingredientUnitRef.current?.value || "";
    const name = ingredientNameRef.current?.value || "";

    if (!name || !amount || !unit) {
      alert("Please fill out all ingredient fields.");
      return;
    }
    const newIngredient: Ingredient = { name, amount, unit };
    setIngredientList((prev) => [...prev, newIngredient]);

    //Clear input fields after adding
    if (ingredientNameRef.current) ingredientNameRef.current.value = "";
    if (ingredientAmountRef.current) ingredientAmountRef.current.value = "";
    if (ingredientUnitRef.current) ingredientUnitRef.current.value = "";
  };

  return (
    <div>
      <h1
        className="d-flex align-items-center cursor-pointer"
        onClick={toggleFormVisibility}
        style={{ cursor: "pointer" }}
      >
        Create Recipe
        <Button faButton={isFormVisible ? faMinus : faPlus}></Button>
      </h1>
      {isFormVisible && (
        <form
          className="form-group d-flex flex-column gap-3"
          onSubmit={handleSubmit}
        >
          <label>
            <b>Title:</b>
            <div className="form-group pb-2">
              <input
                className="form-control"
                ref={titleRef}
                type="text"
              />
            </div>
          </label>
          <label>
            <b>Ingredients:</b>
            <ul className="list-group list-group-flush d-flex flex-column gap-2 pb-2">
              {ingredientList.map((ingredient, index) => (
                <li
                  key={index}
                  className="list-group-item"
                >
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
            <div className="form-group pb-2 d-flex flex-column gap-3">
              <input
                className="form-control"
                type="text"
                placeholder="Name"
                ref={ingredientNameRef}
              />
              <input
                className="form-control"
                type="text"
                placeholder="Amount"
                ref={ingredientAmountRef}
              />
              <select
                className="form-select"
                ref={ingredientUnitRef}
                defaultValue=""
              >
                Select unit
                <option value="Kg">Kg</option>
                <option value="L">L</option>
                <option value="St">St</option>
              </select>
            </div>
          </label>
          <div className="form-group pb-2">
            <Button
              faButton={faPlus}
              onClick={addIngredient}
            >
              Add Ingredient
            </Button>
          </div>
          <div className="form-group pb-2">
            <label>
              <b>Instructions:</b>
              <textarea
                className="form-control"
                cols={100}
                ref={instructionsRef}
              />
            </label>
          </div>
          <div className="d-flex justify-content-end">
            <Button
              faButton={faPlus}
              typeOfButton={"submit"}
            >
              Create Recipe
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RecipeBuilder;
