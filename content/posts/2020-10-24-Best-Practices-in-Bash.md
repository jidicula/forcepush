---
title: Best Practices in Bash
date: 2020-10-24 18:11:11 -0400
excerpt: "Bash is extremely powerful as a scripting language, but because of its unfettered filesystem access, it can lead us into some tricky situations."
tags:
 - Bash
 - videos
---

I do some consultation work with a [Université de Montréal lab](http://neuro.polymtl.ca/) writing open-source [qMRI software](https://github.com/shimming-toolbox/shimming-toolbox). The software is yet to be released, but we're currently writing up some example Bash scripts so users have an idea of how the software can be used. Bash is extremely powerful as a scripting language, but because of its unfettered filesystem access, it can lead us into some tricky situations. Of course, it's always better to avoid pits than to climb out of them after having fallen in, so I set out to make a short slide deck. The topic? Best practices that can be followed in Bash to avoid those pitfalls. I recorded my talk and it was uploaded to the lab's YouTube channel.

<iframe width="560" height="315" src="https://www.youtube.com/embed/1CMnNC61GZI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In case you don't have 14 minutes and 33 seconds to spare, I'll summarize some points from my talk here.

# Bash Safety Rails

## Automated Checkers: there's only 1 that matters

![shellcheck][shellcheck]

Use [ShellCheck](https://www.shellcheck.net). It checks syntax and semantics. Any issue it detects in the source code raises a warning. In the tool's output in the terminal or in its webapp, it points exactly where the problem is, how to fix it, and links to a wiki page explaining further about that exact pitfall. You can easily integrate this automated checking into PR checks on GitHub through either GH Actions or include it in a Travis build, which I've done for shimming-toolbox.

## Best Practices

It's always nice to have a guidebook to reference when it comes to stylistic best practices. Google has done that for [most of the common production languages](https://google.github.io/styleguide/) including [Bash](https://google.github.io/styleguide/shellguide.html). The Google Shell Style Guide solidifies some of the ambiguities with Bash to improve the maintainability of Bash scripts.

## Manual Testing

I can't understate the importance of testing. Unfortunately, there isn't any easy way to automatically set up tests for Bash scripts (if you know of one, my email is at the bottom of the page!), so we have to do things manually. Create a toy example script with some dummy files that you're not afraid of overwriting, and ensure that the script behaves as expected. When deciding on test cases, you should think about the following questions:

* What happens when your script is given good input?
* What happens when your script is given bad input?
* Is script's success distinguishable from failure?
* Does it fail loudly?
* Does it succeed silently? You don't need a ton of output indicating that something went right.

## Some General Tips & Tricks

These are not comprehensive, but I've picked out a few that I think are really important to keep in your toolbelt.

### Use the best shebang

#### Bad

```bash
#!/bin/bash
```

On macOS, this points to the builtin Bash (aka an old version), which may not have the features that you're expecting.

#### Good

```bash
#!/usr/bin/env bash
```

On all POSIX systems, this points to whichever Bash is first in the PATH (including Homebrew or MacPorts Bash) or aliased.

### Use double brackets for conditionals

*Note: the example and the consequences of this in the video is inaccurate: it works correctly with both single and double brackets. Special thanks to Dr. Joseph D'Silva for teaching me this example in COMP 206 at McGill University.*

#### Bad

```bash
#!/usr/bin/env bash

if [ -r $1 ]
then
  ls -l $1
else
  echo "Error $1 does not exist, refusing to execute ls"
fi
```

The intent of this script is to `ls -l` the file provided to the script as an argument. If you neglect to supply the script with an argument when you run it, 
it still tries to execute the `ls -l` clause of the structure.

#### Good
```bash
#!/usr/bin/env bash

if [ -r $1 ]
then
  ls -l $1
else
  echo "Error $1 does not exist, refusing to execute ls"
fi
```

The `else` clause is executed in this case as intended when no argument is supplied to the script. This is because double-brackets do some basic variable checking first before proceeding. See [here](https://stackoverflow.com/questions/13542832/difference-between-single-and-double-square-brackets-in-bash) for further details. The [GNU Bash Reference manual](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Conditional-Constructs) also goes into exhaustive detail on this (scroll down to `[[…]]`).

### Command substitution

#### Bad

```bash
foo=`ls`
```
Backticks are bad - nesting them requires backslash escaping:

```
\`
```

#### Good

```bash
foo="$(ls)"
```
The `$(command)` format doesn't change when nested, and is therefore much easier to read if you have to go into 2 or 3 levels of nesting.

### Double-quote strings containing variables

#### Bad

```bash
st_shim -fmap fieldmap.nii [-coil-profile $SHIM_DIR/coils/siemens_terra.nii] -mask mask.nii -physio XX -method {volumewise, slicewise}
```

#### Good
```bash
st_shim -fmap "fieldmap.nii" [-coil-profile "${SHIM_DIR}/coils/siemens_terra.nii"] -mask "mask.nii" -physio XX -method {volumewise, slicewise}
```

Note the use of curly braces (`{}`) for quoting a variable within a string.

### Header comments

When you write a Bash script (or any source code file, really), write a nice header comment about:

* why the script exists
* how it should be used
* how it behaves in both success and failure
* any return codes that the user might encounter when using or misusing the script

This is related to [writing good documentation](http://forcepush.tech/beth-aitman-on-writing-effective-documentation-at-lead-dev-berlin-2019).

### Return codes

Speaking of return codes, you can use them in Bash, just like with C/C++. 0 indicates success, nonzero indicates failure. If you anticipate multiple kinds of failures, use different codes for them! For example, you might use 1 for a missing file, and 3 for a module runtime crash. Note that the return code won't be printed, but is visible when the user runs `echo $?` in the terminal. `$?` is a special variable for the status of the last-executed executable.

Hint: you can use this to catch a command failure inside your script too...

Suppose you want to write a script that takes a single file as an argument, copies it into a temporary directory, appends `_copied` to the original's filename, the removes the temporary directory. You know there's a possibility the `cp` command could fail if the copied file is excessively large and you're nearing your disk quota, but you want the cleanup function to be executed regardless of a successful copy. Here's how you would do so:

```bash
#!/usr/bin/env bash

FILE=$1

cleanup(){
    rm -rf "temp"
}

mkdir "temp"

cp "$FILE" "temp/"

CP_CODE=$?

if [[ "CP_CODE" -ne 0 ]]
then
    "Copy failed with $CP_CODE"
    cleanup
    exit "$CP_CODE"
fi

mv "$FILE" "${FILE}_copied"
cleanup
exit 0

```

### Convenient file tests

There are some really convenient file tests built into Bash for different states:
  * `$FILENAME` exists: `[[ -e $FILENAME ]]`
  * `$FILENAME` is readable: `[[ -r $FILENAME ]]`
  * `$FILENAME` is executable: `[[ -x $FILENAME ]]`
  
You can read more examples at https://devhints.io/bash, which also has a wealth of other Bash recipes.

### Other tips
  * Write your script to do 1 thing and to do it well. A script that tries to do many tasks will eventually fail at most of them as the rest of the codebase changes and it'll be a pain in the ass to factor out its components.
  * If the script gets to 100 lines, it's time to break it up into subscripts and call those from the main script.
  * Expect the output of each script to be usable as input by another program - scripts should be **composable**.
  * Design and build your scripts so they can be tried out quickly.
  * I've said this already, but it's important so I'll say it again: scripts should fail loudly and succeed silently. You do NOT want your user to keep running scripts, blissfully unaware that things are going wrong.
  
# Wrap-up

So that's the gist of my talk. Here are all the links I've taken this material from.I encourage you to spend an hour and read all of them - bookmark them and reopen them whenever you have to write more Bash scripts.
  * https://google.github.io/styleguide/shellguide.html
  * https://blog.yossarian.net/2020/01/23/Anybody-can-write-good-bash-with-a-little-effort
  * https://github.com/koalaman/shellcheck
  * https://devhints.io/bash

Above all, practice with some toy examples in a dummy directory with files you're not afraid of overwriting.

Best of luck with your Bash scripting!

[shellcheck]: ../assets/shellcheck.png

Questions? Comments? Write to me at johanan+blog@forcepush.tech.
