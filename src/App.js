/**
 * Main AIMLA application shell.
 * Wires the visual layout, destination navigation, and streamed response panel together.
 */
import styled, { ThemeProvider, keyframes } from "styled-components";

import GlobalStyles from "./styles/GlobalStyles";
import { dark } from "./styles/Themes";
import Logo from "./components/Logo";
import { NAV_ITEMS, QUICK_PROMPTS } from "./app/routes";
import { APP_SUBTITLE, APP_TITLE } from "./app/shell";
import { useResolvedDestination } from "./hooks/useResolvedDestination";

const drift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -12px, 0); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.main`
  position: relative;
  min-height: 100vh;
  color: #fff;
  background:
    radial-gradient(circle at 52% 22%, rgba(0, 150, 255, 0.18), transparent 28%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.7)),
    #05070d;
  overflow-x: hidden;

  &::before {
    content: "";
    position: fixed;
    inset: -40%;
    background:
      repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.05) 0,
        rgba(255, 255, 255, 0.05) 1px,
        transparent 1px,
        transparent 36px
      ),
      repeating-linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.045) 0,
        rgba(255, 255, 255, 0.045) 1px,
        transparent 1px,
        transparent 36px
      );
    transform: perspective(900px) rotateX(67deg) scale(1.4);
    transform-origin: center top;
    opacity: 0.17;
    filter: blur(0.4px);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 8% 35%, rgba(0, 225, 255, 0.34) 0 9px, transparent 34px),
      radial-gradient(circle at 14% 62%, rgba(0, 180, 255, 0.3) 0 10px, transparent 35px),
      radial-gradient(circle at 26% 28%, rgba(0, 150, 255, 0.28) 0 8px, transparent 32px),
      radial-gradient(circle at 36% 56%, rgba(0, 200, 255, 0.35) 0 9px, transparent 36px),
      radial-gradient(circle at 51% 42%, rgba(0, 170, 255, 0.28) 0 10px, transparent 38px),
      radial-gradient(circle at 64% 68%, rgba(0, 210, 255, 0.31) 0 10px, transparent 38px),
      radial-gradient(circle at 76% 34%, rgba(0, 150, 255, 0.3) 0 12px, transparent 40px),
      radial-gradient(circle at 88% 55%, rgba(0, 200, 255, 0.32) 0 11px, transparent 38px),
      radial-gradient(circle at 95% 75%, rgba(0, 210, 255, 0.3) 0 10px, transparent 38px);
    filter: blur(14px);
    opacity: 0.9;
    pointer-events: none;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.62)),
    radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.16) 54%, rgba(0, 0, 0, 0.42) 100%);
  pointer-events: none;
`;

const Shell = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 1.75rem 1.5rem 2rem;
`;

const Canvas = styled.div`
  position: relative;
  min-height: calc(100vh - 3.5rem);
  display: grid;
  place-items: center;
`;

const SideNav = styled.nav`
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 3;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 7rem;
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${(props) =>
    props.$active ? "rgba(120, 190, 255, 0.38)" : "rgba(255, 255, 255, 0.14)"};
  background: ${(props) =>
    props.$active ? "rgba(20, 40, 70, 0.82)" : "rgba(10, 12, 18, 0.72)"};
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
  backdrop-filter: blur(6px);

  &:hover {
    background: rgba(20, 40, 70, 0.82);
    border-color: rgba(120, 190, 255, 0.38);
    transform: translateX(-2px);
  }
`;

const NavDot = styled.span`
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
  background: ${(props) => (props.$active ? "#7fd0ff" : "rgba(255, 255, 255, 0.85)")};
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.28);
  flex-shrink: 0;
`;

const Hero = styled.section`
  width: min(100%, 78rem);
  display: grid;
  gap: 1.5rem;
  justify-items: center;
  padding: 4rem 0 1rem;
  text-align: center;
  animation: ${fadeUp} 700ms ease both;
`;

const BrandRow = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 1rem;
  z-index: 3;

  @media (max-width: 600px) {
    left: 1rem;
    top: 0.9rem;
  }
`;

const Title = styled.h1`
  margin-top: clamp(-6rem, -8vw, -2.5rem);
  font-size: clamp(3.25rem, 7vw, 7.4rem);
  font-weight: 300;
  letter-spacing: clamp(0.2rem, 0.8vw, 0.55rem);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
  animation: ${drift} 9s ease-in-out infinite;
`;

const Subtitle = styled.p`
  margin-top: -0.4rem;
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.35);
`;

const Panel = styled.section`
  width: min(100%, 48rem);
  padding: 1.45rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 12, 20, 0.72);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(0, 140, 255, 0.08);
  backdrop-filter: blur(10px);
  text-align: left;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PanelTitle = styled.h2`
  color: #a8dbff;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
`;

const PanelTopic = styled.p`
  margin-top: 0.15rem;
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  color: #d3eeff;
  font-size: 0.8rem;
  background: rgba(0, 120, 220, 0.14);
  border: 1px solid rgba(0, 120, 220, 0.28);
  white-space: nowrap;
`;

const StatusDot = styled.span`
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: ${(props) => (props.$active ? "#66f0ff" : "#9cc9ff")};
  box-shadow: 0 0 8px rgba(102, 240, 255, 0.4);
`;

const StreamBox = styled.div`
  min-height: 12rem;
  padding: 1rem 1rem 1.2rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.5);
  color: #f5f9ff;
  line-height: 1.75;
  font-size: 1rem;
  white-space: pre-wrap;
`;

const Cursor = styled.span`
  display: inline-block;
  margin-left: 0.2rem;
  color: #7fd0ff;
  animation: blink 0.8s infinite;

  @keyframes blink {
    0%, 50% {
      opacity: 1;
    }

    51%, 100% {
      opacity: 0;
    }
  }
`;

const InputRow = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.9rem 1rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.94);
  color: #111827;
  font: inherit;
  font-size: 0.95rem;
  outline: none;

  &::placeholder {
    color: #6b7280;
  }
`;

const SendButton = styled.button`
  padding: 0.9rem 1.25rem;
  border: none;
  border-radius: 0.8rem;
  background: #0b8ddb;
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 180ms ease, opacity 180ms ease;
  white-space: nowrap;

  &:hover {
    background: #0879bd;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const Suggested = styled.p`
  margin-top: 0.9rem;
  color: #d0ddea;
  font-size: 0.9rem;
`;

const QuickLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.9rem;
`;

const QuickButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0.62rem 0.9rem;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease;

  &:hover {
    background: rgba(70, 140, 230, 0.18);
    border-color: rgba(70, 140, 230, 0.3);
  }
`;

function App() {
  const {
    activeDestination,
    activeDestinationId,
    inputValue,
    isStreaming,
    pushDestination,
    handleSubmit,
    setInputValue,
    suggestedQuery,
    visibleMessage,
  } = useResolvedDestination();

  const currentDestinationId = activeDestinationId || activeDestination?.id;
  const canSubmit = inputValue.trim().length > 0;

  return (
    <ThemeProvider theme={dark}>
      <GlobalStyles />
      <Page>
        <Overlay />
        <Shell>
          <BrandRow>
            <Logo />
          </BrandRow>

          <SideNav aria-label="AIMLA sections">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === currentDestinationId;

              return (
                <NavButton
                  key={item.id}
                  type="button"
                  $active={isActive}
                  onClick={() => pushDestination(item.id)}
                >
                  <NavDot $active={isActive} />
                  {item.label}
                </NavButton>
              );
            })}
          </SideNav>

          <Canvas>
            <Hero>
              <Title>{APP_TITLE}</Title>
              <Subtitle>{APP_SUBTITLE}</Subtitle>

              <Panel aria-label="AIMLA assistant panel">
                <PanelHeader>
                  <div>
                    <PanelTitle>AIMLA Assistant</PanelTitle>
                    <PanelTopic>{activeDestination?.title || "AIMLA"}</PanelTopic>
                  </div>

                  <Status>
                    <StatusDot $active={isStreaming} />
                    {isStreaming ? "Text streaming active" : "Ready"}
                  </Status>
                </PanelHeader>

                <StreamBox aria-live="polite" aria-busy={isStreaming}>
                  {visibleMessage}
                  {isStreaming ? <Cursor>|</Cursor> : null}
                </StreamBox>

                <InputRow onSubmit={handleSubmit}>
                  <TextInput
                    type="text"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="Ask about AIMLA, events, projects, members, joining, or contact..."
                    aria-label="Ask AIMLA a question"
                  />

                  <SendButton type="submit" disabled={!canSubmit}>
                    Send
                  </SendButton>
                </InputRow>

                {suggestedQuery ? (
                  <Suggested>Suggested question: {suggestedQuery}</Suggested>
                ) : null}

                <QuickLinks aria-label="Quick prompts">
                  {QUICK_PROMPTS.map((prompt) => (
                    <QuickButton
                      key={`${prompt.label}-${prompt.destinationId}`}
                      type="button"
                      onClick={() => pushDestination(prompt.destinationId)}
                    >
                      {prompt.label}
                    </QuickButton>
                  ))}
                </QuickLinks>
              </Panel>
            </Hero>
          </Canvas>
        </Shell>
      </Page>
    </ThemeProvider>
  );
}

export default App;