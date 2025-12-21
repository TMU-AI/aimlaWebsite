import React from "react"
import styled from "styled-components"
import { motion } from "framer-motion"

import ImgOne from "../assets/Images/2.JPG"
import ImgTwo from "../assets/Images/aimlaTeam.JPG"
import ImgThree from "../assets/Images/crowd1.JPG"

const Section = styled.section`
position: relative;
min-height: 100vh;
width: 100vw;
overflow: hidden;
padding: 6rem 5vw 4rem;
background: radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 60%), ${props => props.theme.body};

&::after{
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), transparent 55%);
    pointer-events: none;
}
`

const Title = styled.h1`
font-size: ${props => props.theme.frontBig};
font-family: 'Orbitron', 'Sirin Stencil', sans-serif;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
text-align: left;
color: ${props => props.theme.text};

margin-bottom: 3rem;
position: relative;
z-index: 2;
`

const Content = styled.div`
position: relative;
z-index: 2;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
gap: 3rem;
align-items: start;
`

const Copy = styled(motion.div)`
color: ${props => props.theme.text};
max-width: 580px;
line-height: 1.7;
font-size: clamp(1.1rem, 2.2vw, 1.5rem);
`

const Highlight = styled.span`
display: block;
font-size: clamp(1.5rem, 3.3vw, 2.2rem);
font-weight: 700;
letter-spacing: 0.04em;
text-transform: uppercase;
margin-bottom: 1rem;
color: ${props => props.theme.text};
`

const StackedGallery = styled.div`
position: relative;
min-height: 620px;
width: 100%;

@media (max-width: 768px) {
    min-height: auto;
}
`

const ImageCard = styled(motion.figure)`
position: absolute;
width: clamp(220px, 32vw, 380px);
padding: 1rem 1rem 2.5rem;
background: #fff;
border-radius: 0.85rem;
box-shadow: 0 25px 45px rgba(0,0,0,0.45);
transform: rotate(${props => props.$rotate || 0}deg);
top: ${props => props.$top || '0%'};
left: ${props => props.$left || '0%'};
z-index: ${props => props.$z || 1};

&::after{
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.85rem;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
    pointer-events: none;
}

@media (max-width: 768px) {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    width: 100%;
    margin-bottom: 1.5rem;
}
`

const StyledImg = styled.img`
width: 100%;
height: ${props => props.$contain ? 'auto' : '320px'};
object-fit: ${props => props.$contain ? 'contain' : 'cover'};
border-radius: 0.45rem;
display: block;
`

const About = () => {
    const gallery = [
        { src: ImgOne, alt: "AIMLA workshop photo", contain: true, rotate: -9, top: '0%', left: '0%', z: 3, speed: -0.5 },
        { src: ImgTwo, alt: "AIMLA team photo", contain: true, rotate: 5, top: '12%', left: '33%', z: 4, speed: 0.2 },
        { src: ImgThree, alt: "AIMLA community crowd", rotate: -2, top: '50%', left: '15%', z: 2, speed: 0.5 }
    ]

    return (
        <Section id="about" data-scroll-section>
            <Title data-scroll data-scroll-speed='-2' data-scroll-direction='horizontal'>
                About Us
            </Title>

            <Content>
                <Copy
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Highlight>Hey we are TMU AIMLA</Highlight>
                    <p>
                        We bridge the gap between classroom theory and real-world AI. AIMLA is the club where TMU students roll up
                        their sleeves on hands-on projects, learn modern tools together, and get guidance from industry professionals
                        who have been down the path before.
                    </p>
                    <p>
                        From building models to shipping demos, we create a supportive space to experiment, ask questions, and move
                        faster than any syllabus. If you want to turn curiosity into capability—and do it alongside a community that
                        believes you can—this is your launchpad.
                    </p>
                </Copy>

                <StackedGallery>
                    {gallery.map((photo, idx) => (
                        <ImageCard
                            key={photo.src}
                            $rotate={photo.rotate}
                            $top={photo.top}
                            $left={photo.left}
                            $z={photo.z}
                            data-scroll
                            data-scroll-speed={photo.speed}
                            initial={{ opacity: 0, y: 60, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.55, delay: idx * 0.12, ease: "easeOut" }}
                        >
                            <StyledImg
                                src={photo.src}
                                alt={photo.alt}
                                loading="lazy"
                                $contain={photo.contain}
                            />
                        </ImageCard>
                    ))}
                </StackedGallery>
            </Content>
        </Section>
    )
}

export default About
