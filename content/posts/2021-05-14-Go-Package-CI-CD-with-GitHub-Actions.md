---
title: Go Package CI/CD with GitHub Actions
date: 2021-05-14 20:47:09 -0400
excerpt: "I wanted to ensure that:

1. Each change I make to my program won't break existing functionality (Continuous Integration), and
2. Publishing a new release to pkg.go.dev is automatic (Continuous Delivery/Deployment)."
tags:
 - Go
 - CI/CD
 - GitHub Actions
---

In a [previous post](./python-package-ci-cd-with-git-hub-actions), I wrote about how I implemented CI/CD checks and autoreleases for the Python implementation of my random-standup program. I also developed some similar workflows for the Go implementation, so I thought I'd also write a Go-flavoured post about packaging CI/CD using GitHub Actions. This post may seem very familiar if you read that previous post - as I described in my [comparison between the Go and Python implementations of this program](./writing-a-simple-cli-program-python-vs-go), my CI/CD goals are the same: PR checks and autoreleases.

As I said before, I wanted to ensure that:

1. Each change I make to my program won't break existing functionality (Continuous Integration), and
2. Publishing a new release to [pkg.go.dev](https://pkg.go.dev) is automatic (Continuous Delivery/Deployment).

GitHub provides a workflow automation feature called [GitHub Actions](https://docs.github.com/en/actions). Essentially, you write your workflow configurations in a YAML file in `your-repo/.github/workflows/`, and they'll be executed on certain repository events.

# Continuous Integration

This automation is relatively straightforward. I want to run the following workflows on each commit into the repository trunk and on each pull request into trunk:

1. Test syntax by running a linting check with [`golangci-lint`](https://golangci-lint.run) - it's the best linter (actually, I suppose it's a meta-linter since it invokes several separate linters) available for Go and slaps your wrist if you slip into some well-known antipatterns.
2. Test functionality by running automated unit tests on the entire program. This is an extremely simple program, so I definitely overengineered its factoring into functions to make it easier to unit test.
3. Test build stability by attempting to build the program (but discarding the build artifact) across as many OS and arch combinations supported by Go. Of course, I don't expect that anyone would run my standup randomizer using Plan 9 on an ARM chip, but this was more of an exercise to learn about Go's cross-compilation capabilities.

Here's the [full workflow](https://github.com/jidicula/random-standup/blob/main/.github/workflows/build.yml).

## Each commit to trunk

The trigger for this is declared at the top of the workflow file:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## Test syntax by checking formatting

First, we have to checkout the repository in GitHub Actions using [GitHub's own `checkout` action](https://github.com/actions/checkout). Then, we have to set up the Go version using [GitHub's `setup-go` action](https://github.com/actions/setup-go). GitHub Actions has 3 different OSes available for their runners, each with various [Go versions](https://github.com/actions/virtual-environments/blob/main/images/linux/Ubuntu2004-README.md#go), but it's safest to explicitly specify which Go version will be used.

Finally, we can use [golangci-lint's provided GitHub Action](https://github.com/golangci/golangci-lint-action/blob/master/action.yml) for linting - it runs `golangci-lint` on the workflow runner's clone of the repo and outputs an error code if any Go file in the repo fails rules of any linters in `golangci-lint`. Note that `golangci-lint` fails if the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) cannot be parsed (i.e. if there are any syntax errors), so it can also be used for checking syntax correctness, which itself is a good proxy for checking for merge conflict strings. We can fail-fast with any checks this way - there's no need to spin up a compilation and a `go test` invocation if there are syntax errors.

```yaml
jobs:
  lint:
    name: Lint files
    runs-on: 'ubuntu-latest'
    steps:
      - uses: actions/checkout@v2.3.4
      - uses: actions/setup-go@v2
        with:
          go-version: '1.16.4'
      - name: golangci-lint
        uses: golangci/golangci-lint-action@v2.5.2
        with:
          version: latest
```

## Test Functionality

Again, we need to checkout the repo for this job and set up the Go version:

```yaml
    name: Run tests
    runs-on: 'ubuntu-latest'
    needs: lint
    steps:
      - uses: actions/checkout@v2.3.4
      - uses: actions/setup-go@v2
        with:
          go-version: '1.16.4'
      - run: go test -v -cover
```

Note that unlike Python, no setup is needed to install dependencies (`go test` automatically grabs dependencies defined in `go.mod`) or set up a virtual environment, so there's a lot less boilerplate in CI/CD.

## Test build stability for different OSes and architectures

Go provides [cross-compilation tooling](https://www.digitalocean.com/community/tutorials/building-go-applications-for-different-operating-systems-and-architectures) for a wide variety of operating systems and architectures. Essentially, you can run a command like

```bash
$ GOOS=plan9 GOARCH=arm go build
```

and the Go compiler will build a binary that will run on the OS specified in `GOOS` and the arch in `GOARCH`. To see the full list of GOOS and GOARCH options, run `go tool dist list`.

We want to verify build stability across this set, so we can set up a matrix build for different GOOS and GOARCH options using GitHub Actions:

```yaml
  build:
    runs-on: 'ubuntu-latest'
    needs: test
    strategy:
      matrix:
        goosarch:
          - 'aix/ppc64'
          - 'android/amd64'
          - 'android/arm64'
          - 'darwin/amd64'
          - 'darwin/arm64'
          - 'dragonfly/amd64'
          # ...
```

This is defined in the [`jobs.<job_id>.strategy.matrix` directive](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix). I've added just 1 variable for every GOOS and GOARCH pairing (truncated for this blogpost - there are [39 pairs defined in my workflow file](https://github.com/jidicula/random-standup/blob/291b9a3cccdad0fece3c061029ecadb7c0676bc5/.github/workflows/build.yml#L42)).

Internally, the steps are somewhat like:

1. GitHub Actions parses the directives for the job and sees there's a matrix strategy.
2. It spins up a separate runner for each matrix combination and defines the variables `matrix.goosarch` as the values for that combination.
3. It runs the job steps in each runner it spun up in Step 2.

You can see an example of how this matrix run looks like in the GitHub Actions console [here](https://github.com/jidicula/random-standup/actions/runs/835336772) (see all the `goosarch` values in the left sidebar). These matrix options are run in parallel by default, so the runtime of the job determined by the slowest matrix option. Note that if your repository is private, you will be charged Actions minutes for each separate build matrix option, with some [hefty multipliers for macOS and Windows runners](https://docs.github.com/en/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-actions#about-billing-for-github-actions) (1 macOS minute is 10 minutes of Actions credit, 1 Windows minute is 2 minutes of Actions credit as of May 2021).

We do our usual checkout and Go version setup, then some basic Bash string-splitting on the `/` character so we can set the `GOOS` and `GOARCH` environment variables separately from a single matrix option:

```yaml
      - name: Get OS and arch info
        run: |
          GOOSARCH=${{matrix.goosarch}}
          GOOS=${GOOSARCH%/*}
          GOARCH=${GOOSARCH#*/}
          BINARY_NAME=${{github.repository}}-$GOOS-$GOARCH
          echo "BINARY_NAME=$BINARY_NAME" >> $GITHUB_ENV
          echo "GOOS=$GOOS" >> $GITHUB_ENV
          echo "GOARCH=$GOARCH" >> $GITHUB_ENV
```

Then, we simply run Go's `go build` subcommand, which creates the binary:

```yaml
      - name: Build
        run: |
          go build -o "$BINARY_NAME" -v
```

## Auto-merge

GitHub also allows pull requests to be merged automatically if branch protection rules are configured and if the pull request passes all required reviews and status checks. In the repo Settings > Branches > Branch Protection rules, I have a rule defined for `main` requiring all jobs in the `build.yml` workflow to pass before a branch can be merged into `main`.

# Release automation

There are 2 parts to GitHub release automation:

1. Create the GitHub release using Git tags and add the build artifacts to it ([workflow](https://github.com/jidicula/random-standup/blob/main/.github/workflows/release-draft.yml)).
2. Publish the package to pkg.go.dev ([workflow](https://github.com/jidicula/random-standup/blob/main/.github/workflows/publish.yml)).

## Create GitHub Release

We set up the workflow to trigger on push to a tag beginning with `v`:

```yaml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10
```

Then, we define our `release` job, running on Ubuntu (cheapest and fastest GitHub Actions runner environment):

```yaml
name: Create Release

jobs:
  autorelease:
    name: Create Release
    runs-on: 'ubuntu-latest'
```

I also set up the same [GOOS and GOARCH build matrix](https://github.com/jidicula/random-standup/blob/291b9a3cccdad0fece3c061029ecadb7c0676bc5/.github/workflows/release-draft.yml#L42) as in `build.yml` - when we create the GitHub release, we'll build and upload the binaries as release assets.

Our first 2 steps are almost the same as our Build workflow for pushes and PRs to `main`: we checkout the repo and set up Go. Our checkout step is slightly different, though: we provide `0` to the `fetch-depth` input so we make a deep clone with all commits, not a shallow clone with just the most recent commit.

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
```

Go specifies module versions using version control tagging, so we don't need to parse any manifest files like we did with Python. So, we can do the same Bash string splitting as before and build the binary:

```yaml
      - name: Get OS and arch info
        run: |
          GOOSARCH=${{matrix.goosarch}}
          GOOS=${GOOSARCH%/*}
          GOARCH=${GOOSARCH#*/}
          BINARY_NAME=${{github.repository}}-$GOOS-$GOARCH
          echo "BINARY_NAME=$BINARY_NAME" >> $GITHUB_ENV
          echo "GOOS=$GOOS" >> $GITHUB_ENV
          echo "GOARCH=$GOARCH" >> $GITHUB_ENV
      - name: Build
        run: |
          go build -o "$BINARY_NAME" -v
```

The next step is to create some release notes. I keep a release template in the `.github` folder and append some gitlog output to it:

```yaml
 - name: Release Notes
        run: git log $(git describe HEAD~ --tags --abbrev=0)..HEAD --pretty='format:* %h %s%n  * %an <%ae>' --no-merges >> ".github/RELEASE-TEMPLATE.md"
```

That gnarly gitlog command is checking all commits since the last tag to HEAD. For each commit, it appends the commit hash, the commit message subject, the author name, and the author email to the release template.

Finally, we use a [3rd-party release creation Action](https://github.com/softprops/action-gh-release) for creating a release draft with the release notes and artifacts we just created:

```yaml
      - name: Release with Notes
        uses: softprops/action-gh-release@v1
        with:
          body_path: ".github/RELEASE-TEMPLATE.md"
          draft: true
          files: ${{env.BINARY_NAME}}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This creates a draft visible at https://github.com/jidicula/random-standup/releases. I modify the release announcements as needed, and publish the release.

## Publishing to pkg.go.dev

The final step of the release process is to notify pkg.go.dev that there's a new version available for the module. Here's the full [workflow](https://github.com/jidicula/random-standup/blob/main/.github/workflows/publish.yml).

This time, we trigger the workflow to run on a release being published (the last step of the previous workflow is manually publishing a release draft):

```yaml
on:
  release:
    types:
      - published
```

We do the same checkout as before. Then, we simply run `curl` to the URL where the module is fetched from by `go get`:

```yaml
jobs:
  bump-index:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2.3.4
      - name: Ping endpoint
        run: curl "https://proxy.golang.org/github.com/jidicula/random-standup/@v/$(git describe HEAD --tags --abbrev=0).info"
```

pkg.go.dev recommends this as [one of the ways of adding a new module (or module version)](https://go.dev/about#adding-a-package) to its index.

# Putting it all together

So overall, working on this project would involve:

1. Make a PR for my changes.
2. Confirm auto-merge.
3. Repeeat Steps 1 and 2 until I'm ready to release.
5. Create a tag on `main` pointing to the version bump commit.
6. Push the tag to GitHub.
7. Wait for the [Create Release](https://github.com/jidicula/random-standup/actions/workflows/release.yml) run to finish.
8. Go to https://github.com/jidicula/random-standup/releases and modify the Announcements for the just-created release draft.
9. Publish the release.
10. Wait for the [Publish](https://github.com/jidicula/random-standup/actions/workflows/publish.yml) run to finish.
11. Check [pkg.go.dev](https://pkg.go.dev/github.com/jidicula/random-standup) for the updated package version.

If you have any questions or comments, email me at johanan+blog@forcepush.tech, find me on Twitter [@jidiculous](http://twitter.com/jidiculous), or post a comment [here](https://dev.to/jidicula/go-package-ci-cd-with-github-actions-350o).

Did you find this post useful? Buy me a beverage or sponsor me [here](https://github.com/sponsors/jidicula)!
