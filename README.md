### [fdroid-search-server](https://github.com/warren-bank/fdroid-search-server)

#### How to: Install:

```bash
git clone "https://github.com/warren-bank/fdroid-search-server.git"
cd "fdroid-search-server"
npm install
```

#### How to: Run the server(s):

```bash
# ----------------------------------------------------------------------
# https://www.w3.org/Daemon/User/Installation/PrivilegedPorts.html
#
# The following scripts use "sudo" to bind to ports "80" and "443" (respectively).
#
# If your user account isn't a "sudoer", then this will fail.
# This is a workaround:
#   * remove "sudo" from `{scripts: {http, https}}` in "package.json"
#   * change the ports to not be priviliged (ie: >= 1024) by editing the files:
#       * bin/start_http.js
#       * bin/start_https.js
# ----------------------------------------------------------------------

npm run http
npm run https
```

#### How to: Query the server(s) with a web client:

* HTTP
  * [query: "alarm clock"](http://localhost/?q=alarm%20clock)
* HTTPS
  * [query: "alarm clock"](https://localhost/?q=alarm%20clock)

notes:
* the SSL certificate that is included in this repo is self-signed
  * its passphrase is: "f-droid"
* web browsers will identify it as being insecure,<br>because it isn't signed by a well-known trusted authority
* if this were ever used in production, the certificate would need to be replaced

#### Background:

* [f-droid.org](https://f-droid.org/) has recently revamped their website
* the old server-side search was removed
* it was replaced with a client-side search widget that uses a [pre-build Lunr index](https://lunrjs.com/guides/index_prebuilding.html)
* this search widget lives in the sidebar and displays a flyout list of search results as the user types into an input field
* a maximum of 10 search results are shown

#### Related Project:

* [fdroid-search](https://github.com/warren-bank/fdroid-search)
  * client-side
  * uses the same Lunr index
  * adds pagination to display all search results
  * pre-populates the search input field from the URL _#hash_
* hosted URLs:
  * [demo search page](https://warren-bank.github.io/fdroid-search/index.html)
  * [demo search page w/ initial query parameters in #hash: "alarm clock"](https://warren-bank.github.io/fdroid-search/#alarm%20clock)

#### Description:

* server-side
* uses the same Lunr index
* adds pagination to display all search results

#### Overview:

* uses Node.js to start a server
  * http  opens port: 80
  * https opens port: 443
* search terms are included in the query
* search results are returned in an html file that does not contain any client-side javascript
* serves the Lunr index with headers that permit CORS with the domain: "f-droid.org"

#### Caveat:

* the search results are only as good as the Lunr index
* I've noticed a lot of missing packages that should occur in the results.. but don't

#### Related Links:

* [git repo: "fdroid-website"](https://gitlab.com/fdroid/fdroid-website)
  * Jekyll page to power [f-droid.org](https://f-droid.org) and its [staging server](https://fdroid.gitlab.io/fdroid-website/)
* [git repo: "jekyll-fdroid"](https://gitlab.com/fdroid/jekyll-fdroid)
  * Jekyll plugin to work with F-Droid package index metadata
* [Lunr guides: "searching"](https://lunrjs.com/guides/searching.html)
  * syntax for writing search term patterns

#### Related User Questions/Comments:

* [forum: "How do I search on f-droid.org from now on?"](https://forum.f-droid.org/t/how-do-i-search-on-f-droid-org-from-now-on/711)
* [issue #105: "Allow to open search result item in new tab / bring back the old search"](https://gitlab.com/fdroid/fdroid-website/issues/105)
* [issue #109: "Bring the old webpage back"](https://gitlab.com/fdroid/fdroid-website/issues/109)
