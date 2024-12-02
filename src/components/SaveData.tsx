// SaveData.tsx
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";
import { Props as ItemProps } from "./Item";
import { User } from "firebase/auth";

// interface SaveDataProps {
//   items: ItemProps | ItemProps[];
// }
interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  firestoreId: string;
  image: null;
  bestBeforeDate: Date;
}
async function saveData(
  items: ItemProps | ItemProps[] | Ingredient,
  storagePath: string,
  user?: User | null
): Promise<string | null> {
  try {
    const itemsArray = Array.isArray(items) ? items : [items];

    if (!user) {
      // Store to firebase gods
      for (const item of itemsArray) {
        console.log(item.firestoreId);
        const docRef =
          item.firestoreId != ""
            ? doc(db, storagePath, item.name)
            : doc(db, storagePath, item.name);
        let Difference_In_Days;
        if (item.bestBeforeDate) {
          let Difference_In_Time =
            item.bestBeforeDate.getTime() - new Date().getTime();
          Difference_In_Days = Math.round(
            Difference_In_Time / (1000 * 3600 * 24)
          );
        }
        const subCollectionRef = doc(collection(docRef, "types"));
        const itemData = {
          ...item,
          firestoreId: item.firestoreId,
          expireDays: Difference_In_Days,
          image: item.image || null,
        };
        await setDoc(subCollectionRef, itemData);
        return docRef.id;
      }
    } else {
      for (const item of itemsArray) {
        const docRef =
          item.firestoreId != ""
            ? doc(
                db,
                storagePath + (user.email ? "_" + user.email : ""),
                item.firestoreId
              )
            : doc(
                collection(
                  db,
                  storagePath + (user.email ? "_" + user.email : "")
                )
              );
        const itemData = {
          ...item,
          firestoreId: docRef.id,
          image: item.image || null,
        };
        // Use `setDoc` to overwrite the document completely
        await setDoc(docRef, itemData);
        ensureMetaDataFile(storagePath + "_" + user.email, user.uid);
        console.log(
          "Document saved with ID:",
          docRef.id,
          " To ",
          storagePath + user.email
        );
        return docRef.id;
      }

      // Create the data with `image` set to null if undefined
    }
  } catch (e) {
    console.error("Error saving document:", e);
    return null;
  }
  return null;
}
const ensureMetaDataFile = async (collectionName: string, ownerId: string) => {
  try {
    const metadataRef = doc(db, `${collectionName}/_metadata`);
    const metadataSnap = await getDoc(metadataRef);

    if (!metadataSnap.exists()) {
      await setDoc(metadataRef, {
        owner: ownerId,
        invitedUsers: [],
      });
    }
  } catch (error) {
    console.log("Error checking metadata", error);
  }
};

export default saveData;
