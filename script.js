const API_URL = "https://pokeapi.co/api/v2/pokemon";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const message = document.getElementById("message");
const list = document.getElementById("list");
const details = document.getElementById("details");

async function getData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Pokemon not found or server error");
  }
  return await response.json();
}

async function loadList() {
  try {
    const data = await getData(API_URL + "?limit=20");
    list.innerHTML = "";
    data.results.forEach(function (pokemon) {
      const button = document.createElement("button");
      button.textContent = pokemon.name;
      button.addEventListener("click", function () {
        showPokemon(pokemon.name);
      });
      list.appendChild(button);
    });
  } catch (error) {
    message.textContent = "Could not load the list: " + error.message;
  }
}

async function showPokemon(nameOrId) {
  message.textContent = "";
  details.textContent = "Loading...";
  try {
    const pokemon = await getData(API_URL + "/" + nameOrId);
    const types = pokemon.types.map(function (t) {
      return t.type.name;
    }).join(", ");

    details.innerHTML =
      "<h3>" + pokemon.name + " (#" + pokemon.id + ")</h3>" +
      '<img src="' + pokemon.sprites.front_default + '" alt="' + pokemon.name + '">' +
      "<p>Type: " + types + "</p>" +
      "<p>Height: " + pokemon.height / 10 + " m</p>" +
      "<p>Weight: " + pokemon.weight / 10 + " kg</p>";
  } catch (error) {
    details.textContent = "";
    message.textContent = "Error: " + error.message;
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const value = input.value.trim().toLowerCase();
  if (value === "") {
    message.textContent = "Enter a pokemon name or number";
    return;
  }
  showPokemon(value);
});

loadList();
