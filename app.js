function formatCostPerM(pricePerToken) {
  var perM = Number(pricePerToken) * 1000000;
  return "$" + perM.toFixed(2);
}

function formatTokens(total) {
  var n = Number(total);
  if (n >= 1000000) {
    return (n / 1000000).toFixed(2) + "M";
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "K";
  }
  return String(n);
}

function formatTtft(ms) {
  return Number(ms) + " ms";
}

function cell(text, numeric, title) {
  var td = document.createElement("td");
  td.textContent = text;
  if (numeric) {
    td.className = "numeric";
  }
  if (title) {
    td.title = title;
  }
  return td;
}

function buildRow(model) {
  var tr = document.createElement("tr");
  var daily = Number(model.inputTokensDay) + Number(model.outputTokensDay);
  var weekly = Number(model.inputTokensWeek) + Number(model.outputTokensWeek);

  tr.appendChild(cell(model.name, false));
  tr.appendChild(cell(formatCostPerM(model.inputPricePerToken), true));
  tr.appendChild(cell(formatCostPerM(model.outputPricePerToken), true));
  tr.appendChild(cell(formatTtft(model.ttft_ms), true));
  tr.appendChild(cell(model.inputModality, false));
  tr.appendChild(cell(model.outputModality, false));
  tr.appendChild(cell(formatTokens(daily), true, String(daily)));
  tr.appendChild(cell(formatTokens(weekly), true, String(weekly)));
  return tr;
}

var allModels = [];
var sortKey = null;
var sortDir = "asc";
var nameQuery = "";
var modalityFilter = "All";
var usagePeriod = "daily";

var SVG_NS = "http://www.w3.org/2000/svg";
var CHART_W = 960;
var CHART_HEADER_H = 24;
var CHART_ROW_H = 56;
var CHART_NAME_X = 8;
var CHART_PRICE_X = 180;
var CHART_PRICE_W = 380;
var CHART_USAGE_X = 640;
var CHART_USAGE_W = 180;

function costInPerM(model) {
  return Number(model.inputPricePerToken) * 1000000;
}

function costOutPerM(model) {
  return Number(model.outputPricePerToken) * 1000000;
}

function dailyOf(model) {
  return Number(model.inputTokensDay) + Number(model.outputTokensDay);
}

function weeklyOf(model) {
  return Number(model.inputTokensWeek) + Number(model.outputTokensWeek);
}

function usageOf(model) {
  return usagePeriod === "weekly" ? weeklyOf(model) : dailyOf(model);
}

function getPriceMax(visible) {
  var max = 0;
  visible.forEach(function (model) {
    var inV = costInPerM(model);
    var outV = costOutPerM(model);
    if (inV > max) {
      max = inV;
    }
    if (outV > max) {
      max = outV;
    }
  });
  return max;
}

function getUsageTotal(visible) {
  var total = 0;
  visible.forEach(function (model) {
    total += usageOf(model);
  });
  return total;
}

function svgEl(tag, attrs, text) {
  var el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
  }
  if (text !== undefined && text !== null) {
    el.textContent = text;
  }
  return el;
}

function barWidth(value, max, fullWidth) {
  if (!(max > 0) || !(value > 0)) {
    return 0;
  }
  var w = (Number(value) / max) * fullWidth;
  if (w > 0 && w < 2) {
    return 2;
  }
  return w;
}

function renderCharts(visible) {
  var svg = document.getElementById("charts-svg");
  var countEl = document.getElementById("charts-count");
  var emptyEl = document.getElementById("charts-empty");
  if (!svg) {
    return;
  }
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  if (countEl) {
    countEl.textContent =
      "Showing " + visible.length + " of " + allModels.length + " models.";
  }
  if (visible.length === 0) {
    svg.style.display = "none";
    svg.removeAttribute("viewBox");
    svg.setAttribute("aria-label", "No chart data to display");
    if (emptyEl) {
      emptyEl.hidden = false;
    }
    return;
  }
  if (emptyEl) {
    emptyEl.hidden = true;
  }
  svg.style.display = "";
  var priceMax = getPriceMax(visible);
  var usageTotal = getUsageTotal(visible);
  var height = CHART_HEADER_H + visible.length * CHART_ROW_H + 8;
  svg.setAttribute("viewBox", "0 0 " + CHART_W + " " + height);
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("aria-label", "Price and usage charts for " + visible.length + " models");

  svg.appendChild(svgEl("text", { x: CHART_NAME_X, y: 16, class: "chart-col-header" }, "Model"));
  svg.appendChild(svgEl("text", { x: CHART_PRICE_X, y: 16, class: "chart-col-header" }, "Price ($/M, linear)"));
  svg.appendChild(svgEl("text", { x: CHART_USAGE_X, y: 16, class: "chart-col-header" }, "Usage share"));

  visible.forEach(function (model, i) {
    var y0 = CHART_HEADER_H + i * CHART_ROW_H;
    var inV = costInPerM(model);
    var outV = costOutPerM(model);
    var usage = usageOf(model);
    var share = usageTotal > 0 ? usage / usageTotal : 0;
    var pctText = (share * 100).toFixed(1) + "%";
    var periodLabel = usagePeriod === "weekly" ? "weekly" : "daily";

    var g = svgEl("g", {});
    g.appendChild(
      svgEl(
        "title",
        {},
        String(model.name) +
          ": " +
          formatCostPerM(model.inputPricePerToken) +
          " in, " +
          formatCostPerM(model.outputPricePerToken) +
          " out, " +
          pctText +
          " (" +
          String(usage) +
          " " +
          periodLabel +
          " tokens)"
      )
    );
    g.appendChild(svgEl("text", { x: CHART_NAME_X, y: y0 + 26, class: "chart-name" }, String(model.name)));

    var inW = barWidth(inV, priceMax, CHART_PRICE_W);
    var outW = barWidth(outV, priceMax, CHART_PRICE_W);
    g.appendChild(svgEl("rect", { x: CHART_PRICE_X, y: y0 + 6, width: inW, height: 12, class: "bar-in" }));
    g.appendChild(
      svgEl("text", { x: CHART_PRICE_X + inW + 5, y: y0 + 16, class: "chart-value" }, formatCostPerM(model.inputPricePerToken))
    );
    g.appendChild(svgEl("rect", { x: CHART_PRICE_X, y: y0 + 22, width: outW, height: 12, class: "bar-out" }));
    g.appendChild(
      svgEl("text", { x: CHART_PRICE_X + outW + 5, y: y0 + 32, class: "chart-value" }, formatCostPerM(model.outputPricePerToken))
    );

    var shareW = usageTotal > 0 ? share * CHART_USAGE_W : 0;
    g.appendChild(svgEl("rect", { x: CHART_USAGE_X, y: y0 + 14, width: shareW, height: 16, class: "bar-share" }));
    var shareLabel = svgEl(
      "text",
      { x: CHART_USAGE_X + shareW + 5, y: y0 + 27, class: "chart-value" },
      pctText + " (" + formatTokens(usage) + ")"
    );
    shareLabel.appendChild(svgEl("title", {}, String(usage) + " " + periodLabel + " tokens"));
    g.appendChild(shareLabel);

    svg.appendChild(g);
  });
}

function clearChartsOnError() {
  var svg = document.getElementById("charts-svg");
  var countEl = document.getElementById("charts-count");
  var emptyEl = document.getElementById("charts-empty");
  if (svg) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    svg.style.display = "none";
    svg.removeAttribute("viewBox");
    svg.setAttribute("aria-label", "Charts unavailable: data failed to load");
  }
  if (countEl) {
    countEl.textContent = "";
  }
  if (emptyEl) {
    emptyEl.hidden = true;
  }
}

function matchesFilters(model) {
  var nameOk = String(model.name).toLowerCase().indexOf(nameQuery) !== -1;
  var modalityOk =
    modalityFilter === "All" ||
    model.inputModality === modalityFilter ||
    model.outputModality === modalityFilter;
  return nameOk && modalityOk;
}

function compareByKey(a, b, key) {
  switch (key) {
    case "costIn":
      return Number(a.inputPricePerToken) - Number(b.inputPricePerToken);
    case "costOut":
      return Number(a.outputPricePerToken) - Number(b.outputPricePerToken);
    case "ttft":
      return Number(a.ttft_ms) - Number(b.ttft_ms);
    case "daily":
      return (
        Number(a.inputTokensDay) +
        Number(a.outputTokensDay) -
        (Number(b.inputTokensDay) + Number(b.outputTokensDay))
      );
    case "weekly":
      return (
        Number(a.inputTokensWeek) +
        Number(a.outputTokensWeek) -
        (Number(b.inputTokensWeek) + Number(b.outputTokensWeek))
      );
    case "name":
      return String(a.name).toLowerCase() < String(b.name).toLowerCase()
        ? -1
        : String(a.name).toLowerCase() > String(b.name).toLowerCase()
          ? 1
          : 0;
    case "inputModality":
      return String(a.inputModality).toLowerCase() <
        String(b.inputModality).toLowerCase()
        ? -1
        : String(a.inputModality).toLowerCase() >
            String(b.inputModality).toLowerCase()
          ? 1
          : 0;
    case "outputModality":
      return String(a.outputModality).toLowerCase() <
        String(b.outputModality).toLowerCase()
        ? -1
        : String(a.outputModality).toLowerCase() >
            String(b.outputModality).toLowerCase()
          ? 1
          : 0;
    default:
      return 0;
  }
}

function getVisibleModels() {
  var visible = allModels.filter(matchesFilters);
  if (sortKey !== null) {
    var dir = sortDir === "desc" ? -1 : 1;
    visible.sort(function (a, b) {
      return compareByKey(a, b, sortKey) * dir;
    });
  }
  return visible;
}

function updateSortIndicators() {
  var headers = document.querySelectorAll("th[data-sort-key]");
  Array.prototype.forEach.call(headers, function (th) {
    var key = th.getAttribute("data-sort-key");
    var arrow = th.querySelector(".arrow");
    if (key === sortKey) {
      th.setAttribute("aria-sort", sortDir === "desc" ? "descending" : "ascending");
      if (arrow) {
        arrow.textContent = sortDir === "desc" ? "▼" : "▲";
      }
    } else {
      th.removeAttribute("aria-sort");
      if (arrow) {
        arrow.textContent = "";
      }
    }
  });
}

function render() {
  var tbody = document.getElementById("models-body");
  var statusEl = document.getElementById("status");
  var emptyEl = document.getElementById("empty");
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  var visible = getVisibleModels();
  visible.forEach(function (model) {
    tbody.appendChild(buildRow(model));
  });
  statusEl.textContent =
    "Showing " + visible.length + " of " + allModels.length + " models.";
  if (emptyEl) {
    emptyEl.hidden = visible.length !== 0;
  }
  updateSortIndicators();
  renderCharts(visible);
}

function handleSort(key) {
  if (sortKey !== key) {
    sortKey = key;
    sortDir = "asc";
  } else {
    sortDir = sortDir === "asc" ? "desc" : "asc";
  }
  render();
}

function wireControls() {
  var headers = document.querySelectorAll("th[data-sort-key]");
  Array.prototype.forEach.call(headers, function (th) {
    var button = th.querySelector("button");
    if (button) {
      button.addEventListener("click", function () {
        handleSort(th.getAttribute("data-sort-key"));
      });
    }
  });
  var nameEl = document.getElementById("filter-name");
  if (nameEl) {
    nameEl.addEventListener("input", function () {
      nameQuery = String(nameEl.value).trim().toLowerCase();
      render();
    });
  }
  var modalityEl = document.getElementById("filter-modality");
  if (modalityEl) {
    modalityEl.addEventListener("change", function () {
      modalityFilter = modalityEl.value;
      render();
    });
  }
  var periodInputs = document.querySelectorAll('input[name="usage-period"]');
  Array.prototype.forEach.call(periodInputs, function (input) {
    input.addEventListener("change", function () {
      if (input.checked) {
        usagePeriod = input.value === "weekly" ? "weekly" : "daily";
        render();
      }
    });
  });
}

function showError(message) {
  var errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.hidden = false;
  var statusEl = document.getElementById("status");
  statusEl.textContent = "Could not load model data.";
  clearChartsOnError();
}

function load() {
  wireControls();
  var statusEl = document.getElementById("status");
  fetch("./mock-data.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (models) {
      if (!Array.isArray(models)) {
        throw new Error("invalid JSON: expected an array");
      }
      allModels = models;
      render();
      statusEl.textContent =
        "Showing " + getVisibleModels().length + " of " + models.length + " models.";
    })
    .catch(function (err) {
      showError("Could not load model data from mock-data.json (" + err.message + ").");
    });
}

document.addEventListener("DOMContentLoaded", load);
