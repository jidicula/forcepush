---
title: Triggering Cloudflare Cache Purging with Netlify's Post-Deploy Hooks and a Google Cloud Function in Go
date: 2022-07-26 20:18:41 -0400
excerpt: In my Netlify deploy config, I had a couple of options for triggering the Cloudflare endpoint
tags:
 - Go
 - Netlify
 - Google Cloud
 - Cloudflare
 - middleware
---

I had been putting off some gnarly dependency upgrades for over a year and finally got around to it last week, after a [few](https://github.com/jidicula/forcepush/pull/174) [false](https://github.com/jidicula/forcepush/pull/242) [starts](https://github.com/jidicula/forcepush/pull/337) of the `npm` variety. I eventually gave up and rebuilt from scratch using the `gatsby new` tool, then ported my [customizations](https://forcepush.tech/the-great-gatsby-migration). After I finished my polishes to some assets, I noticed that the changes didn't seem to have applied on [forcepush.tech](http://forcepush.tech). This wasn't very mysterious, as I've since put a Cloudflare cache in front of my site.

As a quick refresher, my website stack is:

- Gatsby site in a GitHub repo...
- deployed to Netlify on push to `main`...
- cached on Cloudflare edge with a roughly 2-hour TTL (which doesn't seem to be configurable at the free tier)

![Cloudflare](../assets/purge-cache.png "Cloudflare Cache purge panel")

I found a button on my Cloudflare dashboard to purge the site cache manually, so I used it and my changes became visible. I noticed the API help tip too, which would allow a way to automate this each time my site builds on Netlify. The API endpoint is pretty straightforward: just 
```
POST https://api.cloudflare.com/client/v4/zones/:identifier/purge_cache
```
with headers for `"Authorization: Bearer TOKEN"`, `"Content-Type"`, and no data required in the request. The only problem that remained was how to automatically trigger it.

# Design Goals

* Cache the latest deploy as soon as it completes
* Purge and rebuild the cache automatically
* Don't purge needlessly, because I assume that rebuilding and propagating an unchanged cache to Cloudflare's edge is compute-expensive
* Don't pay for anything

# Options

In my Netlify deploy config, I had a couple of options for triggering the Cloudflare endpoint: I could either append a `curl` to my build command or I could use a [post-deploy webhook](https://docs.netlify.com/site-deploys/notifications/#outgoing-webhooks), which sends a POST to an arbitrary URL.

The `curl` approach seemed a bit kludge-y since it has to be `&&`-chained with an already lengthy `rm -rf public/jidicula-resume && npm run build` command, and I didn't like the idea of using a single-line text field for a multi-command script. This also wouldn't strictly be a post-*deploy* cache purge, because this is the build command config that runs at the *beginning* of a deploy run, not the end.

Hitting the purge endpoint before the deploy begins opens up 2 failure modes that obviate the benefits of automating a purge:
  * the cache gets purged before deploy and the deploy subsequently fails: the cache is rebuilt using the last successful deploy -> **no-change cache rebuild**
  * the cache gets purged before deploy and the deploy is successful, but slow: the cache is rebuilt before the deploy completes, so it still contains the last deploy's stale content -> **no-change cache rebuild**

These reasons left me with the post-deploy POST hook approach... unfortunately Netlify doesn't allow custom headers with its POST hook and can only authenticate via JWS, so it can't meet Cloudflare's [`purge_cache` API specification](https://api.cloudflare.com/#zone-purge-all-files).

To solve this POST mismatch, I searched and found [Brian Li's blogpost](https://brianli.com/how-to-automatically-clear-cloudflare-cache-after-deploying-a-netlify-site/) about using a serverless cloud function as middleware: upon receiving a POST to its trigger endpoint, send a POST request to Cloudflare to the cache-purge endpoint. Of course, I opted to do it in Go instead of Python: it would have an even tinier memory footprint, better performance without any tuning, and the speedy compilation would yield a faster function build.

# Implementation

Here's my Go implementation:

``` go 
package purger

import (
	"fmt "
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
)

func init() {
	functions.HTTP("PurgeCache", purgeCache)
}

// httpError logs the error and returns an HTTP error message and code.
func httpError(w http.ResponseWriter, err error, msg string, errorCode int) {
	errorMsg := fmt.Sprintf("%s: %v", msg, err)
	log.Printf("%s", errorMsg)
	http.Error(w, errorMsg, errorCode)
}

func purgeCache(w http.ResponseWriter, r *http.Request) {

	log.Printf("Received %s from %v", r.Method, r.RemoteAddr)
	if r.Method == "POST" {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			httpError(w, err, "error reading POST body", http.StatusInternalServerError)
			return
		}
		log.Printf("Request body: %s", body)
	}
	// Send POST request to Cloudflare
	client := &http.Client{}

	data := `{"purge_everything":true}`
	req, err := http.NewRequest("POST",
                                "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache", 
                                strings.NewReader(data))
	if err != nil {
		httpError(w, err, "error creating new Request", http.StatusInternalServerError)
		return
	}

	req.Header.Add("Authorization", "Bearer CLOUDFLARE-API-TOKEN")
	req.Header.Add("Content-Type", "application/json")

	cloudflareResp, err := client.Do(req)
	if err != nil {
		httpError(w, err, "error sending POST request", http.StatusInternalServerError)
		return
	}
	defer cloudflareResp.Body.Close()

	// Pass cloudflare response to caller

	cloudflareRespBody, err := io.ReadAll(cloudflareResp.Body)
	if err != nil {
		httpError(w, err, "error reading Cloudflare response", http.StatusInternalServerError)
		return
	}

	if cloudflareResp.StatusCode != http.StatusOK {
		msg := fmt.Sprintf("error non-200 status: %s", cloudflareRespBody)
		httpError(w, nil, msg, http.StatusInternalServerError)
		return
	}

	log.Printf("Cloudflare response: %s", cloudflareRespBody)
	_, err = w.Write(cloudflareRespBody)
	if err != nil {
		httpError(w, err, "error sending response to client", http.StatusInternalServerError)
		return
	}
}
```

- There's some Google Cloud Functions boilerplate required: the `init()` and its `functions.HTTP` call that registers the function that's invoked.
- The invoked function seems to require receiving `http.ResponseWriter` and `*http.Request` in its parameters (I messed around to see if they could be omitted, as the documentation for the 2nd-gen Cloud Functions isn't exactly complete).
    - As usual in Go, I use `*http.Client` and `http.NewRequest()` for adding custom headers to a HTTP request - the steps are to create `Request` with `NewRequest` and pass it to `client` to send.
- I use all the [builtin error codes](https://pkg.go.dev/net/http#pkg-constants) that I can for handling various failure modes and informing the caller that something went wrong. Also for convenience, I factored out the usual `log.Printf()` & `http.Error()` calls into a `httpError()` function.
- Regardless of Cloudflare's response, the function forwards it back to the caller.
- And as a final polish, I log where the request came from and its body if it's a POST (which should only come from Netlify). Google Cloud Functions can be [HTTP-triggered](https://cloud.google.com/functions/docs/calling/http) with any of `POST`, `PUT`, `GET`, `DELETE`, or `OPTIONS` requests.

For the Google Cloud Function config, I used the 2nd-gen Cloud Functions since it uses the Artifact Registry for storing the function image, and Artifact Registry has a free tier (1st-gen Cloud Functions use the Container Registry, which costs money). Additional configs:
  * Memory allocated: 128 MiB (the lowest option possible)
  * Timeout: 60 seconds (default)
  * Autoscaling: 0 instance minimum to 1 instance maximum (only need 1 run instance for a cache purge)
  * Region: us-east4 (this is in North Virginia, the same place where AWS's major us-east region is - Netlify is hosted on AWS so hopefully this reduces some latency)

## Downside

The main downside of this approach is that it relies on security through obscurity - the trigger endpoint has to be publicly exposed for Netlify to be able to POST to it. In the worst case, the endpoint could get slammed with malicious requests, but end result is *probably* ok - I limited the function to 1 invocation at a time, so this could act as a throttle. If malicious requests become a problem, I'll add an early-return check to the function preamble for the request origin or content, or I might even work up some check that Netlify's hook can authenticate against using [JWS](https://docs.netlify.com/site-deploys/notifications/#payload-signature).

# Summary

Overall, I'm pretty satisfied with this cache-purging solution - it meets all my design goals, and it's *fast*:
  * ✅ Cache the latest deploy as soon as it completes
  * ✅ Purge and rebuild the cache automatically
  * ✅ Don't purge needlessly, because I assume that rebuilding and propagating an unchanged cache to Cloudflare's edge is compute-expensive
  * ✅ Don't pay for anything

If you have any questions or comments, email me at johanan+blog@forcepush.tech, find me on Twitter [@jidiculous](http://twitter.com/jidiculous), or post a comment [here](https://dev.to/jidicula/triggering-cloudflare-cache-purging-with-netlifys-post-deploy-hooks-and-a-google-cloud-function-in-go-26ke).

Did you find this post useful? Buy me a beverage or sponsor me [here](https://github.com/sponsors/jidicula)!
