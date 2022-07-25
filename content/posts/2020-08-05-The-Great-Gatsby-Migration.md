---
title: The Great Gatsby Migration
date: 2020-08-06 18:44 -0400
excerpt: If you've read my blog before, you might have noticed something looks a bit different...
tags:
 - Gatsby
 - Netlify
---

If you've read my blog before, you might have noticed something looks a bit different now... the fonts are slicker, site loading is faster, and there's a dark-mode/light-mode toggle! That's right, I've switched from using a Jekyll static site generator to [Gatsby](https://www.gatsbyjs.org)! Why make this change? A lot has already been written about the benefits of using Gatsby over Jekyll (see [here](https://www.gatsbyjs.org/features/jamstack/gatsby-vs-jekyll-vs-hugo)), so I won't go into that here. What this post *will* deal with are the non-obvious details of this transition, like mirroring my resume PDF from GitHub, setting up Font Awesome, and optimizing my Netlify build.

# Deployment: GitHub Pages vs Netlify

Previously, I was serving this site over [GitHub Pages](https://pages.github.com). GitHub Pages is GitHub's free hosting service for personal, organization, and project websites. Its simplicity is its main strength – if your repo is named `yourusername.github.io` and it contains raw HTML/CSS/JS files comprising a website, your website will be visible at https://yourusername.github.io. Conveniently, GitHub Pages can build Jekyll sites out of the box, with no need to configure build processes on a separate branch. That means you only have to add or modify a Markdown file in the correct source directory, commit, and push, for it to be deployed. Unfortunately, GitHub Pages does not easily support Gatsby builds – the usual workaround is keeping a separate production branch with your sourcecode, and adding a [GitHub Action](https://github.com/marketplace/actions/gatsby-publish) to build from your production source branch and force-push to `master`.

Now, my site is brought to you by [Netlify](https://www.netlify.com). Netlify is a serverless webhosting service that allows continuous deployment straight from a Git repo hosted on GitHub, Bitbucket, GitLab, etc. You can configure almost any build process on any branch, with 1-click rollbacks and publishing, build caching, and PR checks. It also provides API endpoints for 3rd-party webhooks to use (we'll come back to this later). The [free pricing](https://www.netlify.com/pricing/) tier is rather generous, with unlimited websites served on a globally distributed CDN, and 300 free build minutes per month. With these benefits, switching to Netlify was a clear choice, and the setup was incredibly easy, with no need for janky build processes involving keeping a static build of my site on a Git branch.

# Theme

It's the biggest change that's visible – this site's beautiful theme is forked from Kyle Rubenok's [Nerd Ramblings](https://github.com/krubenok/nerd-ramblings), which in turn is forked from the gatsby-theme-minimal-blog by [@LekoArts](https://github.com/LekoArts/gatsby-themes/tree/master/themes/gatsby-theme-minimal-blog). I adapted the colours and fonts from Kyle's theme and added a custom footer with some crisp Font Awesome logos. I couldn't have set this up without either of their efforts, so I thank them both for their contributions to prior work. Kyle's been especially influential in introducing me to great products like Gatsby, [Notion](http://notion.so/) (I'll describe my setup in a future post), and Netlify.


# Personal resume as a dependency

## The problem

One killer feature that I wanted in my personal website was the ability to serve the most recent copy of [my resume](/jidicula-resume/jidicula-resume.pdf). I keep my resume publicly available in a [GitHub repository](https://github.com/jidicula/jidicula-resume). Any time I make a change, I rebuild the PDF, commit the changes, and push them to this remote. If the PDF is served on my website, it becomes effortless to share my most recent resume with anyone, and I even link to the online copy within the resume itself to ensure that any reader of a PDF or printout can easily find the most recent version at any time.

## The previous solution

With GitHub Pages, the workflow was pretty simple. Any public repo's project page can be added under your root GitHub Pages site – after enabling GitHub Pages in the project's repo settings, the README is published at https://yourusername.github.io/your-repo, with no further configuration required. Files in the repo are available under the same link, e.g. [https://yourusername.github.io/your-repo/file.py](https://yourusername.github.io/your-repo/file.py). So, all I had to do was link to [jidicula.github.io/jidicula-resume/jidicula-resume.pdf](https://jidicula.github.io/jidicula-resume/jidicula-resume.pdf) (which now redirects to my Netlify-hosted resume). In case you were wondering, I could not simply link to the repo itself: either I'd have to link to the render of a [specific commit](https://render.githubusercontent.com/view/pdf?commit=e93262b660102423aaf06282da7e6ad839acb6c2&enc_url=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6a69646963756c612f6a69646963756c612d726573756d652f653933323632623636303130323432336161663036323832646137653661643833396163623663322f6a69646963756c612d726573756d652e706466&nwo=jidicula%2Fjidicula-resume&path=jidicula-resume.pdf&repository_id=264288477&repository_type=Repository#312b6f84-69ee-4db6-a57b-0d101e511073) (precluding my "most recent version" requirement), the [blob itself](https://github.com/jidicula/jidicula-resume/blob/master/jidicula-resume.pdf) (which has a low-resolution render embedded in the GitHub UI), or the [raw file](https://github.com/jidicula/jidicula-resume/raw/master/jidicula-resume.pdf) (which cannot be viewed in the browser and forces the user to download the PDF).

## Possible avenues

With a Netlify deployment, the workflow was no longer as obvious as with GitHub Pages. I chatted with Kyle about it and we came up with a few ways forward, including setting up a separate bare Netlify site (under a forcepush.tech subdomain) tracking my resume repo and linking to that [site's PDF](https://eloquent-brown-df091f.netlify.app/jidicula-resume.pdf) (N.B. I've halted builds for this site to save my free Netlify build minutes), setting up an import of the repo into my website repo as a dependency, or setting up a GitHub Action in my resume repo to push a new PDF to the website repo.

## My choice

I ended up opting for the resume-repo-as-a-dependency route using the [gatsby-source-git](https://www.gatsbyjs.org/packages/gatsby-source-git/). This plugin allows you to pull in a file from nearly any online-hosted Git repo into your Gatsby graph as `File` nodes. It essentially clones the repo into any location in your build directory (`.cache` by default). So, the solution was easy to add to my `gatsby-config.js` `plugins` list:

```js
// ...
    {
      resolve: `gatsby-source-git`,
      options: {
        name: `jidicula-resume`,
        remote: `https://github.com/jidicula/jidicula-resume.git`,
        branch: `master`,
		// this is where the clone is in the site build
        local: "./public/jidicula-resume",
        // Only import the compiled PDF.
        patterns: `**.pdf`,
      },
    },
```

This adds my resume to [https://forcepush.tech/jidicula-resume/jidicula-resume.pdf](./jidicula-resume/jidicula-resume.pdf). The cherry on top was a [Netlify feature allowing redirects from a custom slug](https://docs.netlify.com/configure-builds/file-based-configuration/#redirects) so my resume is also available at [http://forcepush.tech/resume](http://forcepush.tech/resume) (which redirects to the first link).

Now the issue of forcing a "reinstall" of that dependency each time I pushed to my resume repo. Enter Netlify's [build hooks](https://docs.netlify.com/configure-builds/build-hooks/). By running 

```bash
curl -X POST -d '{}' https://api.netlify.com/build_hooks/<site-hash>
```

I could trigger a build for that site! So, I added a [GitHub Action](https://github.com/jidicula/jidicula-resume/blob/master/.github/workflows/netlify-build.yml) to my resume repo that does this on every push to `master`:

```yaml
name: netlify-build

on: push
jobs:
  curl:
    runs-on: ubuntu-latest
    steps:
    - name: curl
      uses: wei/curl@v1
      env:
        NETLIFY_HASH: ${{ secrets.NETLIFY_HASH }}
      with:
        args: -X POST -d {} "https://api.netlify.com/build_hooks/$NETLIFY_HASH"
```

But when I tested this out, the Netlify build didn't correctly pull in the repo, with some worrying error messages:

```
9:57:40 PM: 
9:57:40 PM:   Error: fatal: No remote configured to list refs from.
9:57:40 PM:   
9:57:40 PM:   - promise.js:90 toError
9:57:40 PM:     [repo]/[simple-git]/promise.js:90:14
9:57:40 PM:   
9:57:40 PM:   - promise.js:61 
9:57:40 PM:     [repo]/[simple-git]/promise.js:61:36
9:57:40 PM:   
9:57:40 PM:   - git.js:725 Git.<anonymous>
9:57:40 PM:     [repo]/[simple-git]/src/git.js:725:18
9:57:40 PM:   
9:57:40 PM:   - git.js:1475 Function.Git.fail
9:57:40 PM:     [repo]/[simple-git]/src/git.js:1475:18
9:57:40 PM:   
9:57:40 PM:   - git.js:1433 fail
9:57:40 PM:     [repo]/[simple-git]/src/git.js:1433:20
9:57:40 PM:   
9:57:40 PM:   - git.js:1442 
9:57:40 PM:     [repo]/[simple-git]/src/git.js:1442:16
9:57:40 PM:   
9:57:40 PM:   - task_queues.js:97 processTicksAndRejections
9:57:40 PM:     internal/process/task_queues.js:97:5
9:57:40 PM:   
9:57:40 PM: 
```

The cause of this was one of the key features of Gatsby and Netlify: caches of previous builds. The `public/` directory and the `.cache` remains, with only the changed components updating. The Git plugin essentially tried to clone the same repo into the same location, where a repo of that name already existed, so naturally it would fail. The obvious workaround within the constraints of Git would be to do some kind of `git pull`, but that seemed a bit in the weeds to do from inside a React app. I'm sure there are Node packages to assist with this that I could hook into my site's `npm build` directive, but I didn't want to go down another rabbit hole. Instead, I opted for the crudely (more on this below) simple solution on Netlify: change the build command from `npm run build` to `npm run clean`. So, on each build, the previous build and cache gets wiped out before the new build begins. The `git clone` portion of the plugin works fine and my hosted resume would get updated. Problem solved!

# Font Awesome

[Font Awesome](https://fontawesome.com) is a beautifully designed icon set allowing you essentially embed logos and pictographs in Markup text (or as a font). I wanted to use Font Awesome for GitHub and LinkedIn logos in my site footer. The [reference docs](https://fontawesome.com/how-to-use/on-the-web/using-with/react) for using Font Awesome in React weren't exactly clear to me in how I could use it within an existing Gatsby site, so I quickly got lost. Fortunately, I stumbled on the [react-icons](https://github.com/react-icons/react-icons) package, which includes Font Awesome support! Adding it to the [footer](https://github.com/jidicula/forcepush/blob/master/src/%40lekoarts/gatsby-theme-minimal-blog/components/footer.tsx) of my site was extremely simple:

```js
// ...
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
} from "react-icons/fa";

const Footer = () => {
  const { author, siteTitle } = useSiteMetadata();

  return (
    <footer>
      // ...
      <IconContext.Provider
        value={{ style: { verticalAlign: "middle" }, size: "1.2em" }}
      >
	  // ...
            <Styled.a
              aria-label="GitHub Profile"
              href="https://github.com/jidicula"
            >
              <FaGithubSquare /> jidicula
            </Styled.a>
			// ...
      </IconContext.Provider>
    </footer>
  );
};

export default Footer;

```
Mission accomplished (scroll to the bottom to see the result)!

# Optimizing the Netlify Build

So with the site nearly finished at this point, I started looking at how to optimize my [Netlify build](https://www.netlify.com/blog/2020/06/11/5-optimizations-for-faster-gatsby-builds/), which was taking around 2-3 minutes each time since I used an anti-pattern build command `gatsby clean && gatsby build`, as described above. The benefit of Gatsby is an incremental build process that only rebuilds components that have changed, based on previously saved builds including the `public/` directory and the `.cache`. The command `gatsby clean` removes these, blocking any benefit gained by Gatsby's incremental build. So, after following Netlify's recommendations for faster Gatsby builds, I further refined my Netlify build command to: `rm -rf public/jidicula-resume && npm run build`. This brought down my site's build time to around 1 minute.

# Wrap-up

So, hopefully this post has given you insight into some finer details of setting up a Gatsby site including files from a secondary GitHub repo (which will come in handy for a project showcase or resume hosting), using Font Awesome, and optimizing a Netlify build. The website repo can be viewed [here](https://github.com/jidicula/forcepush) and my resume repo can be viewed [here](https://github.com/jidicula/jidicula-resume).

Questions? Comments? Write to me at johanan+blog@forcepush.tech.
