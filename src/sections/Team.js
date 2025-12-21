import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import PlaceholderImg from "../assets/Images/AIMLAlogo.png";

const Section = styled.section`
  width: 100%;
  padding: 8rem 4vw 5rem 0vw;
  background: radial-gradient(
      circle at top,
      rgba(255, 255, 255, 0.05),
      transparent 65%
    ),
    ${props => props.theme.body};
  color: ${props => props.theme.text};
`;

const Inner = styled.div`
  max-width: 1150px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.frontBig};
  font-family: "Orbitron", "Sirin Stencil", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
`;

const Intro = styled.p`
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.6;
  opacity: 0.85;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1.8rem;
`;

const TeamCard = styled(motion.article)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  padding: 1.6rem;
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  h3 {
    text-transform: uppercase;
    font-size: clamp(1.1rem, 2vw, 1.5rem);
    letter-spacing: 0.08em;
  }

  span {
    font-size: 0.95rem;
    opacity: 0.75;
  }
`;

const Lead = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
`;

const LeadInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  strong {
    font-size: 1rem;
  }

  a {
    color: ${props => props.theme.text};
    font-size: 0.85rem;
    opacity: 0.8;
    text-decoration: underline;
  }
`;

const SubteamTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.25rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const MemberList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

const MemberCard = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  padding: 0.75rem;
`;

const MemberAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
`;

const MemberName = styled.p`
  font-weight: 600;
  font-size: 0.95rem;
`;

const MemberRole = styled.p`
  font-size: 0.85rem;
  opacity: 0.75;
`;

const MemberLink = styled.a`
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: ${props => props.theme.text};
  text-decoration: underline;
`;

const Note = styled.p`
  font-size: 0.9rem;
  opacity: 0.7;
  font-style: italic;
`;

const teamStructure = [
  {
    name: "President",
    vp: {
      name: "Sofia Patel",
      title: "President",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["Strategy Council", "Advisory Board"],
    members: [
      { name: "Jordan Lee", role: "Chief of Staff", linkedin: "#", photo: PlaceholderImg },
      { name: "Maya Torres", role: "Operations", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Events",
    vp: {
      name: "Marcus Wang",
      title: "VP Events",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["Logistics", "Experience", "Partnerships"],
    members: [
      { name: "Priya Menon", role: "Experience Lead", linkedin: "#", photo: PlaceholderImg },
      { name: "Leo Park", role: "Sponsorships", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Finances",
    vp: {
      name: "Elena Rossi",
      title: "VP Finance",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["Budgeting", "Funding"],
    members: [
      { name: "Samir Khan", role: "Budget Analyst", linkedin: "#", photo: PlaceholderImg },
      { name: "Hannah Doyle", role: "Fundraising", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Marketing",
    vp: {
      name: "Noah Martinez",
      title: "VP Marketing",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["Brand", "Campaigns"],
    members: [
      { name: "Isabella Cruz", role: "Brand Designer", linkedin: "#", photo: PlaceholderImg },
      { name: "Ethan Price", role: "Copywriter", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Infrastructure",
    vp: {
      name: "Gabriel Singh",
      title: "VP Infrastructure",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["DevOps", "Hardware"],
    members: [
      { name: "Ayaan Malik", role: "Systems Lead", linkedin: "#", photo: PlaceholderImg },
      { name: "Lena Hoffman", role: "Lab Manager", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Outreach",
    vp: {
      name: "Tessa Morgan",
      title: "VP Outreach",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["Community", "Partners"],
    members: [
      { name: "Riley Chen", role: "Community Liaison", linkedin: "#", photo: PlaceholderImg },
      { name: "Diego Alvarez", role: "Partnerships", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Social Media",
    vp: {
      name: "Harper O'Neil",
      title: "VP Social Media",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: [],
    members: [
      { name: "Mila Santos", role: "Content", linkedin: "#", photo: PlaceholderImg },
      { name: "Omar Reyes", role: "Video", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "Education",
    vp: {
      name: "Lucas Bennett",
      title: "VP Education",
      linkedin: "#",
      photo: PlaceholderImg
    },
    subteams: ["Workshops", "Projects"],
    members: [
      { name: "Caroline Zhou", role: "Workshop Lead", linkedin: "#", photo: PlaceholderImg },
      { name: "Nina Patel", role: "Project Mentor", linkedin: "#", photo: PlaceholderImg }
    ]
  },
  {
    name: "General Member",
    vp: null,
    subteams: ["All Disciplines"],
    members: [
      { name: "Open Roles", role: "Join the crew", linkedin: "#", photo: PlaceholderImg }
    ]
  }
];

const Team = () => {
  return (
    <Section id="team">
      <Inner>
        <Title data-scroll data-scroll-speed="-1.2" data-scroll-direction="horizontal">
          Meet the Team
        </Title>
        <Intro>
          Each department is led by a dedicated vice president and supported by specialized
          sub-teams. Swap in your real portraits and LinkedIn links to spotlight the people
          building AIMLA.
        </Intro>

        <TeamGrid>
          {teamStructure.map(team => (
            <TeamCard
              key={team.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4 }}
            >
              <Heading>
                <h3>{team.name}</h3>
                {team.vp ? (
                  <span>Led by {team.vp.title}</span>
                ) : (
                  <span>Open membership collective</span>
                )}
              </Heading>

              {team.vp ? (
                <Lead>
                  <Avatar src={team.vp.photo} alt={`${team.vp.name} avatar`} />
                  <LeadInfo>
                    <strong>{team.vp.name}</strong>
                    <a href={team.vp.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </LeadInfo>
                </Lead>
              ) : (
                <Note>No VP assignment — guided by our exec council.</Note>
              )}

              {team.subteams?.length ? (
                <SubteamTags>
                  {team.subteams.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </SubteamTags>
              ) : (
                <Note>No formal subteam — agile social squad.</Note>
              )}

              <MemberList>
                {team.members.map(member => (
                  <MemberCard key={member.name}>
                    <MemberAvatar src={member.photo} alt={`${member.name} portrait`} />
                    <MemberName>{member.name}</MemberName>
                    <MemberRole>{member.role}</MemberRole>
                    <MemberLink href={member.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </MemberLink>
                  </MemberCard>
                ))}
              </MemberList>
            </TeamCard>
          ))}
        </TeamGrid>
      </Inner>
    </Section>
  );
};

export default Team;
