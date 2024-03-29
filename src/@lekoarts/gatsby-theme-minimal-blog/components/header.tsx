/** @jsx jsx */
import ColorModeToggle from "@lekoarts/gatsby-theme-minimal-blog/src/components/colormode-toggle"
import Navigation from "@lekoarts/gatsby-theme-minimal-blog/src/components/navigation"
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config"
import useSiteMetadata from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata"
import replaceSlashes from "@lekoarts/gatsby-theme-minimal-blog/src/utils/replaceSlashes"
import { Link } from "gatsby"
import { Flex, jsx, useColorMode } from "theme-ui"
import theme from "../../../gatsby-plugin-theme-ui/index.js"

const Header = () => {
  const { siteTitle } = useSiteMetadata()
  const { navigation: nav, externalLinks, basePath } = useMinimalBlogConfig()
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`
  const toggleColorMode = (e: unknown) => {
    e.preventDefault()
    setColorMode(isDark ? `light` : `dark`)
  }

  return (
    <header sx={{ mb: [5, 5] }}>
      <script
        data-goatcounter="https://forcepush.goatcounter.com/count"
        async
        src="//gc.zgo.at/count.js"
      ></script>
      <Flex sx={{ alignItems: `center`, justifyContent: `space-between` }}>
        <Link
          to={replaceSlashes(`/${basePath}`)}
          aria-label={`${siteTitle} - Back to home`}
          sx={{ color: `heading`, textDecoration: `none` }}
        >
          <h1
            sx={{
              my: 0,
              fontWeight: `${theme.fontWeights.heading}`,
              fontSize: [3, 6],
            }}
          >
            {siteTitle}
          </h1>
        </Link>
        <ColorModeToggle isDark={isDark} toggle={toggleColorMode} />
      </Flex>
      <div
        sx={{
          boxSizing: `border-box`,
          display: `flex`,
          variant: `dividers.bottom`,
          alignItems: `center`,
          justifyContent: `space-between`,
          mt: 3,
          color: `secondary`,
          a: { color: `secondary`, ":hover": { color: `heading` } },
          flexFlow: `wrap`,
        }}
      >
        <Navigation nav={nav} />
        {externalLinks && externalLinks.length > 0 && <HeaderExternalLinks />}
      </div>
    </header>
  )
}

export default Header
