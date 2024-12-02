import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./Firebase";
import { Props as ItemProps } from "./Item";

const RealtimeListenerFirebase = (
  collectionName: string,
  onUpdate: (data: ItemProps[]) => void,
  listenerPausedRef: React.MutableRefObject<boolean>
) => {
  const collectionRef = collection(db, collectionName);
  // Step 1: Fetch initial data

  // Pass the initial data to the callback
  // Start a realtime listener

  const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
    if (listenerPausedRef.current) {
      console.log("Listener is paused, skipping updates");
      return;
    }

    const data: ItemProps[] = [];

    snapshot.docChanges().forEach((change) => {
      const bestBeforeDate = change.doc.data().bestBeforeDate?.toDate();

      const docData = {
        firestoreId: change.doc.id,
        name: change.doc.data().name,
        unit: change.doc.data().unit,
        amount: change.doc.data().amount,
        image: change.doc.data()?.image,
        ...(bestBeforeDate && { bestBeforeDate }),
        hasExpired: change.doc.data()?.hasExpired,
      } as ItemProps;

      if (docData.firestoreId === "_metadata") {
        return;
      }
      if (change.type === "added") {
        console.log("New document added: ", change.doc.data());
      }
      if (change.type === "modified") {
        console.log("Document modified: ", change.doc.data());
      }
      if (change.type === "removed") {
        console.log("Document removed: ", change.doc.data());
      }
      data.push(docData);
    });
    if (data.length > 0) {
      onUpdate(data);
    }
  });

  // Return a function to unsubscribe when no longer needed
  return unsubscribe;
};

export default RealtimeListenerFirebase;
