import { faEdit, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface Props {
  firestoreId: string;
  image?: string;
  name: string;
  amount: number | string;
  unit: string;
  bestBeforeDate?: Date;
  hasExpired?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
}
const Item = ({
  name,
  amount,
  bestBeforeDate,
  unit,
  hasExpired,
  onClose,
  onEdit,
  image,
}: Props) => {
  return (
    <div className="d-flex flex-row w-100 w-md-50">
      <h3
        className="col-4 text-truncate "
        title={name}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            height={50}
            width={50}
          />
        ) : null}

        {name}
      </h3>

      <p className="col-4 text-center">
        <b>{amount}</b> {unit}
      </p>
      <div className="col-4">
        <p className={` col text-end ${hasExpired ? "text-danger" : ""}`}>
          {hasExpired ? "Expire: " : "Expires: "}
          <b>{bestBeforeDate?.toDateString()}</b>
          <FontAwesomeIcon
            color="black"
            type="button"
            className="close mx-2"
            icon={faX}
            onClick={onClose}
          />
          <FontAwesomeIcon
            color="black"
            type="button"
            className="close mx-2"
            icon={faEdit}
            onClick={onEdit}
          />
        </p>
      </div>
    </div>
  );
};

export default Item;
