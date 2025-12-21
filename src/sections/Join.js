import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const JOIN_FORM_URL = "https://forms.gle/E1btSHLFcBvhta3S7";
const COLLAB_FORM_URL = "https://forms.gle/hdURjfyYkerg5DhU8";
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/tmu_aimla/",
  linkedin: "https://www.linkedin.com/company/tmu-aimla/",
  discord: "https://discord.gg/NJWWDRT62U"
};

const Section = styled.section`
  width: 100%;
  padding: 9rem 5vw 5rem 18vw;
  background: radial-gradient(
      circle at top,
      rgba(255, 255, 255, 0.07),
      transparent 75%
    ),
    ${props => props.theme.body};
  color: ${props => props.theme.text};
`;

const Inner = styled.div`
  max-width: 1100px;
  width: 100%;
  margin: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.frontBig};
  font-family: "Orbitron", "Sirin Stencil", sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
`;

const Subtext = styled.p`
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.85;
  font-size: clamp(1rem, 2vw, 1.15rem);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
`;

const Card = styled(motion.article)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const CardTitle = styled.h3`
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const Copy = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.85;
  flex: 1;
`;

const PrimaryLink = styled.a`
  align-self: flex-start;
  padding: 0.6rem 1.3rem;
  border: 1px solid ${props => props.theme.text};
  background: transparent;
  color: ${props => props.theme.text};
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;

  &:hover {
    background: ${props => props.theme.text};
    color: ${props => props.theme.body};
  }
`;

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const FooterText = styled.p`
  opacity: 0.8;
  font-size: 0.95rem;
`;

const EmailLink = styled.a`
  color: ${props => props.theme.text};
  text-decoration: underline;
`;

const Socials = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const IconButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: ${props => props.theme.text};
  text-decoration: none;
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.25s ease;

  &:hover {
    border-color: ${props => props.theme.text};
    background: rgba(255, 255, 255, 0.08);
  }
`;

const IconWrap = styled.span`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
`;

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M8 10v7" />
    <path d="M12.5 17v-3.8c0-1.2.9-2.2 2.1-2.2s2.4 1 2.4 2.2V17" />
    <circle cx="8" cy="7.5" r="1.1" />
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6.5c-1.5-.7-2.9-1.1-4.3-1.3l-.6 1.2a13 13 0 0 0-6.2 0L8.3 5.2C6.9 5.4 5.5 5.8 4 6.5 2.2 9.5 1.7 12.6 2 16c1.8 1.4 3.6 2.2 5.3 2.7l.8-1.6c1.8.4 3.8.4 5.6 0l.8 1.6c1.7-.5 3.5-1.3 5.3-2.7.3-3.3-.2-6.4-1.8-9.4Z" />
    <circle cx="9.5" cy="12.2" r="0.9" />
    <circle cx="14.5" cy="12.2" r="0.9" />
  </svg>
);

const Join = () => {
  return (
    <Section id="join" data-scroll-section>
      <Inner>
        <Title data-scroll data-scroll-speed="-1" data-scroll-direction="horizontal">
          Join the Team
        </Title>
        <Subtext>
          Whether you want to build alongside us or partner with AIMLA on future initiatives, we would
          love to hear from you.
        </Subtext>

        <Grid>
          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35 }}
          >
            <CardTitle>Join the Team</CardTitle>
            <Copy>
              Add your name to our roster, get updates on openings, and plug into projects, workshops,
              and events. The form takes just a minute.
            </Copy>
            <PrimaryLink href={JOIN_FORM_URL} target="_blank" rel="noreferrer">
              Open Google Form
            </PrimaryLink>
          </Card>

          <Card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <CardTitle>Collaborate with AIMLA</CardTitle>
            <Copy>
              Bring your club, company, or community to the table. We partner on hack nights, panels,
              sponsorships, and custom programming tailored to your goals.
            </Copy>
            <PrimaryLink href={COLLAB_FORM_URL} target="_blank" rel="noreferrer">
              Start a Collaboration
            </PrimaryLink>
          </Card>
        </Grid>

        <Footer>
          <FooterText>
            Stay connected with AIMLA across our channels. Questions?{" "}
            <EmailLink href="mailto:aimla@gmail.com">aimla.tmu@gmail.com</EmailLink>
          </FooterText>
          <Socials>
            <IconButton href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
              <IconWrap aria-hidden="true">
                <InstagramIcon />
              </IconWrap>
              Instagram
            </IconButton>
            <IconButton href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
              <IconWrap aria-hidden="true">
                <LinkedInIcon />
              </IconWrap>
              LinkedIn
            </IconButton>
            <IconButton href={SOCIAL_LINKS.discord} target="_blank" rel="noreferrer">
              <IconWrap aria-hidden="true">
                <DiscordIcon />
              </IconWrap>
              Discord
            </IconButton>
          </Socials>
        </Footer>
      </Inner>
    </Section>
  );
};

export default Join;
