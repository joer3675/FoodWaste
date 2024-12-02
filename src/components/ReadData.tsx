// ReadData.tsx
import React, { useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./Firebase";
import { Props as ItemProps } from "./Item";
import { Ingredient } from "./RecipeList";
import { User } from "firebase/auth";

interface ReadDataProps {
  user: User | null;
  onFetchedItems: (items: ItemProps[], ingredients: Ingredient[]) => void;
}

const ReadData: React.FC<ReadDataProps> = ({ onFetchedItems, user }) => {
  const hasFetched = useRef(false); // Track if data has already been fetched
  useEffect(() => {
    // Only fetch data if it hasn't been fetched yet
    if (hasFetched.current) return;

    const fetchItems = async () => {
      hasFetched.current = true;

      try {
        if (!user) {
          throw new Error("User not authenticated.");
        }
        const querySnapshot = await getDocs(
          collection(db, "storage_" + user.email)
        );
        const fetchedItems = querySnapshot.docs
          .filter((doc) => doc.id !== "_metadata")
          .map((doc) => {
            const data = doc.data();
            const bestBeforeDate = data.bestBeforeDate?.toDate();
            return {
              firestoreId: doc.id,
              ...data,
              ...(bestBeforeDate && { bestBeforeDate }),
              // bestBeforeDate: data.bestBeforeDate?.toDate() || null, // Convert Timestamp to Date
            };
          }) as unknown as ItemProps[];

        const querySnapshot2 = await getDocs(
          collection(db, "shoppingCart_" + user.email)
        );
        const fetchedIngredients = querySnapshot2.docs
          .filter((doc) => doc.id !== "_metadata")
          .map((doc) => {
            const data = doc.data();
            return {
              firestoreId: doc.id,
              ...data,
            };
          }) as unknown as Ingredient[];
        // Pass fetched items to App via the callback
        onFetchedItems(fetchedItems, fetchedIngredients);
        hasFetched.current = true; // Mark as fetched to prevent re-fetching
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  return null;
};

export default ReadData;
