import { useState, FormEvent } from "react";
import { Props as ItemProps } from "./Item";
import { loadImage } from "./LoadImageUrl";
import Button from "./Button";
import { faClose } from "@fortawesome/free-solid-svg-icons";

interface AddItemFormProps {
  onSubmit: (item: ItemProps) => void;
  initialValues?: ItemProps;
  closeButtonPressed: (arg0: boolean) => void;
}
function AddItemForm({
  onSubmit,
  initialValues,
  closeButtonPressed,
}: AddItemFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  // const [id, setId] = useState(initialValues?.id || 0);
  const [firestoreId] = useState(initialValues?.firestoreId || "");
  const [amount, setAmount] = useState<number | string>(
    initialValues?.amount ?? ""
  );
  const [unit, setUnit] = useState(initialValues?.unit || "L");
  const [bbd, setBbd] = useState(
    initialValues?.bestBeforeDate
      ? initialValues.bestBeforeDate.toISOString().split("T")[0]
      : getCurrentDateString()
  );
  // const [hasExpired, setHasExpired] = useState<boolean | undefined>(
  //   initialValues?.hasExpired
  // );

  const toggleVisibility = () => {
    closeButtonPressed(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let Difference_In_Time = new Date(bbd).getTime() - new Date().getTime();
    let Difference_In_Days = Math.round(
      Difference_In_Time / (1000 * 3600 * 24)
    );
    const isExpired = Difference_In_Days < 2 ? true : false;
    // setHasExpired(isExpired);

    // const itemImage = name.trim().toLowerCase() === "milk" ? milk : "";
    const itemImage = await loadImage(name);
    const newItem: ItemProps = {
      firestoreId,
      // id,
      name,
      amount,
      unit,
      bestBeforeDate: new Date(bbd),
      hasExpired: isExpired,
      image: itemImage,
    };
    if (newItem.name.toLowerCase() === "garlic" && newItem.unit != "cloves") {
      newItem.amount = Number(newItem.amount) * 12;
      newItem.unit = "cloves";
    }
    onSubmit(newItem);
    if (!initialValues) {
      setName("");
      // setId(id + 1);
      setAmount(0);
      setUnit("L");
      setBbd(getCurrentDateString());
    }
  };
  function getCurrentDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const getStepValue = () => {
    switch (unit) {
      case "Kg":
        return 0.1;
      case "L":
        return 0.1;
      case "St":
        return 1;

      default:
        return 1;
    }
  };

  return (
    <div className="container-fluid pt-2 ">
      <form
        onSubmit={handleSubmit}
        className="row gx-0 gy-2"
      >
        <label>Name:</label>
        <input
          value={name}
          className="form-control"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="amountID">Amount:</label>
        <input
          id="amountID"
          className="form-control"
          value={amount}
          placeholder="0"
          type="number"
          step={getStepValue()}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          required
        />
        <label>
          Unit:
          <select
            value={unit}
            className="form-control"
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="L">L</option>
            <option value="Kg">Kg</option>
            <option value="St">St</option>
          </select>
        </label>
        <label>
          Expire Date:
          <input
            type="date"
            className="form-control"
            value={bbd}
            onChange={(e) => setBbd(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </label>
        <div className=" d-flex gap-2 justify-content-between">
          <button
            type="submit"
            className="btn btn-primary btn-lg "
          >
            Add
          </button>
          <Button
            faButton={faClose}
            color="danger"
            onClick={toggleVisibility}
          ></Button>
        </div>
      </form>
    </div>
  );
}

export default AddItemForm;
