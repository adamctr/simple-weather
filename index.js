const day = document.getElementById("day");
const dateEntiere = document.getElementById("date");
const localisation = document.querySelector(".mid");
const actualweather = document.querySelector(".actualweather");
const temp = document.getElementById("temperature");
const temps = document.getElementById("temps");
const cards = document.getElementsByClassName("cards");
const iconnxtdays = document.getElementsByClassName("iconnxtdays");
const value = document.getElementsByClassName("value");

// Texte milieu CARTES
cards[0].children[1].textContent = "hey";
cards[1].children[1].textContent = "hey";
cards[2].children[1].textContent = "hey";
cards[3].children[1].textContent = "hey";

//Texte haut CARTES

// cards[0].children[0].innerHTML = 'hey bg';
// cards[1].children[0].innerHTML = 'hey bg';
// cards[2].children[0].innerHTML = 'hey bg';
// cards[3].children[0].innerHTML = 'hey bg';

// Texte bas CARTES

cards[0].children[2].textContent = "cc";
cards[1].children[2].textContent = "cc";
cards[2].children[2].textContent = "cc";
cards[3].children[2].textContent = "cc";
/////////////
const day1 = document.getElementById("day1");

const urlCurrentWeather =
  "https://api.openweathermap.org/data/2.5/weather?q=marseille&appid=0af88cd672bdf1de0ef6e4f79489d087&units=metric";

const urlforecastweather =
  "https://api.openweathermap.org/data/2.5/forecast?q=marseille&appid=0af88cd672bdf1de0ef6e4f79489d087&units=metric";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/////////////// RECUPERATION PARTIE TOP LEFT ///////////////

function recupererInfoBasiques() {
  // Récupere Jour / Date / Location
  let days = new Date();

  let jour = capitalizeFirstLetter(
    days.toLocaleString("fr-fr", { weekday: "long" })
  );

  let date = days.toLocaleString("fr-fr", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let location = "Marseille";

  //Integrer

  day.textContent = jour;
  dateEntiere.textContent = date;
  localisation.textContent = location;
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
    } else {
      console.log("Un probleme est intervenu.");
    }
  };
  console.log("Météo actualisée");
}

////////// RECUPERATION CARTES ////////////////

function recupererForecastAPI() {
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
          listedttxt.pop();
        }

        // Pour chaque index des jours forecast, on affiche la valeur dans les cartes.
        for (i = 0; i < listedttxt.length; i++) {
          todayDatePlain.setDate(todayDatePlain.getDate() + 1);

          cards[i].children[2].textContent =
            Math.trunc(reponse.list[listedttxt[i]].main.temp) + "°C";

          cards[i].children[1].textContent = capitalizeFirstLetter(
            todayDatePlain
              .toLocaleString("fr-fr", { weekday: "long" })
              .slice(0, 3)
          );

          cards[i].children[0].innerHTML = determineSVG(
            reponse.list[listedttxt[i]].weather[0].main
          );
        }
        console.log(listedttxt);
      } else {
        console.log("Un probleme est intervenu.");
      }
    }
    console.log("Météo prochaine actualisée");
  };
}

/////////////// RECUPERATIONS SVG ///////////////
function determineSVG(svgday) {
  let actualsvg = "";

  switch (svgday) {
    default:
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun day-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    case "Clouds":
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cloud day-icon"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>';
      break;
    case "Sun":
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun day-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
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
      actualsvg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun day-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
      break;
  }

  return actualsvg;
}

recupererInfoBasiques();
recupererInfosAPI();
recupererForecastAPI();
