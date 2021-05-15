---
title: Python Package CI/CD with GitHub Actions
date: 2021-05-09 12:06:23 -0400
excerpt:
tags:
 - Python
 - CI/CD
 - GitHub Actions
---

In a [previous post](https://forcepush.tech/writing-a-simple-cli-program-python-vs-go), I alluded to having pure CI/CD checks and autoreleases for my random-standup program. I wanted to ensure that:

1. Each change I make to my program won't break existing functionality (Continuous Integration), and
2. Publishing a new release to PyPI is automatic (Continuous Delivery/Deployment).

GitHub provides a workflow automation feature called [GitHub Actions](https://docs.github.com/en/actions). Essentially, you write your workflow configurations in a YAML file in `your-repo/.github/workflows/`, and they'll be executed on certain repository events.

# Continuous Integration

This automation is relatively straightforward. I want to run the following workflows on each commit into the repository trunk and on each pull request into trunk:

1. Test syntax by running a linting check for formatting (n.b. syntax correctness is a subset of formatting correctness).
2. Test functionality **across a variety of operating systems and Python versions** by running automated tests on the entire program. For this program, I only included a single basic black-box test that's more demonstrative than useful (it checks for a regex match with program output). A suite of unit tests would be more appropriate for a more complex program.
3. Test build stability by attempting to build the program (but discarding the build artifact) across the same combinations of operating systems and Python versions from Step 2.

Here's the [full workflow](https://github.com/jidicula/random-standup-py/blob/main/.github/workflows/release.yml).

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

First, we have to checkout the repository in GitHub Actions using [GitHub's own `checkout` action](https://github.com/actions/checkout). Then, we have to set up the Python version using [GitHub's `setup-python` action](https://github.com/actions/setup-python). Finally, we can use [Black's provided GitHub Action](https://github.com/psf/black/blob/main/action.yml) for checking formatting - it runs `black --check --diff` on the workflow runner's clone of the repo and outputs an error code if any Python file in the repo fails Black's formatting rules. Note that Black fails if the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) cannot be parsed (i.e. if there are any syntax errors), so it can also be used for checking syntax correctness, which itself is a good proxy for checking for merge conflict strings.

```yaml
jobs:
  black-formatting-check:
    name: Check formatting
    runs-on: 'ubuntu-latest'
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - uses: psf/black@stable
```

## Running a job across different build environments

GitHub Actions provides matrix build functionality where you provide the option set for each variable and it runs the dependent steps with the [n-ary Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product#n-ary_Cartesian_product) of these *n* variable option sets:

```yaml
  build:
    runs-on: ${{ matrix.os }}
    needs: black-formatting-check
    strategy:
      matrix:
        os:
          - 'ubuntu-latest'
          - 'macos-latest'
          - 'windows-latest'
        python-version:
          - '3.7'
          - '3.8'
          - '3.9'
```

This is defined in the [`jobs.<job_id>.strategy.matrix` directive](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix). I've added 2 variables: one for OS (with Ubuntu, macOS, and Windows as options) and one for Python version (with 3.7, 3.8, and 3.9 as options). This means that everything in the `build` job will run on every combination of OS and Python version options:

* Ubuntu, Python 3.7
* Ubuntu, Python 3.8
* Ubuntu, Python 3.9
* macOS, Python 3.7
* macOS, Python 3.8
* etc

Note that the `runs-on` directive is defined as `${{ matrix.os }}` which points to the value of the `os` variable in the current runner. Internally, the steps are somewhat like:

1. GitHub Actions parses the directives for the job and sees there's a matrix strategy.
2. It spins up a separate runner for each matrix combination and defines the variables `matrix.os` and `matrix.python-version` as the values for that combination. For example, in the Ubuntu/Python 3.7 runner, `matrix.os = 'ubuntu-latest'` and `matrix.python-version = '3.7'`.
3. It runs the job steps in each runner it spun up in Step 2.

You can see an example of how this matrix run looks like in the GitHub Actions console [here](https://github.com/jidicula/random-standup-py/actions/runs/806535255) (see all the OS/Python combinations in the left sidebar). These matrix options are run in parallel by default, so the runtime of the job determined by the slowest matrix option. Note that if your repository is private, you will be charged Actions minutes for each separate build combination, with some [hefty multipliers for macOS and Windows](https://docs.github.com/en/github/setting-up-and-managing-billing-and-payments-on-github/about-billing-for-github-actions#about-billing-for-github-actions) (1 macOS minute is 10 minutes of Actions credit, 1 Windows minute is 2 minutes of Actions credit as of May 2021).

## Test Functionality

Again, we need to checkout the repo for this job and set up the Python version. The key difference with the Python version setup here compared to the Black formatting job is that the Python version is specified and points to the matrix option for `python-version`:

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: ${{matrix.python-version}}
```

Then, we need to set up the dependencies for the program to ensure it can run. I used Poetry for dependency and virtual environment management, and it's not included with any of the runner [environments](https://github.com/actions/virtual-environments), so we have to install it in a workflow step. Installing it takes some time, though, so to speed up my workflow runtime, I "permanently" cache Poetry using [GitHub's provided `cache` action](https://github.com/actions/cache). I only run the installation step if the cache is missed, which won't happen since the key is constant for each OS/Python version combination.

```yaml
      # Perma-cache Poetry since we only need it for checking pyproject version
      - name: Cache Poetry
        id: cache-poetry
        uses: actions/cache@v2.1.5
        with:
          path: ~/.poetry
          key: ${{ matrix.os }}-poetry
      # Only runs when key from caching step changes
      - name: Install latest version of Poetry
        if: steps.cache-poetry.outputs.cache-hit != 'true'
        run: |
          curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
      # Poetry still needs to be re-prepended to the PATH on each run, since
      # PATH does not persist between runs.
      - name: Add Poetry to $PATH
        run: |
          echo "$HOME/.poetry/bin" >> $GITHUB_PATH
      - name: Get Poetry version
        run: poetry --version
```

Then, I do another caching step for dependencies and install them if `poetry.lock` has changed:

```yaml
      - name: Check pyproject.toml validity
        run: poetry check --no-interaction
      - name: Cache dependencies
        id: cache-deps
        uses: actions/cache@v2.1.5
        with:
          path: ${{github.workspace}}/.venv
          key: ${{ matrix.os }}-${{ hashFiles('**/poetry.lock') }}
          restore-keys: ${{ matrix.os }}-
      - name: Install deps
        if: steps.cache-deps.cache-hit != 'true'
        run: |
          poetry config virtualenvs.in-project true
          poetry install --no-interaction
```

Finally, once dependency and virtual environment setup is done, I run pytest:

```yaml
      - name: Run tests
        run: poetry run pytest -v
```

## Test build stability

For testing build stability, we simply run Poetry's `build` subcommand, which creates the build artifacts:

```yaml
      - name: Build artifacts
        run: poetry build
```

## Auto-merge

GitHub also allows pull requests to be merged automatically if branch protection rules are configured and if the pull request passes all required reviews and status checks. In the repo Settings > Branches > Branch Protection rules, I have a rule defined for `main` requiring all jobs in the `build.yml` workflow to pass before a branch can be merged into `main`.

# Release automation

There are 2 parts to GitHub release automation:

1. Create the GitHub release using Git tags and add the build artifacts to it ([workflow](https://github.com/jidicula/random-standup-py/blob/main/.github/workflows/release.yml)).
2. Publish the package to PyPI ([workflow](https://github.com/jidicula/random-standup-py/blob/main/.github/workflows/publish.yml)).

## Create GitHub Release

We set up the workflow to trigger on push to a tag beginning with `v`:

```yaml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10
```

Then, we define our `autorelease` job, running on Ubuntu (cheapest and fastest GitHub Actions runner environment):

```yaml
name: Create Release

jobs:
  autorelease:
    name: Create Release
    runs-on: 'ubuntu-latest'
```

Our first 2 steps are almost the same as our Build workflow for pushes and PRs to `main`: we checkout the repo and set up Poetry. Our checkout step is slightly different, though: we provide `0` to the `fetch-depth` input so we make a deep clone with all commits, not a shallow clone with just the most recent commit.

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
```

The Poetry setup steps are identical, so I won't include them here.

Then, we use Poetry to get the project version from `pyproject.toml`, store it in an environment variable, then check if the tag version matches the project version:

```yaml
      - name: Add version to environment vars
        run: |
          PROJECT_VERSION=$(poetry version --short)
          echo "PROJECT_VERSION=$PROJECT_VERSION" >> $GITHUB_ENV
      - name: Check if tag version matches project version
        run: |
          TAG=$(git describe HEAD --tags --abbrev=0)
          echo $TAG
          echo $PROJECT_VERSION
          if [[ "$TAG" != "v$PROJECT_VERSION" ]]; then exit 1; fi
```

This is a bit of a guardrail because of how I trigger the autorelease. I update the `pyproject.toml` version on my local clone using `poetry version <version>`, commit it to `main`, then tag it with the same `<version>` and push the commit and the tag, which then starts this workflow. We need to ensure that the version tag and the `pyproject.toml` versions match (in case we forget to bump versions properly).

Then, we do the same dependency and virtualenv setup as in my Build workflow using Poetry, then run pytest and `poetry build`. The build artifacts will be used when we create the release in the final step of this workflow.

The next step is to create some release notes. I keep a release template in the `.github` folder and append some gitlog output to it:

```yaml
 - name: Release Notes
        run: git log $(git describe HEAD~ --tags --abbrev=0)..HEAD --pretty='format:* %h %s%n  * %an <%ae>' --no-merges >> ".github/RELEASE-TEMPLATE.md"
```

That gnarly gitlog command is checking all commits since the last tag to HEAD. For each commit, it appends the commit hash, the commit message subject, the author name, and the author email to the release template.

Finally, we use a [3rd-party release creation Action](https://github.com/softprops/action-gh-release) for creating a release draft with the release notes and artifacts we just created:

```yaml
      - name: Create Release Draft
        uses: softprops/action-gh-release@v1
        with:
          body_path: ".github/RELEASE-TEMPLATE.md"
          draft: true
          files: |
            dist/random_standup-${{env.PROJECT_VERSION}}-py3-none-any.whl
            dist/random-standup-${{env.PROJECT_VERSION}}.tar.gz
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This creates a draft visible at https://github.com/jidicula/random-standup-py/releases. I modify the release announcements as needed, and publish the release.

## Publishing to PyPI

The final step of the release process is to publish the package release to the Python Package Index along with the release assets. Here's the full [workflow](https://github.com/jidicula/random-standup-py/blob/main/.github/workflows/publish.yml).

This time, we trigger the workflow to run on a release being published (the last step of the previous workflow is manually publishing a release draft):

```yaml
on:
  release:
    types:
      - published
```

We do the same checkout and Poetry setup as before. Then, we simply run `poetry publish --build` using a PyPI token as a GitHub Secrets environment variable for authentication:

```yaml
      - name: Publish to PyPI
        env:
          PYPI_TOKEN: ${{ secrets.PYPI_TOKEN }}
        run: |
          poetry config pypi-token.pypi $PYPI_TOKEN
          poetry publish --build
```

# Putting it all together

So overall, working on this project would involve:

1. Make a PR for my changes.
2. Confirm auto-merge.
3. Repeeat Steps 1 and 2 until I'm ready to release.
4. Bump the `pyproject.toml` version on my local clone using `poetry version <new_version>`. Commit the changes.
5. Create a tag on `main` pointing to the version bump commit.
6. Push both the tag and the version bump commit to GitHub.
7. Wait for the [Create Release](https://github.com/jidicula/random-standup-py/actions/workflows/release.yml) run to finish.
8. Go to https://github.com/jidicula/random-standup-py/releases and modify the Announcements for the just-created release draft.
9. Publish the release.
10. Wait for the [PyPI Publish](https://github.com/jidicula/random-standup-py/actions/workflows/publish.yml) run to finish.
11. Check [PyPI](https://pypi.org/project/random-standup/) for the updated package version.

If you have any questions or comments, email me at johanan+blog@forcepush.tech or post a comment [here](https://dev.to/jidicula/python-ci-cd-with-github-actions-2e26).
