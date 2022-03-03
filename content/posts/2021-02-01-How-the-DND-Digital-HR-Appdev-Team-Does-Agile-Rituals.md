---
title: How the DND Digital HR AppDev Team Does Scrum Rituals
date: 2021-02-01 22:10:09 -0500
excerpt: "I thought I'd write about how I coordinated our Scrum rituals."
tags:
  - Agile
  - Scrum
  - DND
  - software engineering
---

My team in DND Civilian HR rotates the Scrum Master responsibilities among team members interested in taking on the role. I finished a 2-sprint rotation for this a couple of weeks ago, so I thought I'd write about how I coordinated our Scrum rituals.

A few notes before I begin:

- The "extra developer" should be a team member whose knowledge complements that of the Scrum Master - for example, if the Scrum Master is more familiarized with backend development, the extra dev should have more expertise in frontend development.
- When I refer to tickets, I mean any story/bug/feature tracking system like GitHub Issues, Codetree, Jira, Bugzilla, etc.

I'll start near the end of a sprint.

## 2-3 Days before End of Sprint: Technical Meeting

### Attending: Scrum Master, Extra Developer

In this ritual, the Scrum Master and an extra developer go over any tickets marked by the Product team for technical review. For each ticket, they discuss a high-level technical summary for what implementing the feature would entail and add it as a comment. This description might include files, functions, and/or classes in the codebase that have to be modified, certain approaches that are undesirable or insufficient, etc.

The goal of this ritual is to ensure that technical debt doesn't unexpectedly hinder progress of a ticket that's already included in the upcoming sprint. By forcing the pair to mentally and verbally walk through what the implementation might look like, this ritual also ensures that the ticket is in a state that it can be picked up by a developer without requiring too much back-and-forth between them and a member of the Product team, or worse, the stakeholder themselves. In our experience, minimizing this back-and-forth has helped reduce the number of work-in-progress/blocked tickets and facilitates getting our developers in [the zone][zone].

Finally, the implementation summary helps inform our estimation when we plan size estimates with the team at the beginning of the sprint.

## 0-1 Days before End of Sprint: Sprint Pre-planning Meeting

### Attending: Scrum Master, Product Team, Extra Developer, Dev Manager

In this ritual, members of the Product team share the prioritized tasks that our stakeholder wants done in the next sprint. The Scrum Master and the extra developer may comment on each task and what might be involved from a technical standpoint. <!-- why is the Dev Manager in this meeting? -->

The Scrum Master and extra developer may also propose inclusion of a few _developer-dessert_ tickets. These tickets may not immediately bring value to the stakeholder, but tend to improve developer morale. Such tickets may involve refactoring, improving CI/CD, or R&D on new tools or technologies to adopt.

The goal of this ritual is to ensure that the stakeholder's (represented by the Product team) priorities are known to the Scrum Master before they add tickets into the next sprint. In this meeting, the Scrum Master may reject some tickets from being included in the upcoming sprint. There are usually 3 reasons for rejection:

- **Unclear definition-of-done**: these tickets will need to be pushed out into the next sprint - it's the Product team's job to go back to the stakeholder and get a clearer specification for the following (not the upcoming!) sprint.
- **Full capacity**: the Scrum Master may estimate that the team's capacity will already be met, so no more tickets can be included in the upcoming sprint.
- **God ticket**: Much like [God objects][god], these tickets may have an overly wide scope. If the ticket can be subdivided before the next day's planning poker, then it can be included as planned work in the sprint. Otherwise, it is either pushed out to a future sprint, or injected into the upcoming sprint without estimation.

After this meeting, the Scrum Master and the extra developer may want to have a 1-on-1 debrief to go over the prioritized tickets one more time before the next day's planning poker.

## 1 Day before End of Sprint: Sprint Retrospective

### Attending: All Developers, Scrum Master, Product Team, Dev Manager

The purpose of the Retrospective is to take the pulse of the team. The Scrum Master should have an activity planned that facilitates discussion. The [Agile Retrospective Resource Wiki][retrowiki] is a great repository of retrospective plans. By the end of the session, the Scrum Master should have a better idea of:

- What went well?
- What can be improved on?
- How did each team member feel during the sprint?

Since we're a remote team, we use [Miro][miro] to collaborate on a shared whiteboard for our Retrospective.

## Day 0 of New Sprint: Planning Poker

### Attending: All Developers, Scrum Master, Product Team (as observers), Stakeholders (as observers)

This ritual is fairly simple: the tickets prioritized in the pre-planning meeting are presented to the team. The user story and the implementation detail is read to the team, then the team gets 20 seconds to vote on how many (story) points they think it will take. The average voted weight (rounded up) is assigned to the ticket. If there's a wide spread or any outliers in voting, the Scrum Master should allow the team to discuss and either re-vote on the ticket, or reach consensus on a lower weight. Since we're remote, my team uses [Scrumpy][scrumpy] for automating the planning poker voting and timing.

It's important to note that the story points on our team don't convert to any actual time units - they're purely relative measures. For example, a lengthy refactor may be deemed to take 10 times longer than a simple label change.

Additionally, the Product Team and Stakeholders don't actually participate in voting - they attend as observers to watch how the team weighs different types of tasks.

Once estimation is finished, the team takes a break while the Scrum Master calculates the total weights and compares it with the team's known velocity. Tickets may be removed from the sprint at their discretion if the total weight is greater than the team's known velocity. In my experience, it's been a safe bet to slightly (~90%) underestimate a team's known velocity to account for any unexpected bugs that need squashing.

## Daily Standup (except on Sprint Day 0)

### Attending: All Developers, Scrum Master, Product Team

This standup meeting is a quick (15 minutes maximum) litany of what was done on the previous workday towards the sprint goals, what's planned for the current day towards the sprint goals, and any impediments to what's planned. The purpose is not to give a status update to management or stakeholders, but is instead a communication opportunity for team members. If any followup conversation is needed, team members self-organize into other meetings depending on their availability. The Scrum Master is responsible for keeping the meeting moving and facilitating the organization of any followup discussions ("Alice, can you schedule some time to help Bob with $x?").

## Wrap-up

So that's a quick rundown of how my team does our Scrum rituals.

Questions about why certain rituals are done a certain way? Suggestions on better tools to use? Write to me at johanan+blog@forcepush.tech.

[zone]: https://en.wikipedia.org/wiki/Flow_(psychology)
[god]: https://en.wikipedia.org/wiki/God_object
[scrumpy]: https://scrumpy.poker
[retrowiki]: https://retrospectivewiki.org/index.php?title=Retrospective_Plans
[miro]: https://miro.com
