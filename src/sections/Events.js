import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import ImgOne from "../assets/Images/2.JPG";
import ImgTwo from "../assets/Images/aimlaTeam.JPG";
import ImgThree from "../assets/Images/crowd1.JPG";

const Section = styled.section`
  width: 100%;
  padding: 6rem 5vw 5rem;
  background: radial-gradient(
      circle at top,
      rgba(255, 255, 255, 0.07),
      transparent 60%
    ),
    ${props => props.theme.body};
  color: ${props => props.theme.text};
`;

const Inner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.frontBig};
  font-family: "Orbitron", "Sirin Stencil", sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 3rem;
  text-align: center;
  color: ${props => props.theme.text};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  text-align: center;
  gap: 0.4rem;

  h3 {
    font-size: clamp(1.2rem, 3vw, 2rem);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  span {
    font-size: 0.95rem;
    opacity: 0.8;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const Card = styled(motion.article)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  margin: 0 0 0.4rem;
`;

const Meta = styled.p`
  font-size: 0.95rem;
  opacity: 0.85;
  margin-bottom: 0.25rem;
`;

const Location = styled.p`
  font-size: 0.9rem;
  opacity: 0.75;
  margin-bottom: 0.8rem;
`;

const Description = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  flex: 1;
`;

const PrimaryButton = styled.button`
  align-self: flex-start;
  padding: 0.45rem 1.2rem;
  border: 1px solid ${props => props.theme.text};
  background: transparent;
  color: ${props => props.theme.text};
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${props => props.theme.text};
    color: ${props => props.theme.body};
  }
`;

const ToggleButton = styled(PrimaryButton)`
  margin: 2rem auto 0;
  display: block;
`;

const PreviousHeader = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  color: inherit;
  text-align: left;
  padding: 0;
  cursor: pointer;
`;

const ToggleIcon = styled.span`
  font-size: 2rem;
  line-height: 1;
  margin-left: 0.75rem;
`;

const Cover = styled.div`
  width: 100%;
  height: 170px;
  border-radius: 0.9rem;
  overflow: hidden;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.08);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const DetailContent = styled(motion.div)`
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: hidden;

  p {
    margin-bottom: 0.35rem;
  }

  a {
    color: ${props => props.theme.text};
    text-decoration: underline;
  }
`;

const Events = () => {
  const upcomingEvents = [
    {
      id: "upcoming-1",
      title: "AI Kickoff Night",
      date: "Sept 28, 2024",
      location: "SLC Auditorium",
      description:
        "Meet the exec team, learn about this year's roadmap, and grab your welcome kit."
    },
    {
      id: "upcoming-2",
      title: "Intro to ML Workshop",
      date: "Oct 10, 2024",
      location: "ENG 204",
      description: "Hands-on crash course covering data prep, models, and demos."
    },
    {
      id: "upcoming-3",
      title: "Industry Mixer",
      date: "Oct 24, 2024",
      location: "DMZ Lounge",
      description: "Network with alumni and partners hiring for AI/ML roles."
    },
    {
      id: "upcoming-4",
      title: "Hack the Future",
      date: "Nov 5, 2024",
      location: "ARC Innovation Lab",
      description: "24-hour sprint building AI projects aimed at campus life."
    }
  ];

  const previousEvents = [
    {
      id: "past-1",
      title: "Spring Research Showcase",
      date: "Apr 14, 2024",
      description:
        "Members presented projects covering healthcare AI, robotics, and generative design.",
      link: "#",
      cover: ImgOne
    },
    {
      id: "past-2",
      title: "Women in AI Panel",
      date: "Mar 8, 2024",
      description:
        "Leaders from industry shared career advice and opened mentorship spots.",
      link: "#",
      cover: ImgTwo
    },
    {
      id: "past-3",
      title: "Edge Device Hackathon",
      date: "Jan 27, 2024",
      description:
        "Teams built solutions for smart campus infrastructure powered by embedded ML.",
      link: "#",
      cover: ImgThree
    },
    {
      id: "past-4",
      title: "Autonomous Cars Lab Tour",
      date: "Nov 19, 2023",
      description:
        "A behind-the-scenes visit to TMU's intelligent mobility research hub.",
      link: "#",
      cover: ImgTwo
    }
  ];

  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [openEventId, setOpenEventId] = useState(null);

  const primaryUpcoming = upcomingEvents.slice(0, 3);
  const extraUpcoming = upcomingEvents.slice(3);

  const primaryPrevious = previousEvents.slice(0, 3);
  const extraPrevious = previousEvents.slice(3);

  const handleToggleDetails = id => {
    setOpenEventId(prev => (prev === id ? null : id));
  };

  return (
    <Section id="events">
      <Inner>
        <Title data-scroll data-scroll-speed='-1.5' data-scroll-direction='horizontal'>
          Events
        </Title>

        <SectionHeader>
          <h3>Upcoming</h3>
          <span>Announcements &amp; sign-ups</span>
        </SectionHeader>

        <Grid>
          {primaryUpcoming.map(event => (
            <Card
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <CardTitle>{event.title}</CardTitle>
                <Meta>{event.date}</Meta>
                <Location>{event.location}</Location>
                <Description>{event.description}</Description>
              </div>
            </Card>
          ))}
        </Grid>

        {showAllUpcoming && extraUpcoming.length > 0 && (
          <Grid style={{ marginTop: "1.5rem" }}>
            {extraUpcoming.map(event => (
              <Card
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <Meta>{event.date}</Meta>
                  <Location>{event.location}</Location>
                  <Description>{event.description}</Description>
                </div>
              </Card>
            ))}
          </Grid>
        )}

        {extraUpcoming.length > 0 && (
          <ToggleButton onClick={() => setShowAllUpcoming(s => !s)}>
            {showAllUpcoming ? "Show Less" : "More"}
          </ToggleButton>
        )}

        <SectionHeader style={{ marginTop: "4rem" }}>
          <h3>Previous</h3>
          <span>Tap for highlights</span>
        </SectionHeader>

        <Grid>
          {primaryPrevious.map(event => (
            <Card
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Cover>
                <img src={event.cover} alt={`${event.title} cover`} loading="lazy" />
              </Cover>
              <PreviousHeader onClick={() => handleToggleDetails(event.id)}>
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <Meta>{event.date}</Meta>
                </div>
                <ToggleIcon>{openEventId === event.id ? "−" : "+"}</ToggleIcon>
              </PreviousHeader>
              <AnimatePresence initial={false}>
                {openEventId === event.id && (
                  <DetailContent
                    key={`${event.id}-detail`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{event.description}</p>
                    <p>
                      Photos:{" "}
                      <a href={event.link} target="_blank" rel="noreferrer">
                        View gallery
                      </a>
                    </p>
                  </DetailContent>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </Grid>

        {showAllPrevious && extraPrevious.length > 0 && (
          <Grid style={{ marginTop: "1.5rem" }}>
            {extraPrevious.map(event => (
              <Card
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <Cover>
                  <img src={event.cover} alt={`${event.title} cover`} loading="lazy" />
                </Cover>
                <PreviousHeader onClick={() => handleToggleDetails(event.id)}>
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <Meta>{event.date}</Meta>
                  </div>
                  <ToggleIcon>{openEventId === event.id ? "−" : "+"}</ToggleIcon>
                </PreviousHeader>
                <AnimatePresence initial={false}>
                  {openEventId === event.id && (
                    <DetailContent
                      key={`${event.id}-detail`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{event.description}</p>
                      <p>
                        Photos:{" "}
                        <a href={event.link} target="_blank" rel="noreferrer">
                          View gallery
                        </a>
                      </p>
                    </DetailContent>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </Grid>
        )}

        {extraPrevious.length > 0 && (
          <ToggleButton onClick={() => setShowAllPrevious(s => !s)}>
            {showAllPrevious ? "Show Less" : "More"}
          </ToggleButton>
        )}
      </Inner>
    </Section>
  );
};

export default Events;
