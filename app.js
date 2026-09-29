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
}

function showError(message) {
  var errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.hidden = false;
  var statusEl = document.getElementById("status");
  statusEl.textContent = "Could not load model data.";
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
