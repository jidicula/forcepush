/** @jsx jsx */
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout";
import List from "@lekoarts/gatsby-theme-minimal-blog/src/components/list";
import Title from "@lekoarts/gatsby-theme-minimal-blog/src/components/title";
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config";
import Bottom from "@lekoarts/gatsby-theme-minimal-blog/src/texts/bottom";
import Hero from "@lekoarts/gatsby-theme-minimal-blog/src/texts/hero";
import replaceSlashes from "@lekoarts/gatsby-theme-minimal-blog/src/utils/replaceSlashes";
import { Link } from "gatsby";
import { jsx } from "theme-ui";

import Listing from "./listing";

type PostsProps = {
  posts: {
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
  }[],
};

const Homepage = ({ posts }: PostsProps) => {
  const { basePath, blogPath } = useMinimalBlogConfig();

  return (
    <Layout>
      <Title text="Latest Posts">
        <Link to={replaceSlashes(`/${basePath}/${blogPath}`)}>
          Read all posts
        </Link>
      </Title>
      <Listing posts={posts} />
      {/* <List>
          <Bottom />
          </List> */}
    </Layout>
  );
};

export default Homepage;
