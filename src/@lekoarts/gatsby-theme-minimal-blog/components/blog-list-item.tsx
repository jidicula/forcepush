/** @jsx jsx */
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags";
import { Box } from "@theme-ui/components";
import { Link } from "gatsby";
import React from "react";
import { jsx, Styled } from "theme-ui";

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
    <Styled.a
      as={Link}
      to={post.slug}
      sx={{
        fontSize: [1, 2, 3],
        color: `text`,
        textDecoration: `underline`,
      }}
    >
      {post.title}
    </Styled.a>
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
      <Styled.a as={Link} to={post.slug} sx={{ textDecoration: `underline` }}>
        Read more...
      </Styled.a>
    </p>
  </Box>
);

export default BlogListItem;
