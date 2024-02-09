/** @jsx jsx */
import useSiteMetadata from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata"
import { jsx, Link } from "theme-ui"
import theme from "../../../gatsby-plugin-theme-ui/index.js"

import { IconContext } from "react-icons"
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
  FaStackOverflow,
  FaHackerNews,
  FaMastodon,
  FaDev,
} from "react-icons/fa"

const Footer = () => {
  const { author, siteTitle } = useSiteMetadata()

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
      <Link aria-label="License" href="/">
        <h1
          sx={{
            my: 0,
            fontWeight: `${theme.fontWeights.heading}`,
            fontSize: 4,
          }}
        >
          {siteTitle}
        </h1>
      </Link>
      <IconContext.Provider
        value={{ style: { verticalAlign: "middle" }, size: "1.2em" }}
      >
        <div class="column">
          <div class="row">
            <Link
              aria-label="License"
              href="https://github.com/jidicula/forcepush/blob/master/LICENSE"
            >
              <FaCopyright /> {new Date().getFullYear()} {author}{" "}
            </Link>
          </div>
          <div class="row">
            <div class="column">
              <Link
                aria-label="Email"
                href="mailto:johanan+blog@forcepush.tech"
              >
                <FaPaperPlane /> johanan+blog@forcepush.tech
              </Link>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="row">
            <Link
              aria-label="GitHub Profile"
              href="https://github.com/jidicula"
            >
              <FaGithubSquare />
            </Link>{" "}
            <Link
              aria-label="LinkedIn Profile"
              href="https://www.linkedin.com/in/jidicula"
            >
              <FaLinkedin />
            </Link>{" "}
            <Link
              aria-label="Medium Profile"
              href="https://medium.com/@jidicula"
            >
              <FaMedium />
            </Link>{" "}
            <Link
              aria-label="Stack Overflow"
              href="https://stackoverflow.com/users/6310633/jidicula"
            >
              <FaStackOverflow />
            </Link>{" "}
            <Link
              aria-label="Hacker News"
              href="https://news.ycombinator.com/user?id=jidiculous"
            >
              <FaHackerNews />
            </Link>{" "}
            <Link aria-label="Mastodon" href="https://hachyderm.io/@jidiculous">
              <FaMastodon />
            </Link>{" "}
            <Link aria-label="DEV" href="https://dev.to/jidicula">
              <FaDev />
            </Link>
          </div>
        </div>
        <div class="column">
          <div class="row">Musings and how-to's </div>
          <div class="row">
            <FaLaptopCode /> with <FaHeart /> and{" "}
            <Link
              aria-label="Theme Repository"
              href="https://github.com/krubenok/nerd-ramblings"
            >
              <FaPalette />
            </Link>{" "}
            on{" "}
            <Link
              aria-label="GitHub Repository"
              href="https://github.com/jidicula/forcepush"
            >
              <FaGithub />
            </Link>
          </div>
        </div>
      </IconContext.Provider>
    </footer>
  )
}

export default Footer
