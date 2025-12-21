import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useLocomotiveScroll } from "react-locomotive-scroll";

const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
  z-index: 11;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
  pointer-events: none;

  @media (max-width: 768px) {
    top: auto;
    bottom: 1rem;
    right: 50%;
    transform: translateX(50%);
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    padding: 0.6rem 0.8rem;
    gap: 0.6rem;
  }
`;

const Item = styled.button`
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: ${props => props.theme.text};
  padding: 0.35rem 0.8rem 0.35rem 0.45rem;
  cursor: pointer;
  opacity: ${props => (props.$active ? 1 : 0.65)};
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    border-color: ${props => props.theme.text};
  }

  @media (max-width: 768px) {
    padding: 0.35rem 0.65rem;
  }
`;

const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => (props.$active ? props.theme.text : "rgba(255,255,255,0.4)")};
  display: inline-block;
  flex-shrink: 0;
`;

const Label = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "events", label: "Events" },
  { id: "team", label: "Team" },
  { id: "join", label: "Join" }
];

const ScrollIndicator = () => {
  const { scroll } = useLocomotiveScroll();
  const [active, setActive] = useState("home");
  const positionsRef = useRef([]);

  const computePositions = () => {
    positionsRef.current = sections
      .map(section => {
        const el = document.getElementById(section.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const baseY = scroll?.scroll?.instance?.scroll?.y || 0;
        const top = rect.top + baseY;
        const height = el.offsetHeight;
        return { id: section.id, top, bottom: top + height };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    computePositions();

    const handleResize = () => {
      computePositions();
    };

    if (scroll) {
      const handleScroll = args => {
        const y = args?.scroll?.y ?? 0;
        const refY = y + window.innerHeight * 0.25;
        const current =
          positionsRef.current.find(pos => refY >= pos.top && refY < pos.bottom) ||
          positionsRef.current[0];
        if (current) setActive(current.id);
      };

      scroll.on("scroll", handleScroll);
      scroll.on("resize", handleResize);

      return () => {
        scroll.off("scroll", handleScroll);
        scroll.off("resize", handleResize);
      };
    } else {
      const onScroll = () => {
        const y = window.scrollY + window.innerHeight * 0.25;
        const current =
          positionsRef.current.find(pos => y >= pos.top && y < pos.bottom) ||
          positionsRef.current[0];
        if (current) setActive(current.id);
      };
      window.addEventListener("scroll", onScroll);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [scroll]);

  const scrollToId = id => {
    const target = document.getElementById(id);
    if (!target) return;
    if (scroll) {
      scroll.start?.();
      scroll.scrollTo(target, { offset: -70, duration: 800, easing: [0.25, 0, 0.35, 1] });
      setTimeout(() => scroll.update?.(), 60);
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <Wrapper>
      {sections.map(section => (
        <Item
          key={section.id}
          onClick={() => scrollToId(section.id)}
          $active={active === section.id}
          aria-label={`Go to ${section.label}`}
        >
          <Dot $active={active === section.id} />
          <Label>{section.label}</Label>
        </Item>
      ))}
    </Wrapper>
  );
};

export default ScrollIndicator;
