/** @jsx jsx */
import useSiteMetadata from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata";
import { jsx, Styled } from "theme-ui";
import theme from "../../../gatsby-plugin-theme-ui/index.js";

import { IconContext } from "react-icons";
import {
  FaCopyright,
  FaPaperPlane,
  FaGithubSquare,
  FaLinkedin,
  FaLaptopCode,
  FaHeart,
  FaPalette,
  FaGithub,
  FaMedium,
} from "react-icons/fa"

const Footer = () => {
  const { author, siteTitle } = useSiteMetadata();

  return (
    <footer
      sx={{
        boxSizing: `border-box`,
        display: `flex`,
        justifyContent: `space-between`,
        mt: [6],
        color: `secondary`,
        a: {
          variant: `links.secondary`,
        },
        flexDirection: [`column`, `column`, `row`],
        variant: `dividers.top`,
      }}
    >
      <Styled.a aria-label="License" href="/">
        <h1
          sx={{
            my: 0,
            fontWeight: `${theme.fontWeights.heading}`,
            fontSize: 4,
          }}
        >
          {siteTitle}
        </h1>
      </Styled.a>
      <IconContext.Provider
        value={{ style: { verticalAlign: "middle" }, size: "1.2em" }}
      >
        <div class="column">
          <div class="row">
            <Styled.a
              aria-label="License"
              href="https://github.com/jidicula/jidicula.github.io/blob/master/LICENSE"
            >
              <FaCopyright /> {new Date().getFullYear()} {author}{" "}
            </Styled.a>
          </div>

          <div class="row">&nbsp; </div>
          <div class="row">
            <div class="column">
              <Styled.a
                aria-label="Email"
                href="mailto:johanan+blog@forcepush.tech"
              >
                <FaPaperPlane /> johanan+blog@forcepush.tech
              </Styled.a>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="row">
            <Styled.a
              aria-label="GitHub Profile"
              href="https://github.com/jidicula"
            >
              <FaGithubSquare /> jidicula
            </Styled.a>
          </div>
          <div class="row">
            <Styled.a
              aria-label="LinkedIn Profile"
              href="https://www.linkedin.com/in/jidicula"
            >
              <FaLinkedin /> jidicula
            </Styled.a>
          </div>
          <div class="row">
            <Styled.a
              aria-label="Medium Profile"
              href="https://medium.com/@jidicula"
            >
              <FaMedium /> jidicula
            </Styled.a>
          </div>
        </div>
        <div class="column">
          <div class="row">Musings and how-to's </div>
          <div class="row">&nbsp; </div>
          <div class="row">
            <FaLaptopCode /> with <FaHeart /> and{" "}
            <Styled.a
              aria-label="Theme Repository"
              href="https://github.com/krubenok/nerd-ramblings"
            >
              <FaPalette />
            </Styled.a>{" "}
            on{" "}
            <Styled.a
              aria-label="Github Repository"
              href="https://github.com/jidicula/jidicula.github.io"
            >
              <FaGithub />
            </Styled.a>
          </div>
        </div>
      </IconContext.Provider>
    </footer>
  );
};

export default Footer;
