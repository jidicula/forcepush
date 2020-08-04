#!/usr/bin/env bash

DATE=$(date +"%Y-%m-%d %H:%M:%S %z")
TITLE=$1
TITLE_DATE="$(date +"%Y-%m-%d")"

echo -e "---
title: $TITLE
date: $DATE
excerpt:
tags:
 - Some-tag
---" > content/posts/"$TITLE_DATE"-"$TITLE".md
