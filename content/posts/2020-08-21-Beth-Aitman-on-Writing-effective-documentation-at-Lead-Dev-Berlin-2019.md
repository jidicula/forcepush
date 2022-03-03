---
title: Beth Aitman on writing effective documentation at LeadDev Berlin 2019
date: 2020-08-21 15:43:56 -0400
excerpt: My favourite takeaway from the talk? If you're documenting around a problem, you should probably just fix the problem.
tags:
  - documentation
  - videos
  - software engineering
  - maintainability
---

I recently re-read Joel Chippindale's [fantastic post about telling stories through your commits](https://blog.mocoso.co.uk/talks/2015/01/12/telling-stories-through-your-commits/) and I noticed that it was actually part of a talk he gave at a LeadDev conference in 2016. This led me to LeadDev's YouTube channel, where I came across a fantastic 10-minute talk by Beth Aitman at Lead Dev Berlin 2019 about writing effective documentation. From the video description, "Beth Aitman is a technical writer at Google, where she works to improve developer experience for Site Reliability Engineers. She’s interested in the intersection between UX and writing, and is passionate about teaching developers to write good docs."

I highly recommend watching it if you're working on **any** kind of software project that will be used or worked on by others. If you can't spare 10 minutes to watch it (seriously, just watch it!), I've included a short summary below.

<iframe width="560" height="315" src="https://www.youtube.com/embed/R6zeikbTgVc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

# tl;dw

In Beth's words, there are 6 guidelines to follow on the road to writing good docs:

1. Consider the user's needs - always have the reader in mind. Keep asking yourself: what's relevant? What does the reader absolutely need to know about using your software?
2. Write less. Don't overcommit to writing giant docs, because those are hard to maintain. Instead, it's better to cover a few core features really well than to sparsely cover many. Take time to weed out bad/outdated/extraneous documentation.
3. Write an outline first. This is Writing 101 - go back to those questions from Point 1, and make each answer into a heading.
4. Use the rubber duck method with your docs. Try to verbally explain the feature first, then try writing down what you said. It's good to take a conversational tone so the reader can remember that a human wrote the docs (and the code!).
5. Write readably. Structure matters: a wall of text is easy to write, but intimidating and hard to read. Ideally, a reader can get the info they need at a glance. Remember to format your code with at least a monospace font and at best, language-specific syntax highlighting. Front-load your sentences, with the condition first (If [case], do [thing]) so a reader can quickly skip the sentence if the condition doesn't apply to their situation. It's ok to take a more direct/ordering tone - you're telling the user to do something, so don't butter it up like "the user may wish to do [thing]" and instead just say "do [thing]". Additionally, headings should be task-oriented to ease navigation - a user shouldn't have to read the entire documentation to find the small bit of info they need.
6. It's not just about the documentation. Making the effort to write good docs forces introspection about the underlying source code. My favourite takeaway from the talk? If you're documenting around a problem, you should probably just fix the problem.

Questions? Comments? Write to me at johanan+blog@forcepush.tech.
