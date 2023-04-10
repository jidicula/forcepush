/** @jsx jsx */
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags";
import { Link } from "gatsby";
import React from "react";
import { Box, jsx, } from "theme-ui";

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
	  <Link to={post.slug} sx={(t) => ({ ...t.styles?.a, fontSize: [1, 2, 3], color: `text` })}>
	  {post.title}
	  </Link>
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
        <Link to={post.slug} sx={{ textDecoration: `underline` }}>
        Read more...
        </Link>
    </p>
  </Box>
);

export default BlogListItem;
