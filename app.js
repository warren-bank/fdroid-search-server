const express = require('express')
const lunr = require('lunr')
const Mustache = require('mustache')
const fs = require('fs')

const app = express()

// --------------------------------------------------
// cache-busting for all static files
//
// example:
//     /SHA1-index.json
//  => /index.json
// --------------------------------------------------
const SHA1_URL_search_pattern  = new RegExp('^(.*/)[0-9a-zA-Z]{40}-([^/]+)$')
const SHA1_URL_replace_pattern = '$1$2'

app.use(function(req, res, next) {
  req.url = req.url.replace(SHA1_URL_search_pattern, SHA1_URL_replace_pattern)
  next()
})

app.use(express.static(`${__dirname}/public/allow-CORS`, {
  index: false,
  setHeaders: function(res, path, stat) {
    res.set({
      'Access-Control-Allow-Origin': 'f-droid.org'
    })
  }
}))

app.use(express.static(`${__dirname}/public/deny-CORS`, {
  index: false
}))

var   Lunr_index_cache, Lunr_index_timestamp
const Lunr_index_path       = `${__dirname}/public/allow-CORS/index.json`
const Lunr_index_lifespan   = 1000 * 60 * 60  // (1000 ms/sec)(60 sec/min)(60 min/hr) = 1 hour

const Lunr_index_update     = function() {
  if ((! Lunr_index_timestamp) || (Date.now() > Lunr_index_timestamp + Lunr_index_lifespan)) {
    try {
      Lunr_index_cache      = fs.readFileSync(Lunr_index_path, 'utf8')
      Lunr_index_timestamp  = Date.now()

      Lunr_index_postupdate()
    }
    catch(error) {
      console.log(`[Error] updating Lunr index: ${error.message}`)
      Lunr_index_cache      = undefined
      Lunr_index_timestamp  = undefined
    }
  }
}
const Lunr_index_postupdate = function() {
  Lunr_index_cache = JSON.parse(Lunr_index_cache)

  let packages   = Lunr_index_cache.docs
  let fdroidRepo = 'https://f-droid.org/repo'
  let packageId, pkg

  for (packageId in packages) {
    if (packages.hasOwnProperty(packageId)) {
      pkg = packages[packageId]
      pkg.icon_url = fdroidRepo + '/icons/' + pkg.icon
    }
  }

  if (Lunr_index_cache.index.version !== lunr.version) {
    console.log('[warning] Lunr version mismatch: current ' + lunr.version + ' importing ' + Lunr_index_cache.index.version)

    // workaround: attempt to load index
    Lunr_index_cache.index.version = lunr.version
  }

  Lunr_index_cache.index = lunr.Index.load(Lunr_index_cache.index)
}

const defaults = {
  minChars         : 3,
  results_per_page : 20,
  page_number      : 1
}

const sanitize_search_terms = function(terms, minChars) {
  // sanity check
  if (typeof terms !== 'string') {
    return false
  }

  // For performance reasons, filter out all search terms that are shorter than a minimum length.
  // Such terms produce a large number of results, which have no real relevance.
  terms = terms.split(' ').filter(function(term) {
    return (term.length >= minChars)
  })
  if (terms.length === 0) {
    return false
  }
  else {
    return terms.join(' ')
  }
}

const sanitize_input = function(req) {
  let get_number = function(val) {
    let num = Number(val)
    return isNaN(num) ? false : num
  }

  let terms            = req.query.q    || req.query.terms
  let minChars         = req.query.min  || req.query.min_chars
  let results_per_page = req.query.rpp  || req.query.results_per_page
  let page_number      = req.query.page || req.query.page_number

  minChars             = get_number(minChars)         || defaults.minChars
  results_per_page     = get_number(results_per_page) || defaults.results_per_page
  page_number          = get_number(page_number)      || defaults.page_number

  terms = sanitize_search_terms(terms, minChars)

  return [terms, minChars, results_per_page, page_number]
}

const format_results = function(results, results_length, this_start_index, next_start_index, page_number, pages, url) {
  let template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>F-Droid search results</title>
  <link rel="shortcut icon" href="/favicon.png" />
  <link rel="stylesheet" type="text/css" href="/css/style.css" />
</head>
<body>
  <div id="search-results">
    {{#packages}}
    <div class="package-header search-result">
      <img class="package-icon" src="{{ icon_url }}">

      <div class="package-info">
        <h4 class="package-name">
          <a href="https://f-droid.org/packages/{{packageName}}/" target="_blank">
            {{ name }}
          </a>
        </h4>

        <div class="package-desc">
          <span class="package-summary">{{ summary }}</span>
        </div>
      </div>
    </div>
    {{/packages}}
  </div>
  <div id="search-pagination">
    <a id="prev-page" class="{{prev_class}}" href="{{prev_url}}">&lt;</a>
    <div id="search-pagination-status"><span>{{status}}</span></div>
    <a id="next-page" class="{{next_class}}" href="{{next_url}}">&gt;</a>
  </div>
</body>
</html>
`

  let view = {
    packages  : results,
    status    : `${page_number} of ${pages}`,
    prev_class: ((this_start_index === 0) ? 'disabled' : ''),
    prev_url  : ((this_start_index === 0) ? '' : `${url.replace(/&page=\d+$/, '')}&page=${page_number - 1}`),
    next_class: ((next_start_index === results_length) ? 'disabled' : ''),
    next_url  : ((next_start_index === results_length) ? '' : `${url.replace(/&page=\d+$/, '')}&page=${page_number + 1}`),
  }

  return Mustache.render(template, view)
}

app.use(function(req, res) {
  let [terms, minChars, results_per_page, page_number] = sanitize_input(req)

  if (terms) {
    Lunr_index_update()

    if (Lunr_index_cache === undefined) {
      res.status(500).end()
      return
    }

    let index    = Lunr_index_cache.index
    let packages = Lunr_index_cache.docs

    let results, pages, this_start_index, next_start_index, results_length

    results = index.search(terms + "*")
    pages   = Math.ceil(results.length / results_per_page)

    if ((page_number < 1) || (page_number > pages)) {
      res.status(400).send(`Page number is not valid. Specified search terms produce ${pages} pages of results.`)
      return
    }

    this_start_index = (results_per_page)*(page_number - 1)
    next_start_index = (results_per_page)*(page_number)
    if (next_start_index > results.length) {
      next_start_index = results.length
    }

    results_length = results.length

    results = results.slice(this_start_index, next_start_index)
    results = results.map(function(item) {
      return packages[item.ref]
    })

    let html_response = format_results(results, results_length, this_start_index, next_start_index, page_number, pages, req.originalUrl)
    res.status(200).send(html_response)
  }
  else {
    res.status(400).send('Please specify your search terms')
  }
})

module.exports = app
