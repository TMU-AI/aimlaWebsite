import React, { useState } from 'react'
import styled from 'styled-components';
import { motion } from 'framer-motion';

const MenuItems = styled(motion.ul)`
position: relative;
height: ${props => props.theme.navHeight};
background-color: ${props => props.theme.body};
color: ${props => props.theme.text};
list-style: none;

display: flex;
align-items: center;
justify-content: space-between;

width: 100%;
padding: 0 10rem;
`

const NavContainer = styled(motion.div)`
width: 100vw;
z-index: 6;
position: absolute;
top: ${props => props.click ? '0' : `-${props.theme.navHeight}`};

display: flex;
justify-content: center;
align-items: center;

transition: all 0.3s ease;
`
const MenuItem = styled(motion.li)`
font-size: ${props => props.theme.frontsm};
letter-spacing: 0.05em;
text-transform: uppercase;
cursor: pointer;
`

const Menubtn = styled.button`
background-color: ${props => `rgba(${props.theme.textRgba}, 0.85)`};
border: none;
outline: none;
color:${props => props.theme.body};
width: 15rem;
height: 2.5rem;

display: flex;
justify-content: center;
align-items: center;

clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%);
position: absolute;
top: 100%;
left: 50%;
transform: translateX(-50%);

font-size: ${props => props.theme.fontmd};
font-weight: 600;
text-transform: uppercase;

cursor: pointer;
`



const Nav = () => {
    const pages = ['Home', 'About Us', 'Events', 'Meet the Team', 'Join the Team'];
    const [click, setClick] = useState(false);

    return (
        <NavContainer click={click}
            initial={{
                y: '-100%'
            }}
            transition={{
                duration: 1.8, delay: 0
            }}
            animate={{
                y: 0
            }}


        >


            <MenuItems
                drag='y'
                dragConstraints={{
                    top: 0,
                    bottom: 0,
                }}
                dragElastic={0.05}
                dragSnapToOrigin
            >
                <Menubtn onClick={() => setClick(!click)}>Menu</Menubtn>
                {pages.map(page => (
                    <MenuItem
                        key={page}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9, y: 0 }}
                    >
                        {page}
                    </MenuItem>
                ))}
            </MenuItems>
        </NavContainer>


    )
}

export default Nav
