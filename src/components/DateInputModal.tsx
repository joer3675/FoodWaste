import React, { useState } from "react";
import { Props as ItemProps } from "./Item";
import Button from "./Button";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
interface Props {
  item: ItemProps;
  onSubmit: (itemWithDate: ItemProps) => void;
  onClose: () => void;
}

const DateInputModal: React.FC<Props> = ({ item, onSubmit, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = () => {
    const parsedDate = new Date(selectedDate);
    if (isNaN(parsedDate.getTime())) {
      alert("Invalid date. Please enter a valid date.");
      return;
    }
    onSubmit({ ...item, bestBeforeDate: parsedDate });
  };

  return (
    <div className="row p-2">
      <div className="d-flex flex-column gap-3">
        <h6>
          Enter Expiration Date{" "}
          <span style={{ fontWeight: "bold", fontFamily: "cursive" }}>
            {item.name}
          </span>
        </h6>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
        <div className="d-flex gap-2 justify-content-end">
          <Button
            faButton={faPlus}
            onClick={handleSubmit}
          >
            Add Item
          </Button>
          <Button
            color="danger"
            faButton={faMinus}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateInputModal;
