var allCountries = [];

var searchInput = document.getElementById("search");
var regionSelect = document.getElementById("region");
var sortSelect = document.getElementById("sort");
var grid = document.getElementById("grid");
var message = document.getElementById("message");
var info = document.getElementById("info");
var modal = document.getElementById("modal");
var modalBox = document.getElementById("modalBox");

async function loadCountries() {
  message.className = "";
  message.innerHTML = "Kraunama...";
  grid.innerHTML = "";
  info.innerHTML = "";

  try {
    var response = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,region,population,area,flags,languages,currencies");

    if (response.ok === false) {
      throw new Error("Klaida: " + response.status);
    }

    allCountries = await response.json();
    fillRegions();
    message.innerHTML = "";
    showCountries();
  } catch (error) {
    message.className = "error";
    message.innerHTML = "Nepavyko gauti duomenų. Patikrinkite internetą ir bandykite dar kartą." +
      "<br><button id='retryBtn'>Bandyti iš naujo</button>";
    document.getElementById("retryBtn").addEventListener("click", loadCountries);
  }
}

function fillRegions() {
  var regions = [];
  for (var i = 0; i < allCountries.length; i++) {
    var r = allCountries[i].region;
    if (r !== "" && regions.indexOf(r) === -1) {
      regions.push(r);
    }
  }
  regions.sort();
  for (var j = 0; j < regions.length; j++) {
    regionSelect.innerHTML += "<option value='" + regions[j] + "'>" + regions[j] + "</option>";
  }
}

function showCountries() {
  var text = searchInput.value.toLowerCase();
  var region = regionSelect.value;
  var sortType = sortSelect.value;

  var result = allCountries.filter(function (c) {
    var nameOk = c.name.common.toLowerCase().includes(text);
    var regionOk = region === "all" || c.region === region;
    return nameOk && regionOk;
  });

  result.sort(function (a, b) {
    if (sortType === "name-asc") {
      return a.name.common.localeCompare(b.name.common);
    } else if (sortType === "name-desc") {
      return b.name.common.localeCompare(a.name.common);
    } else if (sortType === "pop-desc") {
      return b.population - a.population;
    } else if (sortType === "pop-asc") {
      return a.population - b.population;
    } else {
      return b.area - a.area;
    }
  });

  if (result.length === 0) {
    grid.innerHTML = "";
    info.innerHTML = "";
    message.innerHTML = "Šalių pagal šią paiešką nerasta. Pabandykite kitą pavadinimą arba regioną.";
    return;
  }

  message.innerHTML = "";

  var total = 0;
  for (var i = 0; i < result.length; i++) {
    total = total + result[i].population;
  }
  info.innerHTML = "Rasta šalių: <b>" + result.length + "</b> | Bendras gyventojų skaičius: <b>" + total.toLocaleString("lt-LT") + "</b>";

  grid.innerHTML = result.slice(0, 60).map(function (c) {
    var capital = c.capital && c.capital.length > 0 ? c.capital[0] : "nėra";
    return "<div class='card' data-name='" + c.name.common.replace(/'/g, "&#39;") + "'>" +
      "<img src='" + c.flags.png + "' alt='" + c.name.common + " vėliava'>" +
      "<h3>" + c.name.common + "</h3>" +
      "<p>Sostinė: " + capital + "</p>" +
      "<p>Gyventojai: " + c.population.toLocaleString("lt-LT") + "</p>" +
      "</div>";
  }).join("");
}

function showDetails(name) {
  var country = allCountries.find(function (c) {
    return c.name.common === name;
  });

  var capital = country.capital && country.capital.length > 0 ? country.capital.join(", ") : "nėra";
  var languages = country.languages ? Object.values(country.languages).join(", ") : "nėra duomenų";
  var currencies = country.currencies ? Object.values(country.currencies).map(function (cur) {
    return cur.name;
  }).join(", ") : "nėra duomenų";

  modalBox.innerHTML =
    "<img src='" + country.flags.png + "' alt='vėliava'>" +
    "<h2>" + country.name.common + "</h2>" +
    "<p><b>Oficialus pavadinimas:</b> " + country.name.official + "</p>" +
    "<p><b>Sostinė:</b> " + capital + "</p>" +
    "<p><b>Regionas:</b> " + country.region + "</p>" +
    "<p><b>Gyventojai:</b> " + country.population.toLocaleString("lt-LT") + "</p>" +
    "<p><b>Plotas:</b> " + country.area.toLocaleString("lt-LT") + " km²</p>" +
    "<p><b>Kalbos:</b> " + languages + "</p>" +
    "<p><b>Valiuta:</b> " + currencies + "</p>" +
    "<button id='closeBtn'>Uždaryti</button>";

  modal.className = "open";
  document.getElementById("closeBtn").addEventListener("click", closeModal);
}

function closeModal() {
  modal.className = "";
}

searchInput.addEventListener("input", showCountries);
regionSelect.addEventListener("change", showCountries);
sortSelect.addEventListener("change", showCountries);

grid.addEventListener("click", function (event) {
  var card = event.target.closest(".card");
  if (card) {
    showDetails(card.dataset.name);
  }
});

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

loadCountries();
