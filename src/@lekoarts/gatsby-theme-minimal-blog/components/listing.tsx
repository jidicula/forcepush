/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import BlogListItem from "./blog-list-item"

type ListingProps = {
  posts: {
    slug: string
    title: string
    date: string
    excerpt: string
    description: string
    timeToRead: number
    tags?: {
      name: string
      slug: string
    }[]
  }[]
  className?: string
  showTags?: boolean
}

const Listing = ({ posts, className, showTags = true }: ListingProps) => (
  <section sx={{ mb: [5, 6, 6] }} className={className}>
    <div style={{ textAlign: "right" }}>
      subscribe{" "}
      <Link to={"/rss.xml"} sx={{ textDecoration: `underline` }}>
        via RSS
      </Link>
    </div>
    {posts.map((post) => (
      <BlogListItem key={post.slug} post={post} showTags={showTags} />
    ))}
  </section>
)

export default Listing
