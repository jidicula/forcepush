#!/usr/bin/env bash

DATE=$(date +"%Y-%m-%d %H:%M:%S %z")
TITLE=$1
TITLE_DATE="$(date +"%Y-%m-%d")"

echo -e "---
layout: post
title: $TITLE
date: $DATE
categories: FILL THESE IN
---" > _posts/"$TITLE_DATE"-"$TITLE".md
