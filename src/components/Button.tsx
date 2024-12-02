import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface Props {
  children?: string;
  faButton: IconProp;
  color?: "primary" | "secondary" | "danger";
  disableButton?: boolean;
  onClick?: () => void;
  typeOfButton?: "submit" | "button";
}

const Button = ({
  children,
  faButton,
  disableButton,
  onClick,
  typeOfButton = "button",
  color = "primary",
}: Props) => {
  return (
    <button
      className={
        !disableButton
          ? "btn  btn  btn-" + color + `${disableButton ? " disabled" : ""}`
          : "btn  btn  btn-" + color + `${disableButton ? " disabled" : ""}`
      }
      type={typeOfButton}
      onClick={onClick}
    >
      {children ? children : <FontAwesomeIcon icon={faButton} />}
    </button>
  );
};

export default Button;
