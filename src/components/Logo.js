import React from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import AIMLAlogo from '../assets/Images/AIMLAlogo.png'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`


const Container = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 5;
`

const LogoImg = styled.img`
  display: block;
  opacity: 0; /* start hidden and fade in */
  /* larger and responsive: grows on wide screens, stays reasonable on phones */
  width: clamp(6rem, 12vw, 16rem);
  height: auto;
  transition: transform 180ms ease, filter 180ms ease;
  animation: ${fadeIn} 700ms ease forwards;
  animation-delay: 0.12s;

  &:hover {
    transform: scale(1.03);
  }

  @media (max-width: 480px) {
    width: clamp(4rem, 22vw, 8rem);
  }
`

const Logo = () => {
  return (
    <Container>
        <Link to='/' aria-label="AIMLA Home">
            <LogoImg src={AIMLAlogo} alt="AIMLAlogo" />
        </Link>
    </Container>
  )
}

export default Logo
