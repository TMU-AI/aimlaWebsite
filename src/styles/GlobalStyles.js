/**
 * Global style reset and base theme surface.
 * Defines app-wide fonts, overflow handling, and root layout defaults.
 */
import { createGlobalStyle } from "styled-components";
import "@fontsource/kaushan-script";
import "@fontsource/sirin-stencil";
import "@fontsource/orbitron";

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    overflow-x: hidden;
  }

  html {
    background: #05070d;
  }

  body {
    font-family: "Sirin Stencil";
    overflow-x: hidden;
    background: #05070d;
    color: #ffffff;
  }

  #root {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    position: relative;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default GlobalStyles;
