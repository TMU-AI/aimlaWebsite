import React from "react"
import styled from "styled-components"
import CoverVideo from "../components/CoverVideo"
import Logo from "../components/Logo"
import Nav from "../components/Nav"



const Section = styled.section`
position: relative;
min-height: 200vh;
overflow: hidden;
`

const Home = () => {
    return(
        <Section>
            <CoverVideo />
            <Logo />
            <Nav />
            <h1>hey</h1>
        </Section>
    )
}

export default Home