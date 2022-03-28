const day = document.getElementById("day");
const dateEntiere = document.getElementById("date");
const localisation = document.querySelector(".mid");
const actualweather = document.querySelector(".actualweather");
const temp = document.getElementById("temperature");
const temps = document.getElementById("temps");
const cards = document.getElementsByClassName("cards");
const iconnxtdays = document.getElementsByClassName("iconnxtdays");
const value = document.getElementsByClassName("value");
const changelocation = document.querySelector(".changelocation");

/////////////
const day1 = document.getElementById("day1");

var currentCity = "marseille";

let urlCurrentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=0af88cd672bdf1de0ef6e4f79489d087&units=metric`;
let urlforecastweather = `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=0af88cd672bdf1de0ef6e4f79489d087&units=metric`;

const updateLoading = (state) => {
  const loaderElem = document.getElementById("loader");
  if (state) {
    return (loaderElem.style.display = "none");
  }
  return (loaderElem.style.display = "flex");
};

async function updateCity(e) {
  updateLoading(false);
  const elemInput = document.getElementById("in");
  if (e) e.preventDefault();
  if (elemInput.value != "") {
    currentCity = document.getElementById("in").value;
    elemInput.value = "";
  } else {
    currentCity = "marseille";
  }
  urlCurrentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=0af88cd672bdf1de0ef6e4f79489d087&units=metric`;
  urlforecastweather = `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=0af88cd672bdf1de0ef6e4f79489d087&units=metric`;
  await recupererInfosAPI();
  try {
    await recupererForecastAPI();
  } catch (err) {
    updateLoading(true);
    showAlert("Cette ville n'existe pas.");
    console.error("Got an ERROR from the API.");
    return;
  }

  recupererInfoBasiques();

  console.log("Ville actualisée");
  updateLoading(true);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/////////////// RECUPERATION PARTIE TOP LEFT ///////////////

function recupererInfoBasiques() {
  // Récupere Jour / Date / Location
  let days = new Date();

  let jour = capitalizeFirstLetter(
    days.toLocaleString("en-us", { weekday: "long" })
  );

  let date = days.toLocaleString("en-us", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  //Integrer

  day.textContent = jour;
  dateEntiere.textContent = date;
  localisation.textContent = capitalizeFirstLetter(currentCity);
}

/////////////// RECUPERATION PARTIE BOT LEFT + TOP RIGHT ///////////////

function integrerInfosAPI(
  currentweathertemps,
  currentweathertemp,
  humidity,
  wind,
  tempFeelLike,
  svgday
) {
  temps.textContent = currentweathertemps;
  temp.textContent = Math.trunc(currentweathertemp) + " °C";
  value[0].textContent = Math.trunc(tempFeelLike) + " °C";
  value[1].textContent = humidity + " %";
  value[2].textContent = (wind * 3.6).toPrecision(3) + " km/h";
  actualweather.children[0].innerHTML = determineSVG(svgday);
}

function recupererInfosAPI() {
  return new Promise((resolve, reject) => {
    let requete = new XMLHttpRequest();
    requete.open("GET", urlCurrentWeather);
    requete.responseType = "json";
    requete.send();

    requete.onload = function () {
      if (requete.readyState === XMLHttpRequest.DONE) {
        if (requete.status === 200) {
          let reponse = requete.response; // On stock la réponse

          //On stock les données
          let currentweathertemps = reponse.weather[0].main;
          let currentweathertemp = reponse.main.temp;
          let wind = reponse.wind.speed;
          let humidity = reponse.main.humidity;
          let tempFeelLike = reponse.main.feels_like;
          let svgday = reponse.weather[0].main;

          integrerInfosAPI(
            currentweathertemps,
            currentweathertemp,
            humidity,
            wind,
            tempFeelLike,
            svgday
          );
        }
        console.log("Météo actualisée");
        resolve();
      } else {
        console.error("Un probleme est intervenu.");
      }
    };
  });
}

////////// RECUPERATION CARTES ////////////////

function recupererForecastAPI() {
  return new Promise((resolve, reject) => {
    let requete = new XMLHttpRequest();
    var listedttxt = new Array();
    requete.open("GET", urlforecastweather);
    requete.responseType = "json";
    requete.send();

    requete.onload = function () {
      if (requete.readyState === XMLHttpRequest.DONE) {
        if (requete.status === 200) {
          let reponse = requete.response;
          let todayDatePlain = new Date();
          let todayDate = new Date().toISOString().slice(0, 10);

          for (i = 0; i <= 39; i++) {
            // On vérifie que ce sont des jours d'après égaux à 15h.
            // Pour ça : on vérifie que l'API contient 15H.
            // Et on vérifie que la jour sélectionné est différent d'aujourd'hui.
            if (
              reponse.list[i].dt_txt.includes("15:00:00") &&
              reponse.list[i].dt_txt.split(" ")[0] != todayDate
            ) {
              listedttxt.push(i); // Contient tous les index des jours d'après à 15h.
            }
          }

          // On ne veut que les 4 jours d'après :
          if (listedttxt.length > 4) {
            listedttxt.pop(); // TODO: slice better
          }

          // Pour chaque index des jours forecast, on affiche la valeur dans les cartes.
          for (i = 0; i < listedttxt.length; i++) {
            todayDatePlain.setDate(todayDatePlain.getDate() + 1);

            cards[i].children[2].textContent =
              Math.trunc(reponse.list[listedttxt[i]].main.temp) + "°C";

            cards[i].children[1].textContent = capitalizeFirstLetter(
              todayDatePlain
                .toLocaleString("en-us", { weekday: "long" })
                .slice(0, 3)
            );

            cards[i].children[0].innerHTML = determineSVG(
              reponse.list[listedttxt[i]].weather[0].main
            );
          }
          console.log(listedttxt);
        } else {
          reject("Un problème est survenu (Appel API raté).");
        }
        console.log("Météo prochaine actualisée");
        resolve();
      }
    };
  });
}

const showAlert = (text) => {
  const elemErrorBox = document.getElementById("errorBox");

  elemErrorBox.textContent = text;
  elemErrorBox.style.display = "block";

  setTimeout(() => {
    elemErrorBox.textContent = "";
    elemErrorBox.style.display = "none";
  }, 2000);
};

/////////////// RECUPERATIONS SVG ///////////////
function determineSVG(svgday) {
  let actualsvg = "";

  switch (svgday) {
    case "Clouds":
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud day-icon"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>';
      break;
    case "Snow":
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-snow day-icon"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>';
      break;
    case "Rain":
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud-snow day-icon"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>';
      break;
    case "Clear":
    case "Sun":
    default:
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun day-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  }

  return actualsvg;
}

// On charge tout, à chaque changement de ville ou au début, par défaut marseille.
changelocation.addEventListener("click", updateCity);
updateCity();
