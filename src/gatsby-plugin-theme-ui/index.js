import { merge } from "theme-ui";
import originalTheme from "@lekoarts/gatsby-theme-minimal-blog/src/gatsby-plugin-theme-ui/index";

// One Light Colours
const lightBackground = "#ffffff";
const lightPurple = "#a625a4";
const lightBlue = "#4078f2";
/* const lightGreen = "#51a14f" */
/* const lightBrown = "#986802" */
const lightGrey = "#383a42";
const lightSecondaryGrey = "#a0a1a8";

// One Dark Colours
const darkBackground = "#000000";
const darkPurple = "#c678dd";
const darkBlue = "#61afef";
/* const darkGreen = "#98c379" */
/* const darkBrown = "#d19a66" */
const darkGrey = "#abb2bf";
const darkSecondaryGrey = "#5c6270";

const theme = merge(originalTheme, {
  useColorSchemeMediaQuery: `system`,
  useCustomProperties: true,
  colors: {
    primary: lightBlue,
    text: "black",
    secondary: "black",
    toggleIcon: darkBackground,
    background: lightBackground,
    heading: "black",
    divide: lightSecondaryGrey,
    muted: lightSecondaryGrey,
    modes: {
      dark: {
        primary: darkBlue,
        text: "white",
        secondary: "white",
        toggleIcon: lightBackground,
        background: darkBackground,
        heading: "white",
        divide: darkSecondaryGrey,
        muted: darkSecondaryGrey,
      },
    },
  },
  fonts: {
      body: `"Helvetica Neue", -apple-system, BlinkMacSystemFont,"Segoe UI", "Noto Sans", sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"`,
      monospace: `monospace`,
  },
  fontWeights: {
    body: 300,
    heading: 400,
    bold: 400,
    medium: 500,
  },
  styles: {
    root: {
      color: "text",
      backgroundColor: "background",
      margin: 0,
      padding: 0,
      boxSizing: "border-box",
      textRendering: "optimizeLegibility",
    },
    p: {
      fontSize: [1, 1, 2],
      letterSpacing: "-0.003em",
      lineHeight: "body",
      "--baseline-multiplier": 0.179,
      "--x-height-multiplier": 0.35,
    },
    ul: {
      li: {
        fontSize: [1, 1, 2],
        letterSpacing: "-0.003em",
        lineHeight: "body",
        "--baseline-multiplier": 0.179,
        "--x-height-multiplier": 0.35,
      },
    },
    ol: {
      li: {
        fontSize: [1, 1, 2],
        letterSpacing: "-0.003em",
        lineHeight: "body",
        "--baseline-multiplier": 0.179,
        "--x-height-multiplier": 0.35,
      },
    },
    h1: {
      variant: "text.heading",
      fontSize: [5, 6, 5],
      mt: 2,
    },
    h2: {
      variant: "text.heading",
      fontSize: [4, 5, 4],
      mt: 2,
    },
    h3: {
      variant: "text.heading",
      fontSize: [3, 4, 3],
      mt: 3,
    },
    h4: {
      variant: "text.heading",
      fontSize: [2, 3, 2],
    },
    h5: {
      variant: "text.heading",
      fontSize: [1, 2, 1],
    },
    h6: {
      variant: "text.heading",
      fontSize: 1,
      mb: 2,
    },
    blockquote: {
      borderLeftColor: "primary",
      borderLeftStyle: "solid",
      borderLeftWidth: "6px",
      mx: 0,
      pl: 4,
      p: {
        fontStyle: "italic",
      },
    },
    code: {
      fontFamily: "monospace",
      fontSize: "inherit",
    },
    table: {
      width: "100%",
      my: 4,
      borderCollapse: "separate",
      borderSpacing: 0,
      [["th", "td"]]: {
        textAlign: "left",
        py: "4px",
        pr: "4px",
        pl: 0,
        borderColor: "muted",
        borderBottomStyle: "solid",
      },
    },
    th: {
      verticalAlign: "bottom",
      borderBottomWidth: "2px",
      color: "heading",
    },
    td: {
      verticalAlign: "top",
      borderBottomWidth: "1px",
    },
  },
  layout: {
    container: {
      padding: [3, 4],
      maxWidth: "1024px",
    },
  },
  text: {
    heading: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading",
      color: "heading",
    },
  },
  dividers: {
    bottom: {
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      borderBottomColor: "divide",
      pb: 3,
    },
    top: {
      borderTopStyle: "solid",
      borderTopWidth: "1px",
      borderTopColor: "divide",
      pt: 3,
    },
  },
  links: {
    secondary: {
      color: "secondary",
      textDecoration: "none",
      ":hover": {
        color: "primary",
        textDecoration: "underline",
      },
      ":focus": {
        color: "primary",
      },
    },
    listItem: {
      fontSize: [1, 2, 3],
      color: "text",
    },
  },
});

export default theme;
