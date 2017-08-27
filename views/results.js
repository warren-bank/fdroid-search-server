const Mustache = require('mustache')

const templates = {}

// ------------------------------------------------------------

templates["header"] = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>F-Droid search results</title>
  <link rel="shortcut icon" href="/favicon.png" />
  <link rel="stylesheet" type="text/css" href="/css/style.css" />
</head>
<body>`

// ------------------------------------------------------------

templates["search-form"] = `
  <div id="search-form">
    <form action="/">
      <input name="q" type="text" autocomplete="off" value="{{terms}}" />
      <input type="submit" value="Search" />
    </form>
  </div>`

// ------------------------------------------------------------

templates["search-results"] = `
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
  </div>`

// ------------------------------------------------------------

templates["search-pagination"] = `
  <div id="search-pagination">
    <a id="prev-page" class="{{prev_class}}" href="{{prev_url}}">&lt;</a>
    <div id="search-pagination-status"><span>{{status}}</span></div>
    <a id="next-page" class="{{next_class}}" href="{{next_url}}">&gt;</a>
  </div>`

// ------------------------------------------------------------

templates["footer"] = `
</body>
</html>
`

// ------------------------------------------------------------

Mustache.parse(templates["search-form"])
Mustache.parse(templates["search-results"])
Mustache.parse(templates["search-pagination"])

// ------------------------------------------------------------

const render_partial = function(template_name, view_data) {
  switch(template_name) {
    case "header":
    case "footer":
      return templates[template_name]
    case "search-form":
    case "search-results":
    case "search-pagination":
      return Mustache.render(templates[template_name], view_data)
    default:
      return ''
  }
  return ''
}

// ------------------------------------------------------------
// public API:

const render = function({terms, results, count_total_results, this_start_index, next_start_index, page_number, count_total_pages, url}) {
  let data = {
    form: {
      terms
    },
    results: {
      packages  : results
    },
    pagination: {
      status    : ((count_total_results) ? `${page_number} of ${count_total_pages}` : 'no results'),
      prev_class: ((this_start_index === 0) ? 'disabled' : ''),
      prev_url  : ((this_start_index === 0) ? '' : `${url.replace(/&page=\d+$/, '')}&page=${page_number - 1}`),
      next_class: ((next_start_index === count_total_results) ? 'disabled' : ''),
      next_url  : ((next_start_index === count_total_results) ? '' : `${url.replace(/&page=\d+$/, '')}&page=${page_number + 1}`)
    }
  }

  let html = ''
  html += render_partial("header")
  html += render_partial("search-form",         data.form)
  if (count_total_results) {
    html += render_partial("search-results",    data.results)
    html += render_partial("search-pagination", data.pagination)
  }
  else if (terms) {
    html += render_partial("search-pagination", data.pagination)
  }
  html += render_partial("footer")

  return html
}

const render_without_results = function(terms) {
  return render({
    terms,
    results: [],
    count_total_results: 0,
    this_start_index: 0,
    next_start_index: 0,
    page_number: 0,
    count_total_pages: 0,
    url: ''
  })
}

// ------------------------------------------------------------

module.exports = {render, render_without_results}
