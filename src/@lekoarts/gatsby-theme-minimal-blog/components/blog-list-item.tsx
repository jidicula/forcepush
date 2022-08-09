/** @jsx jsx */
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags";
import { Link } from "gatsby";
import React from "react";
import { Box, jsx, Themed } from "theme-ui";

type BlogListItemProps = {
  post: {
    slug: string,
    title: string,
    date: string,
    excerpt: string,
    description: string,
    timeToRead: number,
    tags?: {
      name: string,
      slug: string,
    }[],
  },
  showTags?: boolean,
};

const BlogListItem = ({ post, showTags = true }: BlogListItemProps) => (
  <Box mb={4}>
    <Themed.a
      as={Link}
      to={post.slug}
      sx={{
        fontSize: [1, 2, 3],
        color: `text`,
        textDecoration: `underline`,
        fontWeight: `heading`,
      }}
    >
      {post.title}
    </Themed.a>
    <p
      sx={{
        color: `secondary`,
        mt: 1,
        a: { color: `secondary` },
        fontSize: [1, 1, 2],
      }}
    >
      <time>{post.date}</time>
      {post.tags && showTags && (
        <React.Fragment>
          {` | `}
          <ItemTags tags={post.tags} />
        </React.Fragment>
      )}
      {` | `}
      <span>{post.timeToRead} min read</span>
    </p>
    <p>
      <span>{post.excerpt}</span>
      {"  "}
      <Themed.a as={Link} to={post.slug} sx={{ textDecoration: `underline` }}>
        Read more...
      </Themed.a>
    </p>
  </Box>
);

export default BlogListItem;
