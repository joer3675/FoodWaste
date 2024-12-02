import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import Button from "./Button";
import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Signup = () => {
  const passwordMessage =
    "Password must be at least 6 characters long and must contain uppercase and number";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disableButton, SetDisableButton] = useState<boolean>(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    return emailValid && passwordValid;
  };

  useEffect(() => {
    SetDisableButton(!validateForm());
  }, [email, password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
          sendEmailVerification(userCredential.user);
        }
      );
      // const user = userCredentials.user;

      // await sendEmailVerification(user);
      auth.signOut();
      console.log("Verification email sent to:");
      // (userCredential) => {
      //   const user = userCredential.user;
      //   console.log(user.displayName);
      //   userCredential.user.sendEmailVerification
      // }
      // Redirect to MainApp after successful signup
      navigate("/signin");
    } catch (err: any) {
      setError(err.message + " " + err.code);
    }
  };

  return (
    <div className="d-flex flex-column  justify-content-center vh-100">
      <div className="d-flex flex-column gap-5 text-center">
        <h1>
          <span className="text-danger">Sign</span>
          <span className="text-warning">up</span>
        </h1>
        <h4>To the coolest app ever made</h4>
        <form
          className="d-flex flex-row flex-wrap justify-content-center gap-2 gap-md-3"
          onSubmit={handleSignup}
        >
          <input
            className="form-control"
            style={{ width: "300px" }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-control "
            style={{ width: "200px" }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            faButton={faPlus}
            typeOfButton="submit"
            color="primary"
            disableButton={disableButton}
          >
            Signup
          </Button>
          <div className="col-12">
            {password.length > 0 &&
              (password.length < 6 ||
                !/\d/.test(password) ||
                !/[A-Z]/.test(password)) && (
                <small className="mt-1">{passwordMessage}</small>
              )}
          </div>
          {/* <button
            className={"btn btn-primary"}
            type="submit"
          >
            Signin
          </button> */}
        </form>
        {error && <p>{error}</p>}
        <div className="d-flex flex-row justify-content-center gap-2">
          Already have a account
          <a
            className="signup-link d-flex"
            href="/Signin"
          >
            Signin
            <span className="icon-container">
              <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
