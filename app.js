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
  tr.appendChild(cell(formatTokens(daily), true, String(daily)));
  tr.appendChild(cell(formatTokens(weekly), true, String(weekly)));
  return tr;
}

function showError(message) {
  var errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.hidden = false;
  var statusEl = document.getElementById("status");
  statusEl.textContent = "Could not load model data.";
}

function load() {
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
      var tbody = document.getElementById("models-body");
      models.forEach(function (model) {
        tbody.appendChild(buildRow(model));
      });
      statusEl.textContent = "Showing " + models.length + " models.";
    })
    .catch(function (err) {
      showError("Could not load model data from mock-data.json (" + err.message + ").");
    });
}

document.addEventListener("DOMContentLoaded", load);
