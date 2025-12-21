import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useLocomotiveScroll } from "react-locomotive-scroll";

const NavContainer = styled(motion.nav)`
  width: 100vw;
  z-index: 12;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
`;

const NavShell = styled.div`
  width: 100%;
  pointer-events: auto;
`;

const Bar = styled.div`
  position: relative;
  height: ${props => props.theme.navHeight};
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const MenuPanel = styled(motion.ul)`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  list-style: none;
  margin: 0;
  padding: 1rem 2rem;
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  width: min(92vw, 960px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
`;

const MenuItem = styled(motion.li)`
  font-size: ${props => props.theme.frontsm};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
`;

const MenuLink = styled.a`
  color: inherit;
  text-decoration: none;
  display: inline-block;
  padding: 0.25rem 0;
`;

const Menubtn = styled.button`
  background-color: ${props => `rgba(${props.theme.textRgba}, 0.85)`};
  border: none;
  outline: none;
  color: ${props => props.theme.body};
  width: 15rem;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%);
  font-size: ${props => props.theme.fontmd};
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
`;

const Nav = () => {
  const { scroll } = useLocomotiveScroll();
  const [open, setOpen] = useState(false);
  const pages = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Meet the Team", href: "#team" },
    { label: "Join the Team", href: "#join" }
  ];

  useEffect(() => {
    if (scroll) {
      scroll.update();
    }
  }, [open, scroll]);

  const handleNavClick = (event, href) => {
    event.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (!target) return;

    const fallbackScroll = () => {
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    if (scroll && target) {
      scroll.start?.();
      scroll.scrollTo(target, {
        offset: -70,
        duration: 800,
        easing: [0.25, 0.0, 0.35, 1.0]
      });
      setTimeout(() => {
        try {
          scroll.update();
        } catch (e) {
          fallbackScroll();
        }
      }, 50);
    } else {
      fallbackScroll();
    }
  };

  return (
    <NavContainer
      initial={{ y: "-100%" }}
      transition={{ duration: 1.1, delay: 0 }}
      animate={{ y: 0 }}
    >
      <NavShell>
        <Bar>
          <Menubtn onClick={() => setOpen(prev => !prev)} aria-expanded={open}>
            Menu
          </Menubtn>
        </Bar>

        <AnimatePresence>
          {open && (
            <MenuPanel
              key="menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {pages.map(page => (
                <MenuItem
                  key={page.href}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                >
                  <MenuLink href={page.href} onClick={e => handleNavClick(e, page.href)}>
                    {page.label}
                  </MenuLink>
                </MenuItem>
              ))}
            </MenuPanel>
          )}
        </AnimatePresence>
      </NavShell>
    </NavContainer>
  );
};

export default Nav;
