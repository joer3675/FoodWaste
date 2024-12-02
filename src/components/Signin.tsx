import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "./Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { faArrowRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./css/SignupLink.css";
import Button from "./Button";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [disableButton, SetDisableButton] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    return emailValid && passwordValid;
  };

  useEffect(() => {
    SetDisableButton(!validateForm());
  }, [email, password]);

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        if (!user.emailVerified) {
          await auth.signOut();
          setError("Please verify your email before signing in.");
          return;
        }
        navigate("/app");
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      console.log("Invalid form submission");
    }
  };

  return (
    <div className="d-flex flex-column  justify-content-center vh-100">
      <div className="d-flex flex-column gap-5 text-center">
        <h1>
          <span className="text-warning">Sign</span>
          <span className="text-danger">in</span>
        </h1>
        <h4>To the coolest app ever made</h4>
        <form
          className="d-flex flex-row flex-wrap justify-content-center gap-2 gap-md-3"
          onSubmit={handleSignin}
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
            Signin
          </Button>

          {/* <button
            className={"btn btn-primary"}
            type="submit"
          >
            Signin
          </button> */}
        </form>
        {error && <p>{error}</p>}
        <div className="d-flex flex-row justify-content-center gap-5">
          <a
            className="signup-link d-flex"
            href="/Signup"
          >
            Signup
            <span className="icon-container">
              <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signin;
