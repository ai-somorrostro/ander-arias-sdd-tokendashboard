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
  tr.tabIndex = 0;
  tr.setAttribute("data-name", String(model.name));
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
var selectedName = null;
var panelOpen = false;
var lastFocusedRow = null;

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

function formatSpend(amount) {
  return "$" + Number(amount).toFixed(2);
}

function spendDayOf(model) {
  return (
    Number(model.inputTokensDay) * Number(model.inputPricePerToken) +
    Number(model.outputTokensDay) * Number(model.outputPricePerToken)
  );
}

function spendWeekOf(model) {
  return (
    Number(model.inputTokensWeek) * Number(model.inputPricePerToken) +
    Number(model.outputTokensWeek) * Number(model.outputPricePerToken)
  );
}

function findModelByName(name) {
  for (var i = 0; i < allModels.length; i++) {
    if (String(allModels[i].name) === String(name)) {
      return allModels[i];
    }
  }
  return null;
}

function isPanelOpen() {
  var panel = document.getElementById("sidepanel");
  return !!(panel && !panel.hidden);
}

function setPanelVisibility(open) {
  var panel = document.getElementById("sidepanel");
  var backdrop = document.getElementById("panel-backdrop");
  if (!panel) {
    return;
  }
  panelOpen = open;
  panel.hidden = !open;
  if (backdrop) {
    backdrop.hidden = !open;
  }
  if (open) {
    document.body.classList.add("panel-open");
  } else {
    document.body.classList.remove("panel-open");
  }
}

function openPanel(name, focusPanel) {
  var model = findModelByName(name);
  if (!model) {
    return;
  }
  var active = document.activeElement;
  if (
    active &&
    active.tagName === "TR" &&
    active.getAttribute("data-name") === String(name)
  ) {
    lastFocusedRow = active;
  } else {
    var row = document.querySelector(
      'tbody tr[data-name="' + String(name).replace(/"/g, "") + '"]'
    );
    if (row) {
      lastFocusedRow = row;
    }
  }
  selectedName = String(model.name);
  setPanelVisibility(true);
  renderPanel(getVisibleModels());
  if (focusPanel !== false) {
    var title = document.getElementById("panel-title");
    var closeBtn = document.getElementById("panel-close");
    if (closeBtn) {
      closeBtn.focus();
    } else if (title) {
      title.focus();
    }
  }
}

function closePanel(returnFocus) {
  if (!isPanelOpen() && selectedName === null) {
    return;
  }
  selectedName = null;
  panelOpen = false;
  setPanelVisibility(false);
  var notice = document.getElementById("panel-notice");
  if (notice) {
    notice.hidden = true;
  }
  var rows = document.querySelectorAll("tbody tr.selected");
  Array.prototype.forEach.call(rows, function (tr) {
    tr.classList.remove("selected");
    tr.removeAttribute("aria-selected");
  });
  if (returnFocus !== false && lastFocusedRow && lastFocusedRow.isConnected) {
    lastFocusedRow.focus();
  }
  lastFocusedRow = null;
}

function panelMetricRow(dl, label, value, title, dim) {
  var dt = document.createElement("dt");
  dt.textContent = label;
  var dd = document.createElement("dd");
  dd.textContent = value;
  if (title) {
    dd.title = title;
  }
  if (dim) {
    dd.className = "dim";
  }
  dl.appendChild(dt);
  dl.appendChild(dd);
}

function panelMetricsCard(metricsEl, title, build) {
  var section = document.createElement("section");
  section.className = "panel-card";
  var h = document.createElement("h3");
  h.textContent = title;
  section.appendChild(h);
  var dl = document.createElement("dl");
  build(dl);
  section.appendChild(dl);
  metricsEl.appendChild(section);
  return dl;
}

function panelBarSvg(opts) {
  var W = 344;
  var rowH = 40;
  var barX = 0;
  var valueW = 118;
  var barW = W - valueW - 8;
  var rows = opts.rows;
  var max = opts.max > 0 ? opts.max : 1;
  var H = rows.length * rowH + 4;
  var svg = svgEl("svg", {
    viewBox: "0 0 " + W + " " + H,
    role: "img",
    "aria-label": opts.label
  });
  svg.appendChild(svgEl("title", {}, opts.titleText));
  rows.forEach(function (row, i) {
    var y = 4 + i * rowH;
    var g = svgEl("g", {});
    g.appendChild(
      svgEl("title", {}, row.label + ": " + row.valueText)
    );
    g.appendChild(
      svgEl(
        "text",
        { x: 0, y: y + 11, class: "chart-label" },
        row.label
      )
    );
    var w = barWidth(row.value, max, barW);
    g.appendChild(
      svgEl("rect", {
        x: barX,
        y: y + 16,
        width: Math.max(w, row.value > 0 ? 2 : 0),
        height: 13,
        rx: 2,
        class: row.cls
      })
    );
    g.appendChild(
      svgEl(
        "text",
        { x: barX + barW + 8, y: y + 27, class: "chart-value" },
        row.valueText
      )
    );
    svg.appendChild(g);
  });
  return svg;
}

function panelTtftSvg(model, visible) {
  var W = 344;
  var H = 84;
  var pad = 2;
  var trackY = 30;
  var trackH = 12;
  var ttfts = visible
    .map(function (m) {
      return Number(m.ttft_ms);
    })
    .sort(function (a, b) {
      return a - b;
    });
  var slowest = ttfts.length ? ttfts[ttfts.length - 1] : Number(model.ttft_ms);
  var fastest = ttfts.length ? ttfts[0] : Number(model.ttft_ms);
  var median;
  if (!ttfts.length) {
    median = Number(model.ttft_ms);
  } else if (ttfts.length % 2 === 1) {
    median = ttfts[(ttfts.length - 1) / 2];
  } else {
    median = (ttfts[ttfts.length / 2 - 1] + ttfts[ttfts.length / 2]) / 2;
  }
  var max = slowest > 0 ? slowest : 1;
  function xPos(v) {
    return pad + (Number(v) / max) * (W - pad * 2);
  }
  var svg = svgEl("svg", {
    viewBox: "0 0 " + W + " " + H,
    role: "img",
    "aria-label": "TTFT compared to visible models"
  });
  var summary =
    String(model.name) +
    " TTFT " +
    formatTtft(model.ttft_ms) +
    "; fastest " +
    formatTtft(fastest) +
    ", median " +
    formatTtft(median) +
    ", slowest " +
    formatTtft(slowest);
  svg.appendChild(svgEl("title", {}, summary));
  svg.appendChild(
    svgEl("rect", {
      x: pad,
      y: trackY,
      width: W - pad * 2,
      height: trackH,
      fill: "#e5eefa",
      stroke: "#c9d4e2"
    })
  );
  var thisW = xPos(model.ttft_ms) - pad;
  svg.appendChild(
    svgEl("rect", {
      x: pad,
      y: trackY,
      width: Math.max(thisW, 2),
      height: trackH,
      class: "bar-in"
    })
  );
  [
    { v: fastest, label: "fastest" },
    { v: median, label: "median" },
    { v: slowest, label: "slowest" }
  ].forEach(function (m) {
    var x = xPos(m.v);
    svg.appendChild(
      svgEl("line", {
        x1: x,
        y1: trackY - 6,
        x2: x,
        y2: trackY + trackH + 6,
        class: "ttft-marker"
      })
    );
  });
  svg.appendChild(
    svgEl(
      "text",
      { x: pad, y: 14, class: "chart-label" },
      "This model " + formatTtft(model.ttft_ms)
    )
  );
  svg.appendChild(
    svgEl(
      "text",
      { x: pad, y: trackY + trackH + 22, class: "chart-value" },
      "Fastest " + formatTtft(fastest) + "  ·  Median " + formatTtft(median)
    )
  );
  svg.appendChild(
    svgEl(
      "text",
      { x: pad, y: trackY + trackH + 38, class: "chart-value" },
      "Slowest " + formatTtft(slowest)
    )
  );
  return svg;
}

function panelSection(graphsEl, heading, explainer) {
  var card = document.createElement("section");
  card.className = "panel-graph-card";
  var h = document.createElement("h3");
  h.textContent = heading;
  card.appendChild(h);
  if (explainer) {
    var p = document.createElement("p");
    p.className = "formula";
    p.textContent = explainer;
    card.appendChild(p);
  }
  graphsEl.appendChild(card);
  return card;
}

function renderPanel(visible) {
  var panel = document.getElementById("sidepanel");
  var titleEl = document.getElementById("panel-title");
  var noticeEl = document.getElementById("panel-notice");
  var metricsEl = document.getElementById("panel-metrics");
  var graphsEl = document.getElementById("panel-graphs");
  if (!panel || !titleEl || !metricsEl || !graphsEl) {
    return;
  }
  if (selectedName === null || !isPanelOpen()) {
    return;
  }
  var model = findModelByName(selectedName);
  if (!model) {
    return;
  }
  while (metricsEl.firstChild) {
    metricsEl.removeChild(metricsEl.firstChild);
  }
  while (graphsEl.firstChild) {
    graphsEl.removeChild(graphsEl.firstChild);
  }
  titleEl.textContent = String(model.name);
  titleEl.title = String(model.name);
  panel.setAttribute("aria-label", String(model.name));

  var daily = dailyOf(model);
  var weekly = weeklyOf(model);
  var dailyAvg = weekly / 7;
  var delta = daily - dailyAvg;
  var deltaPct = dailyAvg > 0 ? (delta / dailyAvg) * 100 : 0;
  var deltaText =
    (delta >= 0 ? "+" : "") +
    formatTokens(Math.abs(delta) < 0.5 ? 0 : delta) +
    " (" +
    (deltaPct >= 0 ? "+" : "") +
    deltaPct.toFixed(1) +
    "% vs avg)";
  var inDay = Number(model.inputTokensDay);
  var outDay = Number(model.outputTokensDay);
  var inWeek = Number(model.inputTokensWeek);
  var outWeek = Number(model.outputTokensWeek);
  var inShareDay = daily > 0 ? (inDay / daily) * 100 : 0;
  var outShareDay = daily > 0 ? (outDay / daily) * 100 : 0;
  var inShareWeek = weekly > 0 ? (inWeek / weekly) * 100 : 0;
  var outShareWeek = weekly > 0 ? (outWeek / weekly) * 100 : 0;

  var visibleDaily = 0;
  var visibleWeekly = 0;
  visible.forEach(function (m) {
    visibleDaily += dailyOf(m);
    visibleWeekly += weeklyOf(m);
  });
  var inVisible = visible.some(function (m) {
    return String(m.name) === String(model.name);
  });
  var shareDay = visibleDaily > 0 ? (daily / visibleDaily) * 100 : 0;
  var shareWeek = visibleWeekly > 0 ? (weekly / visibleWeekly) * 100 : 0;

  var spendDay = spendDayOf(model);
  var spendWeek = spendWeekOf(model);
  var ratio =
    Number(model.inputPricePerToken) > 0
      ? Number(model.outputPricePerToken) / Number(model.inputPricePerToken)
      : 0;

  if (noticeEl) {
    if (!inVisible) {
      noticeEl.hidden = false;
      noticeEl.textContent =
        "This model is outside the current filters. Own metrics are shown; shares and TTFT context are unavailable.";
    } else {
      noticeEl.hidden = true;
      noticeEl.textContent = "";
    }
  }

  var badges = document.createElement("div");
  badges.className = "panel-badges";
  [String(model.inputModality), String(model.outputModality), formatTtft(model.ttft_ms)].forEach(
    function (label, i) {
      var b = document.createElement("span");
      b.className = "badge";
      b.textContent = i < 2 ? (i === 0 ? "In: " + label : "Out: " + label) : label;
      b.title = i === 0 ? "inputModality" : i === 1 ? "outputModality" : "ttft_ms";
      badges.appendChild(b);
    }
  );
  metricsEl.appendChild(badges);

  panelMetricsCard(metricsEl, "Cost", function (dl) {
    panelMetricRow(dl, "Cost In", formatCostPerM(model.inputPricePerToken), "inputPricePerToken * 1,000,000");
    panelMetricRow(dl, "Cost Out", formatCostPerM(model.outputPricePerToken), "outputPricePerToken * 1,000,000");
    panelMetricRow(dl, "Out / In ratio", ratio.toFixed(2) + "x", "outputPrice / inputPrice");
  });

  panelMetricsCard(metricsEl, "Volume", function (dl) {
    panelMetricRow(dl, "Daily total", formatTokens(daily), String(daily));
    panelMetricRow(dl, "Weekly total", formatTokens(weekly), String(weekly));
    panelMetricRow(dl, "Daily avg (week / 7)", formatTokens(dailyAvg), String(dailyAvg));
    panelMetricRow(dl, "Day vs avg", deltaText, String(delta));
    panelMetricRow(dl, "Day input share", inShareDay.toFixed(1) + "%", String(inDay), true);
    panelMetricRow(dl, "Day output share", outShareDay.toFixed(1) + "%", String(outDay), true);
    panelMetricRow(dl, "Week input share", inShareWeek.toFixed(1) + "%", String(inWeek), true);
    panelMetricRow(dl, "Week output share", outShareWeek.toFixed(1) + "%", String(outWeek), true);
  });

  panelMetricsCard(metricsEl, "Share of visible", function (dl) {
    if (inVisible) {
      panelMetricRow(dl, "Daily share", shareDay.toFixed(1) + "%", String(daily) + " of " + String(visibleDaily));
      panelMetricRow(dl, "Weekly share", shareWeek.toFixed(1) + "%", String(weekly) + " of " + String(visibleWeekly));
    } else {
      panelMetricRow(dl, "Daily share", "—", "unavailable: outside filters");
      panelMetricRow(dl, "Weekly share", "—", "unavailable: outside filters");
    }
  });

  panelMetricsCard(metricsEl, "Estimated spend", function (dl) {
    panelMetricRow(dl, "Per day", "est. " + formatSpend(spendDay), "inputTokensDay*inputPricePerToken + outputTokensDay*outputPricePerToken");
    panelMetricRow(dl, "Per week", "est. " + formatSpend(spendWeek), "inputTokensWeek*inputPricePerToken + outputTokensWeek*outputPricePerToken");
    var formula = document.createElement("p");
    formula.className = "formula";
    formula.textContent = "Estimate: inputTokens × inputPrice + outputTokens × outputPrice, per period.";
    dl.appendChild(formula);
  });

  var splitCard = panelSection(graphsEl, "Input vs output split");
  splitCard.appendChild(
    panelBarSvg({
      label: "Daily input versus output tokens",
      titleText:
        String(model.name) +
        " daily split: " +
        String(inDay) +
        " input, " +
        String(outDay) +
        " output",
      max: daily > 0 ? daily : 1,
      rows: [
        {
          label: "Day in",
          value: inDay,
          valueText: formatTokens(inDay) + " (" + inShareDay.toFixed(1) + "%)",
          cls: "bar-in"
        },
        {
          label: "Day out",
          value: outDay,
          valueText: formatTokens(outDay) + " (" + outShareDay.toFixed(1) + "%)",
          cls: "bar-out"
        }
      ]
    })
  );
  splitCard.appendChild(
    panelBarSvg({
      label: "Weekly input versus output tokens",
      titleText:
        String(model.name) +
        " weekly split: " +
        String(inWeek) +
        " input, " +
        String(outWeek) +
        " output",
      max: weekly > 0 ? weekly : 1,
      rows: [
        {
          label: "Week in",
          value: inWeek,
          valueText: formatTokens(inWeek) + " (" + inShareWeek.toFixed(1) + "%)",
          cls: "bar-in"
        },
        {
          label: "Week out",
          value: outWeek,
          valueText: formatTokens(outWeek) + " (" + outShareWeek.toFixed(1) + "%)",
          cls: "bar-out"
        }
      ]
    })
  );

  var avgCard = panelSection(graphsEl, "Daily vs weekly average");
  avgCard.appendChild(
    panelBarSvg({
      label: "Daily total versus daily average from weekly total",
      titleText:
        "Daily " +
        String(daily) +
        " vs avg " +
        String(dailyAvg) +
        " (weekly " +
        String(weekly) +
        " / 7)",
      max: Math.max(daily, dailyAvg, 1),
      rows: [
        {
          label: "Today",
          value: daily,
          valueText: formatTokens(daily),
          cls: "bar-share"
        },
        {
          label: "Avg (w/7)",
          value: dailyAvg,
          valueText: formatTokens(dailyAvg),
          cls: "bar-avg"
        }
      ]
    })
  );

  if (inVisible && visible.length > 0) {
    var ttftCard = panelSection(graphsEl, "TTFT vs visible models");
    ttftCard.appendChild(panelTtftSvg(model, visible));
    var shareCard = panelSection(graphsEl, "Share of visible total");
    shareCard.appendChild(
      panelBarSvg({
        label: "Share of visible daily and weekly totals",
        titleText:
          "Day share " +
          shareDay.toFixed(1) +
          "% of " +
          String(visibleDaily) +
          "; week share " +
          shareWeek.toFixed(1) +
          "% of " +
          String(visibleWeekly),
        max: 100,
        rows: [
          {
            label: "Day share",
            value: shareDay,
            valueText: shareDay.toFixed(1) + "% (" + formatTokens(daily) + ")",
            cls: "bar-share"
          },
          {
            label: "Week share",
            value: shareWeek,
            valueText: shareWeek.toFixed(1) + "% (" + formatTokens(weekly) + ")",
            cls: "bar-share"
          }
        ]
      })
    );
  } else {
    panelSection(
      graphsEl,
      "Share and TTFT context unavailable",
      "Outside current filters — adjust filters to recompute shares."
    );
  }

  var spendCard = panelSection(
    graphsEl,
    "Estimated cost exposure",
    "Estimate: inputTokens × inputPrice + outputTokens × outputPrice."
  );
  spendCard.appendChild(
    panelBarSvg({
      label: "Estimated spend per day and per week",
      titleText:
        "Est. spend day " +
        formatSpend(spendDay) +
        ", week " +
        formatSpend(spendWeek),
      max: Math.max(spendDay, spendWeek, 0.01),
      rows: [
        {
          label: "Est. $/day",
          value: spendDay,
          valueText: "est. " + formatSpend(spendDay),
          cls: "bar-spend"
        },
        {
          label: "Est. $/wk",
          value: spendWeek,
          valueText: "est. " + formatSpend(spendWeek),
          cls: "bar-spend"
        }
      ]
    })
  );
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
    var tr = buildRow(model);
    if (String(model.name) === selectedName) {
      tr.classList.add("selected");
      tr.setAttribute("aria-selected", "true");
    }
    tr.addEventListener("click", function () {
      openPanel(String(model.name), true);
      render();
    });
    tr.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        openPanel(String(model.name), true);
        render();
      }
    });
    tbody.appendChild(tr);
  });
  statusEl.textContent =
    "Showing " + visible.length + " of " + allModels.length + " models.";
  if (emptyEl) {
    emptyEl.hidden = visible.length !== 0;
  }
  updateSortIndicators();
  renderCharts(visible);
  if (isPanelOpen() && selectedName !== null) {
    renderPanel(visible);
  }
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
  var closeBtn = document.getElementById("panel-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      closePanel(true);
    });
  }
  var backdrop = document.getElementById("panel-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closePanel(true);
    });
  }
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && isPanelOpen()) {
      closePanel(true);
    }
  });
}

function showError(message) {
  var errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.hidden = false;
  var statusEl = document.getElementById("status");
  statusEl.textContent = "Could not load model data.";
  clearChartsOnError();
  selectedName = null;
  setPanelVisibility(false);
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
