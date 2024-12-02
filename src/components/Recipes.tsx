export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  firestoreId: string;
  image?: string;
}
interface Props {
  title: string;
  ingredients: Ingredient[];
  instructions: string;
}

function Recipe({ title, ingredients, instructions }: Props) {
  return (
    <div className=" ">
      <h2>
        <b>{title}</b>
      </h2>
      <div className="">
        <h4>Ingredients:</h4>
        <ul>
          {ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.amount} {ingredient.unit} {ingredient.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="">
        <h4>Instructions:</h4>
        <p>{instructions}</p>
      </div>
    </div>
  );
}

export default Recipe;
