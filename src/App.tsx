import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import { onAuthStateChanged, User, Auth } from "firebase/auth";

import { useState, useEffect, useCallback, useRef } from "react";
import Button from "./components/Button";
import AddItemForm from "./components/AddItemForm";
import { Props as ItemProps } from "./components/Item";
import Item from "./components/Item";
import RecipeList from "./components/RecipeList";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "./components/Firebase";
import saveData from "./components/SaveData";
import ReadData from "./components/ReadData";
import { doc, deleteDoc } from "firebase/firestore";
import { Ingredient } from "./components/Recipes";
import RecipeBuilder from "./components/RecipeBuilder";
import { loadImage } from "./components/LoadImageUrl";
import RealtimeListenerFirebase from "./components/RealtimeListenerFirebase";
import DateInputModal from "./components/DateInputModal";

function App() {
  const listenerPaused = useRef(false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean | null>(true);
  const [selectedItem, setSelectedItem] = useState<ItemProps | null>(null);
  const [addItemVisible, setAddItemVisibility] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState<ItemProps[]>([]);

  const [toBuy, setToBuy] = useState<Ingredient[]>([]);
  const currentDate = new Date();

  const handleFetchedItems = useCallback(
    (fetchedItems: ItemProps[], fetchedIngredients: Ingredient[]) => {
      console.log("Fetched items from Firestore:", fetchedItems);
      setItems(fetchedItems);
      setToBuy(fetchedIngredients);
    },
    []
  );

  const handleVisibilityChange = () => {
    setAddItemVisibility(false);
    setEditing(false);
    setEditingItemId(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          console.log("Email not verified");
        } else {
          console.log("Email is verified");
          setUser(currentUser);
        }
      } else {
        console.log("No user is signed in");
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Listener for storage in firebase database. Exit early if data is changed localy and pushed to firebase database
  useEffect(() => {
    if (!user || !user.email) {
      console.log("User or email is not available yet.");
      return; // Exit early if the user is not set
    }
    const handleUpdate = (newData: ItemProps[]) => {
      if (listenerPaused.current) {
        return;
      }
      console.log("This here is wshat? , ", listenerPaused.current);
      setItems((prevItems) => {
        const updatedItems = [...prevItems];

        newData.forEach((newItem) => {
          const index = updatedItems.findIndex(
            (item) => item.firestoreId === newItem.firestoreId
          );

          if (index > -1) {
            updatedItems[index] = newItem;
          } else if (newItem.firestoreId !== "_metadata")
            updatedItems.push(newItem);
        });
        return updatedItems;
      });
    };

    const unsubscribe = RealtimeListenerFirebase(
      "storage_" + auth.currentUser?.email,
      handleUpdate,
      listenerPaused
    );
    return () => unsubscribe();
  }, [user]);

  // Updates shoppingcart when Storage updates aka. items list
  useEffect(() => {
    const filterAndRemoveItems = async () => {
      const matchingItems = toBuy.filter((toBuyItem) => {
        return !items.some((item) => {
          const equals =
            toBuyItem.name.toLocaleUpperCase() ===
            item.name.toLocaleUpperCase();
          if (equals) {
            removeItem(toBuyItem.firestoreId, "shoppingCart");
          }
          return equals;
        });
      });
      setToBuy(matchingItems);
    };

    filterAndRemoveItems();
  }, [items]);

  const handleModalSubmit = (itemWithDate: ItemProps) => {
    console.log("Adding item with date:", itemWithDate);
    setSelectedItem(null);
    addItem(itemWithDate);
  };

  const addToStorageFromToBuy = (item: ItemProps) => {
    console.log("addToStorageFromToBuy");
    setSelectedItem(item);
  };
  const handleModalClose = () => {
    console.log("Closing modal");
    setSelectedItem(null);
  };

  const addItem = async (item: ItemProps) => {
    listenerPaused.current = true;
    console.log("Lister paused");
    try {
      let hasNewItem = false;
      let newItem = {
        ...item,
      };
      items.forEach((itemStorage) => {
        if (itemStorage.name.toLowerCase() === item.name.toLowerCase()) {
          const newAmount = Number(itemStorage.amount) + Number(item.amount);
          newItem = { ...itemStorage, amount: newAmount };
          hasNewItem = true;
        }
      });
      if (auth.currentUser) {
        try {
          await saveData(newItem, "gods");
        } catch (error) {
          console.log("Failed saving to gods: ", error);
        }
        const firestoreId = await saveData(
          newItem,
          "storage",
          auth.currentUser
        );
        const image = await loadImage(newItem.name);
        if (firestoreId) {
          const tempItem = { ...newItem, image, firestoreId };

          // No dubblicates to display
          if (hasNewItem) {
            setItems((prevItems) =>
              prevItems.map((existingItem) =>
                existingItem.name.toLowerCase() === tempItem.name.toLowerCase()
                  ? tempItem
                  : existingItem
              )
            );
          } else {
            // Add a new item to the list
            setItems((prevItems) => [...prevItems, tempItem]);
          }
        } else {
          console.error("Failed to get firestoreId for new item");
        }

        setAddItemVisibility(false);
      }
    } catch (error) {
      console.log("Failed adding item: ", error);
    } finally {
      listenerPaused.current = false;
      console.log("Lister unpaused");
    }
  };
  const removeItem = async (id: string, collection: string = "storage") => {
    listenerPaused.current = true;

    try {
      // setItems(items.filter((item) => item.firestoreId !== id));
      if (collection == "storage") {
        setItems((prevItems) =>
          prevItems.filter((item) => item.firestoreId !== id)
        );
      }
      // saveData(items);
      const collectionToDelete = collection + "_" + auth.currentUser?.email;
      const docRef = doc(db, collectionToDelete, id);
      await deleteDoc(docRef);
      console.log(`Document with ID ${id} was deleted successfully.`);
    } catch (e) {
      console.log(`Error deleteing document: `, e);
    } finally {
      listenerPaused.current = false;
    }
  };
  const editItem = (id: string) => {
    setEditingItemId(id);
    setEditing(true);
    setAddItemVisibility(false);
  };
  const saveEdit = async (updatedItem: ItemProps) => {
    listenerPaused.current = true;
    try {
      setItems((prevItems) =>
        prevItems.map((item) => {
          return updatedItem.firestoreId === item.firestoreId
            ? updatedItem
            : item;
        })
      );
      await saveData(updatedItem, "storage", auth.currentUser);
      setEditingItemId(null); // Exit edit mode
      setAddItemVisibility(false);
      setEditing(false);
    } catch (error) {
      console.log("Error saving edit to firebase, ", error);
    } finally {
      listenerPaused.current = false;
    }
  };
  const updateItems = useCallback(
    (updatedItems: ItemProps[]) => {
      updatedItems.forEach((element) => {
        if (parseFloat(element.amount.toString()) <= 0) {
          removeItem(element.firestoreId);
        } else {
          saveEdit(element);
        }
      });
    },
    [removeItem, saveEdit]
  );
  const handleMissingIngredients = useCallback(
    async (missingItems: Ingredient[]) => {
      let newItem = false;
      const itemsWithIds = await Promise.all(
        missingItems.map(async (item) => {
          const currentItem = toBuy.find((currentItem) => {
            return item.name === currentItem.name;
          });
          if (currentItem) {
            console.log("Item already in To buy ", currentItem.name);
            return currentItem;
          } else {
            const image = await loadImage(item.name);
            if (image) {
              item.image = image;
            }
            const firestoreId = await saveData(
              item,
              "shoppingCart",
              auth.currentUser
            );
            console.log("ID ", firestoreId);
            newItem = true;
            return { ...item, firestoreId: firestoreId ?? "" };
          }
        })
      );

      if (newItem) {
        setToBuy((prevToBuy) => {
          // Create a map to hold the latest versions of items by name
          const toBuyMap = new Map(prevToBuy.map((item) => [item.name, item]));

          itemsWithIds.forEach((item) => {
            toBuyMap.set(item.name, item);
          });

          return Array.from(toBuyMap.values()); // Convert map back to array
        });
      }
    },
    [toBuy, auth.currentUser]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/signin" : "/signin"} />} // /app
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/signin"
          // element={<Signin />}
          element={user ? <Navigate to="/app" /> : <Signin />}
        />
        <Route
          path="/app"
          element={
            user ? (
              <div className="container ">
                <ReadData
                  onFetchedItems={handleFetchedItems}
                  user={auth.currentUser}
                />
                <div className="row p-2 gy-2">
                  {/* <ImageUploader></ImageUploader> */}
                  <header>{currentDate.toDateString()}</header>
                  <div className="d-flex flex-row justify-content-center ">
                    <h2>To buy</h2>
                  </div>

                  <ul className="list-group  ">
                    {toBuy.map((item, index) => (
                      <li
                        className="list-group-item d-flex flex-row justify-content-between "
                        key={index}
                      >
                        {item.name + " " + item.amount + " " + item.unit}
                        <Button
                          faButton={faPlus}
                          onClick={() => addToStorageFromToBuy(item)}
                        ></Button>
                      </li>
                    ))}
                  </ul>
                  {selectedItem && (
                    <DateInputModal
                      item={selectedItem}
                      onSubmit={handleModalSubmit}
                      onClose={handleModalClose}
                    />
                  )}

                  <h1 className="d-flex flex-row justify-content-center p-4">
                    Storage
                  </h1>
                  <div className="d-flex flex-column p-3">
                    {items.length === 0 && "No items found!"}
                    <ul className="list-group ">
                      {items.map((item, index) => (
                        <li
                          className="list-group-item"
                          key={index}
                        >
                          {editingItemId === item.firestoreId ? (
                            <AddItemForm
                              initialValues={item}
                              onSubmit={saveEdit}
                              closeButtonPressed={handleVisibilityChange}
                            />
                          ) : (
                            <Item
                              {...item}
                              onClose={() => removeItem(item.firestoreId)}
                              onEdit={() => {
                                editItem(item.firestoreId);
                              }}
                            />
                          )}
                        </li>
                      ))}
                      <div>
                        {addItemVisible && (
                          <AddItemForm
                            onSubmit={addItem}
                            closeButtonPressed={handleVisibilityChange}
                          />
                        )}
                      </div>
                    </ul>
                  </div>
                  {/* Additem to storage button */}
                  <div className="d-flex flex-row justify-content-center ">
                    {!addItemVisible && !editing && (
                      <Button
                        faButton={faPlus}
                        color="primary"
                        onClick={() => {
                          setAddItemVisibility(true);
                        }}
                      >
                        Add item
                      </Button>
                    )}
                  </div>
                  <div className="col-12 py-4">
                    <RecipeBuilder></RecipeBuilder>
                  </div>
                  <div className="col-12 py-4  overflow-hidden">
                    <RecipeList
                      items={items}
                      updateItems={updateItems}
                      onMissingIngredients={handleMissingIngredients}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
