import React from "react"
import styled from "styled-components"
import CoverVideo from "../components/CoverVideo"
import Logo from "../components/Logo"



const Section = styled.section`
position: relative;
min-height: 100vh;
overflow: hidden;
`

const Home = () => {
    return (
        <Section id="home" data-scroll-section>
            <CoverVideo />
            <Logo />
        </Section>
    )
}

export default Home
