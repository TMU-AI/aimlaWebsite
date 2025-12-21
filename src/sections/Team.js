import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";


//Members:
import antonio from "../assets/Images/2025-26 team/Antonio.png"
import areej from "../assets/Images/2025-26 team/Areej.png"
import joel from "../assets/Images/2025-26 team/Joel.png"
import oliver from "../assets/Images/2025-26 team/Oliver.png"
import jenison from "../assets/Images/2025-26 team/Jenison.png"
import jermain from "../assets/Images/2025-26 team/Jermain.png"
import belal from "../assets/Images/2025-26 team/Belal.png"
import jarin from "../assets/Images/2025-26 team/Jarin.png"
import seif from "../assets/Images/2025-26 team/Seif.png"
import christina from "../assets/Images/2025-26 team/Christina.png"
import zu from "../assets/Images/2025-26 team/Zulaikha.png"
import derrick from "../assets/Images/2025-26 team/Derrick.png"
import walker from "../assets/Images/2025-26 team/Walker.png"
import nousha from "../assets/Images/2025-26 team/Nousha.png"
import maryam from "../assets/Images/2025-26 team/Maryam.png"
import shriya from "../assets/Images/2025-26 team/Shriya.png"
import malaika from "../assets/Images/2025-26 team/Malaika.png"
import null1 from "../assets/Images/2025-26 team/null1.png"
import null2 from "../assets/Images/2025-26 team/null2.png"
import null3 from "../assets/Images/2025-26 team/null3.png"


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

const FeaturedCard = styled(TeamCard)`
  max-width: 780px;
  margin: 0 auto;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.25));
  border: 1px solid rgba(255, 255, 255, 0.2);
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
      name: "Antonio Souza",
      title: "President",
      linkedin: "https://www.linkedin.com/in/antonio-souza-/",
      photo: antonio
    },
    subteams: ["Strategy Council", "Advisory Board"],
    members: [
    ]
  },
  {
    name: "Events",
    vp: [
      {
        name: "Areej Ubaid",
        title: "VP Events",
        linkedin: "https://www.linkedin.com/in/areej-ubaid/",
        photo: areej
      },
      {
        name: "Jarin Yasmin Mim",
        title: "VP Events",
        linkedin: "https://www.linkedin.com/in/jarin-tasnim-mim-b47310390/",
        photo: jarin
      }
    ],
    subteams: ["Logistics", "Experience", "Partnerships"],
    members: [
      //No sub members
    ]
  },
  {
    name: "Finances",
    vp: {
      name: "Seif Eltamboly",
      title: "VP Finance",
      linkedin: "https://www.linkedin.com/in/seifeltamboly/",
      photo: seif
    },
    subteams: ["Budgeting", "Funding"],
    members: [
      //No sub members
    ]
  },
  {
    name: "Marketing",
    vp: {
      name: "Jermain Antillon",
      title: "VP Marketing",
      linkedin: "#",
      photo: jermain
    },
    subteams: ["Brand", "Campaigns"],
    members: [
      { name: "Joel", linkedin: "#", photo: joel },
      { name: "Maryam Mehdi", linkedin: "#", photo: maryam },
      { name: "Shriya Gill", linkedin: "#", photo: shriya },
      { name: "Lana Duong", linkedin: "https://www.linkedin.com/in/lana-duong-b884012bb/", photo: null1 }

    ]
  },
  {
    name: "Infrastructure",
    vp: {
      name: "Oliver Manuel",
      title: "VP Infrastructure",
      linkedin: "https://www.linkedin.com/in/oliver-manuel-86b4b9387/",
      photo: oliver
    },
    subteams: ["DevOps", "Hardware", "AI Models"],
    members: [
      { name: "Derrick Lam",  linkedin: "https://www.linkedin.com/in/derrick-lam-09575b219/", photo: derrick },
      { name: "Skye", linkedin: "https://www.linkedin.com/in/dean-torallo/", photo: null2 },
      { name: "Walker Egsgard", linkedin: "https://www.linkedin.com/in/walker-egsgard/", photo: walker },
    ]
  },
  {
    name: "Outreach",
    vp: {
      name: "Jenison Joseph",
      title: "VP Outreach",
      linkedin: "https://www.linkedin.com/in/jenison-joseph-491077258/",
      photo: jenison
    },
    subteams: ["Community", "Partners"],
    members: [
      { name: "Ronald Bessada", linkedin: "https://www.linkedin.com/in/ronald-bessada-3b176a34a/", photo: null3 },
  
    ]
  },
  {
    name: "Social Media",
    vp: [
      {
        name: "Christina Vanni",
        title: "VP Social Media",
        linkedin: "https://www.linkedin.com/in/christina-vanni-1ba709389/",
        photo: christina
      },
      {
        name: "Zulaikha Khoram",
        title: "VP Social Media",
        linkedin: "https://www.linkedin.com/in/zulaikha-khoram-aa5186299/",
        photo: zu
      }
    ],
    subteams: ["Instagram", "Linkedin", "Content"],
    members: [
     // No members
    ]
  },
  {
    name: "Education",
    vp: {
      name: "Belal Armanazi",
      title: "VP Education",
      linkedin: "https://www.linkedin.com/in/belal-armanazi/",
      photo: belal
    },
    subteams: ["Workshops", "Projects", "Teaching"],
    members: [
      { name: "Nousha Borhani", linkedin: "https://www.linkedin.com/in/nousha-borhani/", photo: nousha },
    ]
  },
  {
    name: "General Member",
    vp: null,
    subteams: ["All Disciplines"],
    members: [
      { name: "Malaika Ali",  linkedin: "https://www.linkedin.com/in/malaika-ali-52a1b7239/", photo: malaika }
    ]
  }
];

const Team = () => {
  const president = teamStructure.find(team => team.name === "President");
  const otherTeams = teamStructure.filter(team => team.name !== "President");

  const CardContent = ({ team }) => {
    const leaders = Array.isArray(team.vp) ? team.vp : team.vp ? [team.vp] : [];
    const leaderNames = leaders.map(leader => leader.name).join(" & ");
    const leaderTitle = leaders[0]?.title || "Leadership";

    return (
      <>
        <Heading>
          <h3>{team.name}</h3>
          {leaders.length ? (
            <span>
              Led by {leaderTitle}
              {leaderNames ? ` — ${leaderNames}` : ""}
            </span>
          ) : (
            <span>Open membership collective</span>
          )}
        </Heading>

        {leaders.length ? (
          leaders.map(leader => (
            <Lead key={leader.name}>
              <Avatar src={leader.photo} alt={`${leader.name} avatar`} />
              <LeadInfo>
                <strong>{leader.name}</strong>
                <a href={leader.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </LeadInfo>
            </Lead>
          ))
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
      </>
    );
  };

  return (
    <Section id="team" data-scroll-section>
      <Inner>
        <Title data-scroll data-scroll-speed="-1.2" data-scroll-direction="horizontal">
          Meet the Team
        </Title>
        <Intro>
          Each department is led by a dedicated vice president and supported by specialized
          sub-teams. Swap in your real portraits and LinkedIn links to spotlight the people
          building AIMLA.
        </Intro>

        {president && (
          <FeaturedCard
            key={president.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <CardContent team={president} />
          </FeaturedCard>
        )}

        <TeamGrid>
          {otherTeams.map(team => (
            <TeamCard
              key={team.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent team={team} />
            </TeamCard>
          ))}
        </TeamGrid>
      </Inner>
    </Section>
  );
};

export default Team;
