import React, { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Arrow } from "../../components/Arrow";
import { Tick } from "../../components/Tick";
import { Cross } from "../../components/Cross";
import styles from "./SignUp.module.css";

export const SignUp = () => {
  // email state
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  // password state
  const [password, setPassword] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isPasswordLong, setIsValidLong] = useState(false);
  const [isPasswordSpecial, setIsPasswordSpecial] = useState(false);

  // name state (optional fields)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");

  // show components state
  const [showPasswordComponents, setShowPasswordComponents] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [showOptionalComponents, setShowOptionalComponents] = useState(false);

  function checkValidEmail(inputText: string) {
    const matches = inputText.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    );
    const isValid = matches !== null;
    setIsValidEmail(isValid);
  }

  function checkValidPassword(inputText: string) {
    let isPasswordValid = true;

    if (inputText.length >= 8) {
      setIsValidLong(true);
    } else {
      isPasswordValid = false;
      setIsValidLong(false);
    }

    if (
      inputText.match(/(?=.*\d|\D)(?=.*[A-Z]|[^A-Za-z])(?=.*\W|\w).{1,}/) !==
      null
    ) {
      setIsPasswordSpecial(true);
    } else {
      isPasswordValid = false;
      setIsPasswordSpecial(false);
    }

    setIsValidPassword(isPasswordValid);
  }

  function selectNextFormElement() {
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('[id^="form-element-"]'),
    );
    const currentInput = document.activeElement as HTMLInputElement;
    if (currentInput) {
      const currentInputIndex = inputs.indexOf(currentInput);
      const nextInputIndex = (currentInputIndex + 1) % inputs.length;
      const input = inputs[nextInputIndex];
      input.focus();
    }
  }

  function handelFormSubmit() {
    console.log("formData: ", email, password, firstName, lastName, userName);
  }

  return (
    <PageContainer id="signup-content">
      <div className={styles.signUpBox}>
        <div style={{ width: "fit-content" }}>
          <h3 className={styles.secondaryHeader}>Lets begin the adventure!</h3>
        </div>
        <h3>Enter your email</h3>
        <div className={styles.flexContainer}>
          {isValidEmail ? <Tick /> : <Arrow />}
          <label hidden>Email address</label>
          <input
            className={styles.formInput}
            id="email-address"
            type="email"
            name="email"
            required
            autoFocus
            autoComplete="off"
            value={email}
            onChange={(inputEvent: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(inputEvent.target.value);
              checkValidEmail(inputEvent.target.value);
            }}
            onBlur={(inputEvent: React.ChangeEvent<HTMLInputElement>) =>
              checkValidEmail(inputEvent.target.value)
            }
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (isValidEmail && event.key === "Enter") {
                setShowPasswordComponents(true);
              }
            }}
          />
          {!showPasswordComponents && (
            <button
              type="button"
              disabled={!isValidEmail}
              onClick={() => setShowPasswordComponents(true)}
            >
              Continue
            </button>
          )}
        </div>
        {showPasswordComponents && (
          <>
            <h3>Create a password</h3>
            <div className={styles.flexContainer}>
              {isValidPassword ? <Tick /> : <Arrow />}
              <label hidden>Password</label>
              <input
                className={styles.formInput}
                id="password"
                type="password"
                autoComplete="off"
                spellCheck="false"
                required
                autoFocus
                value={password}
                onChange={(inputText: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(inputText.target.value);
                  checkValidPassword(inputText.target.value);
                }}
                onBlur={(inputText: React.ChangeEvent<HTMLInputElement>) => {
                  checkValidPassword(inputText.target.value);
                  setShowPasswordRequirements(false);
                }}
                onFocus={() => setShowPasswordRequirements(true)}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (isValidEmail && event.key === "Enter") {
                    setShowOptionalComponents(true);
                  }
                }}
              />
              {!showOptionalComponents && (
                <button
                  type="button"
                  disabled={!isValidPassword}
                  onClick={() => setShowOptionalComponents(true)}
                >
                  Next
                </button>
              )}
            </div>
            {showPasswordRequirements && (
              <div style={{ marginTop: "2rem" }}>
                <div className={styles.flexContainer}>
                  {isPasswordLong ? <Tick /> : <Cross />}
                  <span className={styles.passwordRequirementsText}>
                    8 characters, or more
                  </span>
                </div>
                <div className={styles.flexContainer}>
                  {isPasswordSpecial ? <Tick /> : <Cross />}
                  <span className={styles.passwordRequirementsText}>
                    Number, special character or capital
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        {showOptionalComponents && (
          <>
            <h3>Optionals</h3>
            <div className={styles.flexContainer}>
              <Arrow />
              <input
                className={styles.formInput}
                id="form-element-first-name"
                name="first-name"
                placeholder="fist name"
                autoComplete="off"
                autoFocus
                value={firstName}
                onChange={(inputText: React.ChangeEvent<HTMLInputElement>) => {
                  setFirstName(inputText.target.value);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    selectNextFormElement();
                  }
                }}
              />
            </div>
            <div className={styles.flexContainer}>
              <Arrow />
              <input
                className={styles.formInput}
                id="form-element-last-name"
                name="last-name"
                placeholder="last name"
                autoComplete="off"
                value={lastName}
                onChange={(inputText: React.ChangeEvent<HTMLInputElement>) => {
                  setLastName(inputText.target.value);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    selectNextFormElement();
                  }
                }}
              />
            </div>
            <div className={styles.flexContainer}>
              <Arrow />
              <input
                className={styles.formInput}
                id="form-element-user-name"
                name="user-name"
                placeholder="user name"
                autoComplete="off"
                value={userName}
                onChange={(inputText: React.ChangeEvent<HTMLInputElement>) => {
                  setUserName(inputText.target.value);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    selectNextFormElement();
                  }
                }}
              />
            </div>
            <button
              id="form-element-finish-button"
              style={{ marginTop: "1rem" }}
              type="button"
              onClick={handelFormSubmit}
            >
              Finish
            </button>
          </>
        )}
      </div>
    </PageContainer>
  );
};
