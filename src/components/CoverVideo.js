import React from 'react';
import styled from 'styled-components';
import MainVideo from '../assets/background.mp4';



const VideoContainer = styled.section`
  width: 100%;
  height: 100vh;
  position: relative;

  video{
    width: 100%;
    height: 100vh;
    object-fit: cover;
    z-index: 1;
    display: block;
  }
`

const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;

  /* Use theme bodyRgba ("R,G,B") and set alpha for darkness */
  background-color: ${props => `rgba(${props.theme.bodyRgba}, 0.8)`};
  pointer-events: none; /* allow clicks through overlay */
`

const Title = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;

  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.text};
  text-align: center;

  > div {
    width: 100%;
    max-width: 1200px;
    padding: 0 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }




  .letters {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: nowrap;

    .spacer {
      width: 3rem; /* wider gap between TMU and AIMLA */
      min-width: 1.2rem;
      display: inline-block;
    }
  }

  /* Mobile-only stacked lines (TMU / AI / ML) — hidden on desktop */
  .mobile-lines {
    display: none;
    flex-direction: column;
    gap: 0.4rem;
    align-items: center;
  }

  /* Responsive typography */
  h1{
    font-family: 'Orbitron', 'Sirin Stencil', sans-serif;
    font-size: clamp(2.4rem, 8vw, 10rem); /* scales from phone to desktop */
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
    margin: 0;
    line-height: 1;
  }

  h2{
    font-family: 'Sirin Stencil', sans-serif;
    font-size: clamp(0.95rem, 3.5vw, 1.25rem);
    margin: 0.5rem 0 0;
    opacity: 0.95;
  }

  /* Extra small screens adjustments */
  @media (max-width: 480px) {
    /* hide per-letter desktop layout on phones */
    .letters {
      display: none;
    }

    /* show stacked mobile layout */
    .mobile-lines {
      display: flex;
    }

    .mobile-lines .mobile-line {
      font-size: clamp(2.2rem, 10vw, 4.5rem);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .letters .spacer {
      width: 1.2rem;
      min-width: 1.2rem;
    }

    h1 {
      font-size: clamp(2rem, 12vw, 6rem);
      letter-spacing: 0.03em;
    }

    h2 {
      font-size: 0.95rem;
    }
  }


  h1{
    font-family: 'Orbitron', 'Sirin Stencil', sans-serif;
    font-size: ${props => props.theme.frontBig};
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
    margin: 0;
    line-height: 1;
  }

  h2{
    font-family: 'Sirin Stencil', sans-serif;
    font-size: ${props => props.theme.frontlg};
    margin: 0.5rem 0 0;
    opacity: 0.95;
  }
`



const CoverVideo = () => {
  return (
    <VideoContainer>
      <DarkOverlay />
      <Title>
        <div>
          <div className="letters">
            <h1 data-scroll data-scroll-delay="0.03" data-scroll-speed="4">T</h1>
            <h1 data-scroll data-scroll-delay="0.06" data-scroll-speed="4">M</h1>
            <h1 data-scroll data-scroll-delay="0.12" data-scroll-speed="4">U</h1>
            <div className="spacer" aria-hidden />
            <h1 data-scroll data-scroll-delay="0.18" data-scroll-speed="4">A</h1>
            <h1 data-scroll data-scroll-delay="0.24" data-scroll-speed="4">I</h1>
            <h1 data-scroll data-scroll-delay="0.30" data-scroll-speed="4">M</h1>
            <h1 data-scroll data-scroll-delay="0.36" data-scroll-speed="4">L</h1>
            <h1 data-scroll data-scroll-delay="0.42" data-scroll-speed="4">A</h1>
          </div>

          {/* Mobile stacked version: TMU / AI / ML */}
          <div className="mobile-lines" aria-hidden="false">
            <h1 className="mobile-line">TMU</h1>
            <h1 className="mobile-line">AI</h1>
            <h1 className="mobile-line">ML</h1>
          </div>

          <h2 data-scroll data-scroll-delay="0.42" data-scroll-speed="4">TMU AI and Machine Learning Association</h2>
        </div>
      </Title>
        <video src ={MainVideo}   type='video/mp4' autoPlay muted loop />
      
    </VideoContainer>
  )
}

export default CoverVideo
