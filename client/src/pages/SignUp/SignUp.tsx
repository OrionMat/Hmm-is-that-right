import React, { useRef, useState } from "react";
import { styled } from "styled-components";
import { PageContainer } from "../../components/PageContainer";
import { colors } from "../../styles/colors";
import { Arrow } from "../../components/Arrow";
import { Tick } from "../../components/Tick";
import { Cross } from "../../components/Cross";
import { fontSize, fonts } from "../../styles/fonts";

const SignUpBox = styled.div`
  width: 100%;
  max-width: 654px;
  padding: 1.5rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 1rem;
`;

const SecondaryHeader = styled.h3`
  color: ${colors.darkGrey};
  margin-bottom: 1.5rem;
  overflow: hidden; /* Ensures the content is not revealed until the animation */
  border-right: 0.15em solid transparent; /* The typewriter cursor */
  white-space: nowrap;
  animation: typing 2s steps(50, end), blink-caret 3s step-end 1;

  /* The typing effect */
  @keyframes typing {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  /* The typewriter blinking cursor effect */
  @keyframes blink-caret {
    from,
    100% {
      border-color: transparent;
    }
    0% {
      border-color: ${colors.darkGrey};
    }
  }
`;

const FormInput = styled.input`
  outline: none;
  border: none;
  font-family: ${fonts.primary};
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const PasswordRequirementsText = styled.span`
  font-size: ${fontSize.smaller};
  margin: 0.5rem 0;
`;

export const SignUp = () => {
  // email state
  const [isValidEmail, setIsValidEmail] = useState(false);

  // password state
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isPasswordLong, setIsValidLong] = useState(false);
  const [isPasswordSpecial, setIsPasswordSpecial] = useState(false);

  // show components state
  const [showPasswordComponents, setShowPasswordComponents] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [showOptionalComponents, setShowOptionalComponents] = useState(false);

  function checkValidEmail(inputText: string) {
    const matches = inputText.match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    );
    const isValid = matches !== null ? true : false;
    setIsValidEmail(isValid);
  }

  function checkValidPassword(inputText: string) {
    let isPasswordValid = true;

    // check password is 8 or more characters
    if (inputText.length >= 8) {
      setIsValidLong(true);
    } else {
      isPasswordValid = false;
      setIsValidLong(false);
    }

    // check password has a number, uppercase or special character
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
      document.querySelectorAll<HTMLInputElement>('[id^="form-element-"]')
    );
    const currentInput = document.activeElement as HTMLInputElement;
    if (currentInput) {
      const currentInputIndex = inputs.indexOf(currentInput);
      const nextInputIndex = (currentInputIndex + 1) % inputs.length;
      const input = inputs[nextInputIndex];
      input.focus();
    }
  }

  return (
    <PageContainer id="signup-content">
      <SignUpBox>
        <form>
          <div style={{ width: "fit-content" }}>
            <SecondaryHeader>Lets begin the adventure!</SecondaryHeader>
          </div>
          <h3>Enter your email</h3>
          <FlexContainer>
            {isValidEmail ? <Tick /> : <Arrow />}
            <label hidden>Email address</label>
            <FormInput
              id="email-address"
              type="email"
              name="email"
              required
              autoFocus
              autoComplete="off"
              onChange={(inputEvent: React.ChangeEvent<HTMLInputElement>) =>
                checkValidEmail(inputEvent.target.value)
              }
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
          </FlexContainer>
          {showPasswordComponents && (
            <>
              <h3>Create a password</h3>
              <FlexContainer>
                {isValidPassword ? <Tick /> : <Arrow />}
                <label hidden>Password</label>
                <FormInput
                  id="password"
                  type="password"
                  autoComplete="off"
                  spellCheck="false"
                  required
                  autoFocus
                  onChange={(inputText: React.ChangeEvent<HTMLInputElement>) =>
                    checkValidPassword(inputText.target.value)
                  }
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
              </FlexContainer>
              {showPasswordRequirements && (
                <div style={{ marginTop: "2rem" }}>
                  <FlexContainer>
                    {isPasswordLong ? <Tick /> : <Cross />}
                    <PasswordRequirementsText>
                      8 characters, or more
                    </PasswordRequirementsText>
                  </FlexContainer>
                  <FlexContainer>
                    {isPasswordSpecial ? <Tick /> : <Cross />}
                    <PasswordRequirementsText>
                      Number, special character or capital
                    </PasswordRequirementsText>
                  </FlexContainer>
                </div>
              )}
            </>
          )}
          {showOptionalComponents && (
            <>
              <h3>Optionals</h3>
              <FlexContainer>
                <Arrow />
                <FormInput
                  id="form-element-first-name"
                  name="first-name"
                  placeholder="fist name"
                  autoComplete="off"
                  autoFocus
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      selectNextFormElement();
                    }
                  }}
                />
              </FlexContainer>
              <FlexContainer>
                <Arrow />
                <FormInput
                  id="form-element-last-name"
                  name="last-name"
                  placeholder="last name"
                  autoComplete="off"
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      selectNextFormElement();
                    }
                  }}
                />
              </FlexContainer>
              <FlexContainer>
                <Arrow />
                <FormInput
                  id="form-element-user-name"
                  name="user-name"
                  placeholder="user name"
                  autoComplete="off"
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      selectNextFormElement();
                    }
                  }}
                />
              </FlexContainer>
              <button
                id="form-element-finish-button"
                style={{ marginTop: "1rem" }}
                type="button"
                onClick={() => {}}
              >
                Finish
              </button>
            </>
          )}
        </form>
      </SignUpBox>
    </PageContainer>
  );
};
