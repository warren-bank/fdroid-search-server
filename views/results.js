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

const render = function(template_name, view_data) {
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

module.exports = {render}
