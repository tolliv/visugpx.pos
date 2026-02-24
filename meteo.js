//=======================================================
// CODE Meteo
//=======================================================
let gSeuilPluie = 0.1;      // Valeur fixe
let gSeuilRisquePluie = 1;  // Valeur fixe
let gLatitudeMeteo = 0;
let gLongitudeMeteo = 0;
let gAltitudeMeteo = 0;
let gEmplacementMeteo = "";
let gMeteoMode = "H";
let gModel = "AROME";

//-------------------------------------------------------
// Afficher l'écran scrMeteo
// Affiche le dernier bulletin mémorisé ou en charge un nouveau
//-------------------------------------------------------
async function AfficherEcranMETEO()
{
  pid('TxtMeteoInfos').innerHTML = "";
  pid('TxtMeteo').innerHTML = "";
  pid('scrHome').style.display = 'none';
  pid('scrMeteo').style.display = 'block';
  sleep(100);

  // Toujours le mode Heures par défaut
  ModeHeures();

  // Choix de charger ou non un nouveau bulletin
  let lDoitEtreCharge = false;
  let lDateMeteo = localStorage.getItem('DateBulletin');
  if (lDateMeteo != null)
  {
    const dateStockee = new Date(lDateMeteo);
    const dateActuelle = new Date();
    const differenceEnMs = dateActuelle.getTime() - dateStockee.getTime();
    const differenceEnMinutes = differenceEnMs / (1000 * 60);
    if (differenceEnMinutes >= 5)
      lDoitEtreCharge = true;
  }
  const lConnecte = navigator.onLine;
  if (!lConnecte)
    lDoitEtreCharge = false;

  // Récupère les coordonnées dans le localStorage
  // Ces coordonnées ne contiennent que celles données par le GPS
  gLatitudeMeteo = localStorage.getItem('LatitudeMemo');
  gLongitudeMeteo = localStorage.getItem('LongitudeMemo');
  gEmplacementMeteo = localStorage.getItem('EmplacementMemo');
  gAltitudeMeteo = localStorage.getItem('AltitudeMemo');

  if (lDoitEtreCharge)
    DownloadBulletin(true);   // Charge bulletin plus récent et l'affiche
  else
    DisplayLastBulletin();    // Affiche seulement le bulletin mémorisé
}


//-------------------------------------------------------
// Nouvelle position GPS
// Charge le nouveau bulletin
// Affiche le nouveau bulletin
//-------------------------------------------------------
function ButMeteoGPSNewClick()
{
  pid('TxtMeteoInfos').innerHTML = "";
  pid('TxtMeteo').innerHTML = "";
  GetPositionGPS();   // GetPosition puis Download + Display
}


//-------------------------------------------------------
// Affiche le bulletin mémorisé
// D'après les coordonnées des variables globales
// gLatitudeMeteo, gLongitudeMeteo et gEmplacementMeteo
//-------------------------------------------------------
async function DisplayLastBulletin()
{
  const lBulletin = localStorage.getItem('BulletinMeteo');
  if (lBulletin == null)
  {
    pid('TxtMeteoInfos').innerHTML += "Aucune information.<br>Démarer une géolocalisation avec le bouton GPS+B.<br>";
  }
  else
  {
    // Message d'attente
    pid('TxtMeteoInfos').innerHTML += "Décodage du bulletin ..<br>";
    sleep(0);

    // Reformate au format JSON
    try
    {
      data = JSON.parse(lBulletin)
      DisplayBulletin(data);
    }
    catch (error)
    {
      pid('TxtMeteoInfos').innerHTML += "Erreur pendant le décodage du bulletin !<br>";
    }
  }
}

//-------------------------------------------------------
// Renvoie les différentes valeurs en fonction du modèle
// Met à jour les variables globales communes
// index = heure depuis ce matin 00h
//-------------------------------------------------------
let gSunrise = "erreur";
let gSunset = "erreur";
let gTemperature_2m;
let gApparent_temperature;
let gWeather_code;
let gRelative_humidity_2m;
let gSnowfall;
let gPrecipitation;
let gWind_speed_10m;
let gWind_direction_10m;
let gWind_gusts_10m;
let gPrecipitation_probability;
let gModelUsed = "ERREUR";
function GetMeasures(index)
{
  let lModel = gModel;
  try
  {
    gSunrise = (data.daily.sunrise_ecmwf_ifs[0]).slice(-5);
    gSunset = (data.daily.sunset_ecmwf_ifs[0]).slice(-5);

    //---------- Modèle météo AROME France ----------
    if (lModel == "AROME")
    {
      // En cas de problème, on switch sur ECMWF par défaut
      gTemperature_2m = data.hourly.temperature_2m_meteofrance_arome_france[index];
      if (gTemperature_2m === null)
      {
        lModel = "ECMWF";
      }
      else
      {
        gApparent_temperature = data.hourly.apparent_temperature_meteofrance_arome_france[index];
        gWeather_code = data.hourly.weather_code_meteofrance_arome_france[index];
        gRelative_humidity_2m = data.hourly.relative_humidity_2m_meteofrance_arome_france[index];
        gSnowfall = data.hourly.snowfall_meteofrance_arome_france[index];
        gPrecipitation = data.hourly.precipitation_meteofrance_arome_france[index];
        gWind_speed_10m = data.hourly.wind_speed_10m_meteofrance_arome_france[index];
        gWind_direction_10m = data.hourly.wind_direction_10m_meteofrance_arome_france[index];
        gWind_gusts_10m = data.hourly.wind_gusts_10m_meteofrance_arome_france[index];
        gModelUsed ="AROME";
      }
    }

    //---------- Modèle météo ARPEGE ----------
    if (lModel == "ARPEGE")
    {
      // En cas de problème, on switch sur ECMWF par défaut
      gTemperature_2m = data.hourly.temperature_2m_meteofrance_arpege_europe[index];
      if (gTemperature_2m === null)
      {
        lModel = "ECMWF";
      }
      else
      {
        gApparent_temperature = data.hourly.apparent_temperature_meteofrance_arpege_europe[index];
        gWeather_code = data.hourly.weather_code_meteofrance_arpege_europe[index];
        gRelative_humidity_2m = data.hourly.relative_humidity_2m_meteofrance_arpege_europe[index];
        gSnowfall = data.hourly.snowfall_meteofrance_arpege_europe[index];
        gPrecipitation = data.hourly.precipitation_meteofrance_arpege_europe[index];
        gWind_speed_10m = data.hourly.wind_speed_10m_meteofrance_arpege_europe[index];
        gWind_direction_10m = data.hourly.wind_direction_10m_meteofrance_arpege_europe[index];
        gWind_gusts_10m = data.hourly.wind_gusts_10m_meteofrance_arpege_europe[index];
        gModelUsed ="ARPEGE";
      }
    }

    //---------- Modèle météo ICON ----------
    if (lModel == "ICON")
    {
      // En cas de problème, on switch sur ECMWF par défaut
      gTemperature_2m = data.hourly.temperature_2m_icon_eu[index];
      if (gTemperature_2m === null)
      {
        lModel = "ECMWF";
      }
      else
      {
        gApparent_temperature = data.hourly.apparent_temperature_icon_eu[index];
        gWeather_code = data.hourly.weather_code_icon_eu[index];
        gRelative_humidity_2m = data.hourly.relative_humidity_2m_icon_eu[index];
        gSnowfall = data.hourly.snowfall_icon_eu[index];
        gPrecipitation = data.hourly.precipitation_icon_eu[index];
        gWind_speed_10m = data.hourly.wind_speed_10m_icon_eu[index];
        gWind_direction_10m = data.hourly.wind_direction_10m_icon_eu[index];
        gWind_gusts_10m = data.hourly.wind_gusts_10m_icon_eu[index];
        gModelUsed ="ICON";
      }
    }

    //---------- Modèle météo ECMWF ----------
    if (lModel == "ECMWF")
    {
      // En cas de problème, on switch sur ECMWF par défaut
      gTemperature_2m = data.hourly.temperature_2m_ecmwf_ifs[index];
      if (gTemperature_2m === null)
      {
        lModel = "ERREUR";
      }
      else
      {
        gApparent_temperature = data.hourly.apparent_temperature_ecmwf_ifs[index];
        gWeather_code = data.hourly.weather_code_ecmwf_ifs[index];
        gRelative_humidity_2m = data.hourly.relative_humidity_2m_ecmwf_ifs[index];
        gSnowfall = data.hourly.snowfall_ecmwf_ifs[index];
        gPrecipitation = data.hourly.precipitation_ecmwf_ifs[index];
        gWind_speed_10m = data.hourly.wind_speed_10m_ecmwf_ifs[index];
        gWind_direction_10m = data.hourly.wind_direction_10m_ecmwf_ifs[index];
        gWind_gusts_10m = data.hourly.wind_gusts_10m_ecmwf_ifs[index];
        gModelUsed ="ECMWF";
      }
    }

    // Seule la probalité de précipitation est fournie par ecmwf_ifs
    gPrecipitation_probability = data.hourly.precipitation_probability_ecmwf_ifs[index];
  }
  catch (error)
  {
    lModel = "ERREUR";
  }

  // Valeurs en cas d'erreur sur ECMWF et si une variable n'existe pas
  if (lModel == "ERREUR")
  {
    gTemperature_2m = 0;
    gApparent_temperature = 0;
    gWeather_code = 1000;
    gRelative_humidity_2m = 0;
    gSnowfall = 0;
    gPrecipitation = 0;
    gWind_speed_10m = 0;
    gWind_direction_10m = 0;
    gWind_gusts_10m = 0;
    gPrecipitation_probability = 0;
    gModelUsed ="ERREUR";
  }
}

//-------------------------------------------------------
// Affiche le bulletin passé en paramètre
//-------------------------------------------------------
async function DisplayBulletin(data)
{
  // Defines pour les couleurs
  const RISQUE = "#ADF";
  const SOLEI = "#FA0";
  const NUAGE = "#AAA";
  const PLUIE = "#00F";
  const NEIGE = "#FCF";
  const ORAGE = "#808";
  const BROUI = "#333";
  const WC_SOLEI = "<span style='background-color: "+SOLEI+";'>&nbsp;</span>";
  const WC_NEIGE = "<span style='background-color: "+NEIGE+ ";'>&nbsp;</span>";
  const WC_PLUIE = "<span style='background-color: "+PLUIE+ ";'>&nbsp;</span>";
  const WC_NUAGE = "<span style='background-color: "+NUAGE+ ";'>&nbsp;</span>";
  const WC_ORAGE = "<span style='background-color: "+ORAGE+ ";'>&nbsp;</span>";
  const WC_BROUI = "<span style='background-color: "+BROUI+ ";'>&nbsp;</span>";

  // Date et heure d'aujourd'hui pour les comparaisons
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const lNowDate = day + "/" + month + "/" + year;
  const lNowHours = today.getHours();

  // Date et heure du bulletin
  const lDateHeureBulletin = data.current_weather.time;
  const lDayBulletin = Number(lDateHeureBulletin.substring(8, 10));
  const lMonthBulletin = Number(lDateHeureBulletin.substring(5, 7));
  const lYearBulletin = Number(lDateHeureBulletin.substring(0, 4));
  const lJourLettresBulletin = getDayOfWeek(lDayBulletin, lMonthBulletin, lYearBulletin);
  const lDateFormatee = lJourLettresBulletin + " " + lDateHeureBulletin.substring(8, 10) + "/" + lDateHeureBulletin.substring(5, 7);
  const lHeureBulletin = lDateHeureBulletin.slice(-5);
  const lHeureFormatee = lHeureBulletin.substring(0, 2) + "h" + lHeureBulletin.substring(3, 5);

  // Date des 4 premiers jours seulement
  let lDate = data.hourly.time[0];
  const lHourlyFormatted1 = lDate.substring(8, 10) + "/" + lDate.substring(5, 7) + "/" + lDate.substring(0, 4);
  lDate = data.hourly.time[1*24];
  const lHourlyFormatted2 = lDate.substring(8, 10) + "/" + lDate.substring(5, 7) + "/" + lDate.substring(0, 4);
  lDate = data.hourly.time[2*24];
  const lHourlyFormatted3 = lDate.substring(8, 10) + "/" + lDate.substring(5, 7) + "/" + lDate.substring(0, 4);
  lDate = data.hourly.time[3*24];
  const lHourlyFormatted4 = lDate.substring(8, 10) + "/" + lDate.substring(5, 7) + "/" + lDate.substring(0, 4);

  // Calcul index pour pointeur jour
  let lHourIndex = -1;
  if (lNowDate == lHourlyFormatted1)
    lHourIndex = lNowHours + (0*24);
  if (lNowDate == lHourlyFormatted2)
    lHourIndex = lNowHours + (1*24);
  if (lNowDate == lHourlyFormatted3)
    lHourIndex = lNowHours + (2*24);
  if (lNowDate == lHourlyFormatted4)
    lHourIndex = lNowHours + (3*24);

  // Informations du bulletin pour l'entête
  const lLatitudeBulletin = data.latitude;
  const lLongitudeBulletin = data.longitude;
  const lAltitudeBulletin = Math.round(data.elevation);
  const lEmplacementBulletin = localStorage.getItem("EmplacementBulletin");
  let   lTempResult;
  let   HTMLJ;

  // Affiche la couleur du modèle actuel
  CouleurModele();

  // Récupération les mesures pour sunrise et sunset
  GetMeasures(0);


  // Affichage informations pour ce bulletin
  HTMLJ = "";
  HTMLJ += "<b><span style='font-size:1.1em;'><u>Bulletin du <span style='color: #00f'>" + lDateFormatee + "</span> à <span style='color: #00f'>" + lHeureFormatee + "</span><br></u></b><span>";
  HTMLJ += "<span style='display: inline-block; width:140px;'>&nbsp;Emplacement :</span><span style='color: #000'><b>" + lEmplacementBulletin + "</b> <small>(" + lLatitudeBulletin.toFixed(2) + "," + lLongitudeBulletin.toFixed(2) + ")</small></span><br>";
  HTMLJ += "<span style='display: inline-block; width:140px;'>&nbsp;Altitude :</span><span style='color: #000'>" + lAltitudeBulletin + " m</span><br>";
  HTMLJ += "<span style='display: inline-block; width:140px;'>&nbsp;Lever :</span><span style='color: #000'>" + gSunrise + "</span><br>";
  HTMLJ += "<span style='display: inline-block; width:140px;'>&nbsp;Coucher :</span><span style='color: #000'>" + gSunset + "</span><br>";
  pid('TxtMeteoInfos').innerHTML = HTMLJ;
  HTMLJ = "";

  //========== Boucle sur les données horaires =====================================================
  const lNbJours = pid('TxtNbJours').value;
  for (let i = 0; i < (lNbJours*24); i++)
  {
    //----- Début nouveau jour
    if ((i % 24) == 0)
    {
      // Fin du tableau précédent
      if (i != 0)
      {
        HTMLJ += "</table>";
      }

      // Index des Températures Min et Max de ce jour
      lTempResult = trouverMinMax(i);

      // Cumul neige
      let lCumulSnowfall = 0.0;
      for (let j = 0; j < 24; j++)
      {
        GetMeasures(i+j);
        lCumulSnowfall += parseFloat(gSnowfall);
      }

      // Cumul pluie
      let lCumulRain = 0.0;
      for (let j = 0; j < 24; j++)
      {
        GetMeasures(i+j);
        lCumulRain += parseFloat(gPrecipitation);
      }

      //- Affichage entête d'un nouveau jour -------------------------------------------------------
      const lDate = data.hourly.time[i];
      const lDayHourly = Number(lDate.substring(8, 10));
      const lMonthHourly = Number(lDate.substring(5, 7));
      const lYearHourly = Number(lDate.substring(0, 4));
      const lJourLettresHourly = getDayOfWeek(lDayHourly, lMonthHourly, lYearHourly);
      const lHourlyFormatted = lJourLettresHourly + " " + lDate.substring(8, 10) + "/" + lDate.substring(5, 7);
      GetMeasures(i); // Pour récupérer le modèle météo utilisé
      HTMLJ += "<div style='height: 25px;'></div>";
      HTMLJ += "<b>Prévisions pour le <span style='color: #00f'>" + lHourlyFormatted + "</span></b> <small>(" + gModelUsed + ")</small><br>";
      HTMLJ += "<div style='height: 2px;'></div>";
      HTMLJ += "<b>T</b><small>&nbsp;</small><span style='background-color: #08C;color: #FFF'>&nbsp;" + lTempResult.Tmin.toFixed(0) + "<small> °C</small>&nbsp;</span>";
      HTMLJ += "<span style='background-color: #F00;color: #FFF'>&nbsp;" + lTempResult.Tmax.toFixed(0) + "<small> °C</small>&nbsp;</span>&nbsp;&nbsp;";
      if (lCumulRain > 0)      HTMLJ += "<b>P</b><small>&nbsp;</small><span style='background-color: #00F;color: #FFF'>&nbsp;" + lCumulRain.toFixed(1) + "<small> mm</small>&nbsp;</span>&nbsp;";
      else                     HTMLJ += "<b>P</b><small>&nbsp;</small><span style='background-color: #FFF;color: #000'> 0<small> mm</small>&nbsp;</span>&nbsp;";
      if (lCumulSnowfall > 0)  HTMLJ += "<b>N</b><small>&nbsp;</small><span style='background-color: #FCF'>&nbsp;" + lCumulSnowfall.toFixed(1) + "<small> cm</small>&nbsp;</span>";
      HTMLJ += "<br><div style='height: 4px;'></div>";
      HTMLJ += "<table class='TableMeteoJours'>";
      HTMLJ += "<tr>";
      HTMLJ += "<td class='TH'><b>HR</b><br>h</td>";
      HTMLJ += "<td class='TH'><b>Ciel</b><br>-</td>";
      HTMLJ += "<td class='TH'><b>T</b><br>°C</td>";
      HTMLJ += "<td class='TH'><b>Tres</b><br>°C</td>";
      HTMLJ += "<td class='TH'><b>Hum</b><br>%</td>";
      HTMLJ += "<td class='TH-DOUBLE'><b>Préci.</b><br>-</td>";
      HTMLJ += "<td class='TH'><b>Vent</b><br>km/h</td>";
      HTMLJ += "<td class='TH'><b>Dir</b><br>-</td>";
      HTMLJ += "<td class='TH'><b>Raf</b><br>km/h</td>";
      HTMLJ += "</tr>";
    }

    // Récupération des measures, les valeurs sont dans les variables globales
    GetMeasures(i);
    const lWeatherCode = gWeather_code;
    const lTempApparente = Math.round(gApparent_temperature);
    const lTempReelle = Math.round(gTemperature_2m);
    const lHumidite = gRelative_humidity_2m;
    let   lProbRain = gPrecipitation_probability;
    const lRain = gPrecipitation.toFixed(1);
    const lSnowfall = gSnowfall.toFixed(1);
    const lVitesseVent = Math.round(gWind_speed_10m);
    const lDirectionVent = ConversionDirection(gWind_direction_10m);
    const lGustsVent = Math.round(gWind_gusts_10m);

    //- Heure ------------------------------------------------
    HTMLJ += "<tr>";
    const lHeure = (data.hourly.time[i].slice(-5)).substring(0, 2) + "h";
    if (i == lHourIndex)
      HTMLJ += "<td class='TH' style='background-color: #cfc';>"+ lHeure + "</td>";
    else
      HTMLJ += "<td class='TH'>"+ lHeure + "</td>";

    //- Weather code️ -----------------------------------------
    /*  0☀️ Ciel dégagé
        1🌤️, 2⛅, 3☁️ Principalement dégagé, partiellement nuageux et couvert
        45☁️, 48☁️ Brouillard et brouillard givrant
        51🌧️, 53🌧️, 55🌧️ Bruine : légère, modérée et dense
        56🌧️, 57🌧️ Bruine verglaçante : légère et dense
        61🌧️, 63🌧️, 65🌧️ Pluie : faible, modérée et forte
        66🌧️, 67🌧️ Pluie verglaçante : faible et forte
        71❄️, 73❄️, 75❄️ Chutes de neige : faibles, modérées et forte
        77❄️ Neige en grains
        80🌧️, 81🌧️, 82🌧️ Averses de pluie : faibles, modérées et violentes
        85❄️, 86❄️ Averses de neige : faibles et fortes
        95🌩️* Orage : faible ou modéré
        96🌩️, 99🌩️* Orage avec grêle faible et forte  */
    let lWeatherCodeText = "";
    switch(lWeatherCode)
    {
      case 0:  lWeatherCodeText = WC_SOLEI + WC_SOLEI + WC_SOLEI;  break;
      case 1:  lWeatherCodeText = WC_SOLEI + WC_SOLEI + WC_NUAGE;  break;
      case 2:  lWeatherCodeText = WC_SOLEI + WC_NUAGE + WC_NUAGE;  break;
      case 3:  lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_NUAGE;  break;
      case 45: lWeatherCodeText = WC_BROUI + WC_BROUI + WC_BROUI;  break;
      case 48: lWeatherCodeText = WC_BROUI + WC_BROUI + WC_BROUI;  break;
      case 51: lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_PLUIE;  break;
      case 53: lWeatherCodeText = WC_NUAGE + WC_PLUIE + WC_PLUIE;  break;
      case 55: lWeatherCodeText = WC_PLUIE + WC_PLUIE + WC_PLUIE;  break;
      case 56: lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_PLUIE;  break;
      case 57: lWeatherCodeText = WC_NUAGE + WC_PLUIE + WC_PLUIE;  break;
      case 61: lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_PLUIE;  break;
      case 63: lWeatherCodeText = WC_NUAGE + WC_PLUIE + WC_PLUIE;  break;
      case 65: lWeatherCodeText = WC_PLUIE + WC_PLUIE + WC_PLUIE;  break;
      case 66: lWeatherCodeText = WC_NUAGE + WC_PLUIE + WC_PLUIE;  break;
      case 67: lWeatherCodeText = WC_PLUIE + WC_PLUIE + WC_PLUIE;  break;
      case 71: lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_NEIGE;  break;
      case 73: lWeatherCodeText = WC_NUAGE + WC_NEIGE + WC_NEIGE;  break;
      case 75: lWeatherCodeText = WC_NEIGE + WC_NEIGE + WC_NEIGE;  break;
      case 77: lWeatherCodeText = WC_NEIGE + WC_NEIGE + WC_NEIGE;  break;
      case 80: lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_PLUIE;  break;
      case 81: lWeatherCodeText = WC_NUAGE + WC_PLUIE + WC_PLUIE;  break;
      case 82: lWeatherCodeText = WC_PLUIE + WC_PLUIE + WC_PLUIE;  break;
      case 85: lWeatherCodeText = WC_NUAGE + WC_NEIGE + WC_NEIGE;  break;
      case 86: lWeatherCodeText = WC_NEIGE + WC_NEIGE + WC_NEIGE;  break;
      case 95: lWeatherCodeText = WC_NUAGE + WC_NUAGE + WC_ORAGE;  break;
      case 96: lWeatherCodeText = WC_NUAGE + WC_ORAGE + WC_ORAGE;  break;
      case 99: lWeatherCodeText = WC_ORAGE + WC_ORAGE + WC_ORAGE;  break;
      default: lWeatherCodeText = "???"; break;
    }

    // Affichage
    lWeatherToBeDisplayed = lWeatherCodeText;
    if (i == lHourIndex)
      HTMLJ += "<td class='CIELHR'>" + lWeatherToBeDisplayed + "</td>";
    else
      HTMLJ += "<td class='CIEL'>" + lWeatherToBeDisplayed + "</td>";

    // Température réelle
    if (i == lTempResult.Imin)
      HTMLJ += "<td class='CY';'>" + lTempReelle + "</td>";
    else if (i == lTempResult.Imax)
      HTMLJ += "<td class='RG'>" + lTempReelle + "</span>";
    else if (i == lHourIndex)
      HTMLJ += "<td class='HR'>" + lTempReelle + "</td>";
    else
      HTMLJ += "<td class='NR'>" + lTempReelle + "</td>";

    // Température Apparente
    if (i == lHourIndex)
      HTMLJ += "<td class='HR'>" + lTempApparente + "</td>";
    else
      HTMLJ += "<td class='NR'>" + lTempApparente + "</td>";

    // Humidité
    if (i == lHourIndex)
      HTMLJ += "<td class='HR'>" + lHumidite + "</td>";
    else
      HTMLJ += "<td class='NR'>" + lHumidite + "</td>";

    // Colonne Précipitations, Pluie, Neige
    do
    {
      // Pluie annoncée
      if (lRain > 0)
      {
         HTMLJ += "<td class='BF'>" + lRain + "<small> mm</small></td>";
         break;
      }

      // Probabilité de précipitation
      if (lProbRain > 0)
      {
        HTMLJ += "<td class='BC'>" + lProbRain + "<small> %</small></td>";
        break;
      }

      // Pas de pluie, pas de probabilité
      if (i == lHourIndex)
        HTMLJ += "<td class='HR'>" + 0 + "</td>";
      else
        HTMLJ += "<td class='NR'>" + 0 + "</td>";
    } while (0);

    // Vitesse du vent
    if (lVitesseVent >= gSeuilVent)
        HTMLJ += "<td class='VT'>" + lVitesseVent + "</td>";
    else if (i == lHourIndex)
      HTMLJ += "<td class='HR'>" + lVitesseVent + "</td>";
    else
      HTMLJ += "<td class='NR'>" + lVitesseVent + "</td>";

    // Direction du vent
    if (i == lHourIndex)
      HTMLJ += "<td class='HR'>" + lDirectionVent + "</td>";
    else
      HTMLJ += "<td class='NR'>"  + lDirectionVent + "</td>";

    // Gusts du vent
    if (lGustsVent >= gSeuilVent)
        HTMLJ += "<td class='VT'>" + lGustsVent + "</td>";
    else if (i == lHourIndex)
      HTMLJ += "<td class='HR'>" + lGustsVent + "</td>";
    else
      HTMLJ += "<td class='NR'>" + lGustsVent + "</td>";

    // Fin de ligne
    HTMLJ += "</tr>";
  }

  // Fin du tableau
  HTMLJ += "</table>";

  // Affichage des légendes
  HTMLJ += "<br><b>Légendes</b><br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;HR</b></span> Heure<br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;Ciel</b></span> Etat du ciel (mélange de ces couleurs)<br>";
  HTMLJ += "&nbsp;&nbsp;&nbsp;<span style='display: inline-block; width:50px;'><span style='font-family: monospace;background-color: "+SOLEI+";'>&nbsp;&nbsp;</span></span><small>Dégagé</small><br>";
  HTMLJ += "<div style='height: 2px;'></div>";
  HTMLJ += "&nbsp;&nbsp;&nbsp;<span style='display: inline-block; width:50px;'><span style='font-family: monospace;background-color: "+NUAGE+";'>&nbsp;&nbsp;</span></span><small>Nuageux</small><br>";
  HTMLJ += "<div style='height: 2px;'></div>";
  HTMLJ += "&nbsp;&nbsp;&nbsp;<span style='display: inline-block; width:50px;'><span style='font-family: monospace;background-color: "+BROUI+";'>&nbsp;&nbsp;</span></span><small>Brouillard</small><br>";
  HTMLJ += "<div style='height: 2px;'></div>";
  HTMLJ += "&nbsp;&nbsp;&nbsp;<span style='display: inline-block; width:50px;'><span style='font-family: monospace;background-color: "+PLUIE+";'>&nbsp;&nbsp;</span></span><small>Pluie</small><br>";
  HTMLJ += "<div style='height: 2px;'></div>";
  HTMLJ += "&nbsp;&nbsp;&nbsp;<span style='display: inline-block; width:50px;'><span style='font-family: monospace;background-color: "+ORAGE+";'>&nbsp;&nbsp;</span></span><small>Orage</small><br>";
  HTMLJ += "<div style='height: 2px;'></div>";
  HTMLJ += "&nbsp;&nbsp;&nbsp;<span style='display: inline-block; width:50px;'><span style='font-family: monospace;background-color: "+NEIGE+";'>&nbsp;&nbsp;</span></span><small>Neige</small><br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;T</b></span> Température réelle<br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;Tres</b></span> Température ressentie<br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;Hum</b></span> Humidité<br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;Préci.</b></span> Précipitations et risque (pluie, neige)<br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;Vent</b></span> Vent et direction<br>";
  HTMLJ += "<span style='display: inline-block; width:50px;'><b>&nbsp;Dir</b></span> Direction du vent<br>";
  pid('TxtMeteo').innerHTML = HTMLJ;

  //================================================================================================
  // Création de la page Résumé jour par jour
  HTMLJ = "";
  HTMLJ += "<div style='height: 25px;'></div>";
  HTMLJ += "<b>Prévision des prochains jours<b><br>";
  HTMLJ += "<div style='height: 5px;'></div>";
  HTMLJ += "<table class='TableMeteoSemaine'>";

  // Entête
  HTMLJ += "<tr>";
  HTMLJ += "<td class='RH' style='width: 10%;'><b>J</b></td>";
  HTMLJ += "<td class='RH' style='width: 18%;'><b>T</b></td>";
  HTMLJ += "<td class='RH' style='width: 20%;'><b>00-06</b></td>";
  HTMLJ += "<td class='RH' style='width: 20%;'><b>06-12</b></td>";
  HTMLJ += "<td class='RH' style='width: 20%;'><b>12-18</b></td>";
  HTMLJ += "<td class='RH' style='width: 20%;'><b>18-24</b></td>";
  HTMLJ += "<td class='RH' style='width: 13%;'><b>P</b></td>";
  HTMLJ += "<td class='RH' style='width: 10%;'><b>V</b></td>";
  HTMLJ += "</tr>";

  //----- Boucle sur les jours---------------------------------
  // Jour du bulletin
  let lJour2lettres = lJourLettresBulletin.substring(0, 2);
  for (let i = 0; i < 14; i++)
  {
    // Calculs pour ce jour
    let lTempMin = +999;
    let lTempMax = -999;
    let lCumulPluie = 0;
    let lMaxVent = 0;

    // Boucle sur les heures
    for (let j = 0; j < 24; j++)
    {
      GetMeasures(i*24 + j);

      // Température min
      if (gTemperature_2m < lTempMin)
        lTempMin = gTemperature_2m;

      // Température max
      if (gTemperature_2m > lTempMax)
        lTempMax = gTemperature_2m;

      // Pluie
      lCumulPluie += gPrecipitation;

      // Vent
      if (gWind_speed_10m > lMaxVent)
        lMaxVent = gWind_speed_10m;
    }

    // Calculs Weather
    // Boucle sur les quarts de cette journée journée
    let lWeather0_6 = 0;
    let lWeather6_12 = 0;
    let lWeather12_18 = 0;
    let lWeather18_24 = 0;
    for (let lQuart = 0; lQuart < 4; lQuart++)
    {
      let lSoleil = 0;
      let lNuage = 0;
      let lPluie = 0;
      let lNeige = 0;
      let lOrage = 0;
      let lBrouillard = 0;

      // Boucle sur 6 heures
      const lWeatherCodeTextDebut = "<td class='CIEL'>";
      const lWeatherCodeTextFin = "</td>";
      let lWeatherCodeText = "";
      for (let j = 0; j < 6; j++)
      {
        GetMeasures(i*24 + lQuart*6 + j);
        switch(gWeather_code)
        {
          case 0:  lWeatherCodeText += WC_SOLEI;  break;
          case 1:  lWeatherCodeText += WC_SOLEI;  break;
          case 2:  lWeatherCodeText += WC_NUAGE;  break;
          case 3:  lWeatherCodeText += WC_NUAGE;  break;
          case 45: lWeatherCodeText += WC_BROUI;  break;
          case 48: lWeatherCodeText += WC_BROUI;  break;
          case 51: lWeatherCodeText += WC_PLUIE;  break;
          case 53: lWeatherCodeText += WC_PLUIE;  break;
          case 55: lWeatherCodeText += WC_PLUIE;  break;
          case 56: lWeatherCodeText += WC_PLUIE;  break;
          case 57: lWeatherCodeText += WC_PLUIE;  break;
          case 61: lWeatherCodeText += WC_PLUIE;  break;
          case 63: lWeatherCodeText += WC_PLUIE;  break;
          case 65: lWeatherCodeText += WC_PLUIE;  break;
          case 66: lWeatherCodeText += WC_PLUIE;  break;
          case 67: lWeatherCodeText += WC_PLUIE;  break;
          case 71: lWeatherCodeText += WC_NEIGE;  break;
          case 73: lWeatherCodeText += WC_NEIGE;  break;
          case 75: lWeatherCodeText += WC_NEIGE;  break;
          case 77: lWeatherCodeText += WC_NEIGE;  break;
          case 80: lWeatherCodeText += WC_PLUIE;  break;
          case 81: lWeatherCodeText += WC_PLUIE;  break;
          case 82: lWeatherCodeText += WC_PLUIE;  break;
          case 85: lWeatherCodeText += WC_NEIGE;  break;
          case 86: lWeatherCodeText += WC_NEIGE;  break;
          case 95: lWeatherCodeText += WC_ORAGE;  break;
          case 96: lWeatherCodeText += WC_ORAGE;  break;
          case 99: lWeatherCodeText += WC_ORAGE;  break;
          default: lWeatherCodeText += "?";       break;
        }
      }
      lWeatherCodeText = lWeatherCodeTextDebut + lWeatherCodeText + lWeatherCodeTextFin;

      // Weather code pour ce quart de journée
      if (lQuart == 0)
        lWeather0_6 = lWeatherCodeText;
      else if (lQuart == 1)
        lWeather6_12 = lWeatherCodeText;
      else if (lQuart == 2)
        lWeather12_18 = lWeatherCodeText;
      else if (lQuart == 3)
        lWeather18_24 = lWeatherCodeText;
    }

    // Nouvelle ligne
    HTMLJ += "<tr>";

    // Jour
    if (lJour2lettres == "Sa" || lJour2lettres == "Di")
      HTMLJ += "<td class='RCOL1' style='color: red;'><b>" + lJour2lettres + "</span></b></td>";
    else
      HTMLJ += "<td class='RCOL1'><b>" + lJour2lettres + "</b></td>";

    // Températures Min et Max
    HTMLJ += "<td class='RCOL2'>";
    HTMLJ += "<span style='color: #00F'>" + lTempMin.toFixed(0)+"&nbsp;&nbsp;</span>";
    HTMLJ += "<span style='color: #F00'>" + lTempMax.toFixed(0)+"</span>";
    HTMLJ += "</td>";

    // 00-06h
    HTMLJ += lWeather0_6;

    // 06-12h
    HTMLJ += lWeather6_12;

    // 12-18h
    HTMLJ += lWeather12_18;

    // 18-24h
    HTMLJ += lWeather18_24;

    // Pluie
    if (lCumulPluie >= 20)
      HTMLJ += "<td class='BTF'>";
    else if (lCumulPluie > 0)
      HTMLJ += "<td class='BF'>";
    else
      HTMLJ += "<td class='RN'>";
    HTMLJ += lCumulPluie.toFixed(1);
    HTMLJ += "</td>";

    // Vent
    if (lMaxVent > gSeuilVent)
      HTMLJ += "<td class='VT'>";
    else
      HTMLJ += "<td class='RN'>";
    HTMLJ += lMaxVent.toFixed(0);
    HTMLJ += "</td>";

    // Fin de ligne
    HTMLJ += "</tr>";

    // Jour suivant
    switch (lJour2lettres)
    {
      case "Di": lJour2lettres = "Lu"; break;
      case "Lu": lJour2lettres = "Ma"; break;
      case "Ma": lJour2lettres = "Me"; break;
      case "Me": lJour2lettres = "Je"; break;
      case "Je": lJour2lettres = "Ve"; break;
      case "Ve": lJour2lettres = "Sa"; break;
      case "Sa": lJour2lettres = "Di"; break;
    }
  }
  HTMLJ += "</table>";
  pid('TxtResume').innerHTML = HTMLJ;

  // Tout le traitement est fini, on peut afficher la page
  if (gMeteoMode == "H")
    ModeHeures();
  if (gMeteoMode == "J")
    ModeJours();

  // Pour le debug, on peut afficher directement le mode Jours
  // ModeJours();
}

//-------------------------------------------------------
// Min et Max dans les températures
//-------------------------------------------------------
function trouverMinMax(debut)
{
  let lMin = +999;
  let lMax = -999;
  let lIndexMin = 0;
  let lIndexMax = 0;
  for (let i = debut; i < (debut + 24); i++)
  {
    GetMeasures(i);
    const l = gTemperature_2m;
    if (l < lMin)
    {
      lMin = l;
      lIndexMin = i;
    }
    if (l> lMax)
    {
      lMax = l;
      lIndexMax = i;
    }
  }
  return ({
    Imin: lIndexMin,
    Imax: lIndexMax,
    Tmin: lMin,
    Tmax: lMax
  })
}

//-------------------------------------------------------
// Conversion direction du vent
//-------------------------------------------------------
function ConversionDirection(pDegres)
{
    const lPointsCardinaux =
    ["⬇️","↙️","⬅️","↖️","⬆️","↗️","➡️","↘️","⬇️"];

    // Chaque secteur fait 45 degrés. On décale de 11.25 pour centrer.
    pDegres = (parseFloat(pDegres) % 360 + 360) % 360;
    const lIndex = Math.round(pDegres / 45) % 16;
    return ("<span>" + lPointsCardinaux[lIndex]) + "</span>";
}

//-------------------------------------------------------
// Interrogation depuis OpenMeteo
// Utilise les variables gLatitudeMeteo, gLongitudeMeteo et gEmplacementMeteo
//-------------------------------------------------------
async function DownloadBulletin(pToDisplay)
{
  let lConnecte = navigator.onLine;
  if (!lConnecte)
  {
    pid('TxtMeteo').innerHTML += "Pas de connexion réseau<br>";
    return;
  }

  pid('TxtMeteoInfos').innerHTML += "Chargement du nouveau bulletin .. <br>";

  let url = "https://api.open-meteo.com/v1/forecast?";
  url += "latitude=" + gLatitudeMeteo.toString() + "&";
  url += "longitude=" + gLongitudeMeteo.toString() + "&";
  url += "timezone=";
  url +=    "auto" + "&";
  url += "current_weather=";
  url +=    "true" + "&";
  url += "models=";
  url +=    "meteofrance_arome_france" + ",";
  url +=    "meteofrance_arpege_europe" + ",";
  url +=    "icon_eu" + ",";
  url +=    "ecmwf_ifs" + "&";
  url += "daily=";
  url +=    "sunrise" + ",";
  url +=    "sunset" + "&";
  url += "hourly=";
  url +=    "temperature_2m" + ",";
  url +=    "apparent_temperature" + ",";
  url +=    "relative_humidity_2m" + ",";
  url +=    "precipitation" + ",";
  url +=    "precipitation_probability" + ",";
  url +=    "wind_speed_10m" + ",";
  url +=    "wind_direction_10m" + ",";
  url +=    "wind_gusts_10m" + ",";
  url +=    "weather_code" + ","
  url +=    "snowfall" + "&";
  url += "forecast_days=";
  url +=    "15" + "&";
  url += "cacheBuster=";
  url +=    new Date().getTime();

  try
  {
    const response = await fetch(url,
    {
      method: 'GET',
      mode: 'cors'
    });
    if (!response.ok)
    {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Convertir l'objet en chaîne JSON pour le sauvegarder dans localStorage
    const data = await response.json();
    localStorage.setItem('BulletinMeteo', JSON.stringify(data));
    const dateActuelle = new Date();
    localStorage.setItem('DateBulletin', dateActuelle.toISOString());
    localStorage.setItem('EmplacementBulletin', gEmplacementMeteo);

//----- A conserver pour debug -----
//    console.log("Données météo :", data);
//----- A conserver pour debug -----

    pid('TxtMeteo').innerHTML += "Chargement du nouveau bulletin <b>Réussi</b><br>";

    // Affichage du bulletin une fois que tout est mémorisé, si demandé
    if (pToDisplay)
      DisplayLastBulletin();
  }
  catch (error)
  {
    pid('TxtMeteo').innerHTML += "Erreur lors de la récupération des données.<br>";
    console.error("Erreur downloadBulletin");
  }
}

//-------------------------------------------------------
// Fermeture de cet écran
//-------------------------------------------------------
function ButMeteoRetourClick()
{
    pid('scrMeteo').style.display = 'none';
    AfficherEcranHOME();
}

//-------------------------------------------------------
// Calcul de la distance entre deux points GPS
//-------------------------------------------------------
function haversineDistance(lat1, lon1, lat2, lon2)
{
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (lat2 - lat1) * Math.PI / 180;  // Différence de latitude en radians
  const dLon = (lon2 - lon1) * Math.PI / 180;  // Différence de longitude en radians
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en kilomètres
  return distance;
}


//-------------------------------------------------------
// Jour d'une date (attention le mois commence à 0)
//-------------------------------------------------------
function getDayOfWeek(day, month, year)
{
  const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const date = new Date(year, month-1, day);
  const dayIndex = date.getDay();
  return(daysOfWeek[dayIndex]);
}

//-------------------------------------------------------
// Récupération de la position GPS
//-------------------------------------------------------
async function GetPositionGPS()
{
  // Lancement géolocalisation, l'arrêt est automatique
  pid('TxtMeteo').innerHTML = "Géolocalisation à 500m près .. <br>";
  await sleep(0);

  GeolocalisationWatch(500);        // Précision demandée <= 500m

  // Boucle d'attente de la fin
  let lTimeout = pid('TxtTempsMaxLocalisation').value * 10; // Car tempo de 100ms
  do
  {
    // Période vérification de l'état
    await sleep(100);
    const lStatus = gGeoStatus;

    // Si nouvelle position valide, on l'affiche
    if (lStatus > 1)
    {
      pid('TxtMeteo').innerHTML  = "Géolocalisation ..<br>";
      pid('TxtMeteo').innerHTML += "Précision = " + gGeoAccuracy + "m<br>";
    }

    // Limitation temps
    lTimeout--;
    if (lTimeout <= 0)
    {
      gGeoStatus = -3;
      break;
    }
  } while (gGeoStatus > 0); // Sortie si précision atteinte ou Erreur

  // Géolocalisation réussie
  if (gGeoStatus == 0)
  {
    pid('TxtMeteo').innerHTML  += "Géolocalisation <b>Réussie</b><br>";

    // Mémorisation
    localStorage.setItem('LatitudeMemo', gGeoLatitude);
    localStorage.setItem('LongitudeMemo', gGeoLongitude);
    localStorage.setItem('EmplacementMemo', "📡GPS");
    localStorage.setItem('AltitudeMemo', gGeoAltitude);
    localStorage.setItem('AccuracyMemo', gGeoAccuracy);
    gLatitudeMeteo = gGeoLatitude;
    gLongitudeMeteo = gGeoLongitude;
    gEmplacementMeteo = "📡GPS";
    DownloadBulletin(true);
  }

  // Géolocalisation échouée
  else
  {
    pid('TxtMeteo').innerHTML += "Erreur : ";
    if (gGeoStatus == -1)   pid('TxtMeteo').innerHTML += "géolocalisation non supportée.<br>";
    if (gGeoStatus == -2)   pid('TxtMeteo').innerHTML += "permission refusée.<br>";
    if (gGeoStatus == -3)   pid('TxtMeteo').innerHTML += "précision insuffisante<br>";
  }
}

//-------------------------------------------------------
// Switch sur le type de Météo (Heures/Jours)
//-------------------------------------------------------
function ModeHeures() // On prépare le bouton pour afficher Jours
{
  gMeteoMode = "H";
  pid('TxtMeteo').style.display = 'block';
  pid('TxtResume').style.display = 'none';
  pid('BoutonHeures').style.backgroundColor = '#AEF';
  pid('BoutonJours').style.backgroundColor = '#FFF';
}
function ModeJours() // On prépare le bouton pour afficher Heures
{
  gMeteoMode = "J";
  pid('TxtMeteo').style.display = 'none';
  pid('TxtResume').style.display = 'block';
  pid('BoutonHeures').style.backgroundColor = '#FFF';
  pid('BoutonJours').style.backgroundColor = '#AEF';
}
function ButMeteoHeuresJoursClick()
{
  // On est en mode Heures, on passe en mode Jours
  if (gMeteoMode == "H")
    ModeJours();

  // On est en mode Jours, on passe en mode Heures
  else
    ModeHeures();
}

//-------------------------------------------------------
// Affichage de la liste pour une sélection
//-------------------------------------------------------
function ButChoixEmplacementClick()
{
  AfficheEcranChoixEmplacement();
}


//-------------------------------------------------------
// Couleur du bouton modèle météo
//-------------------------------------------------------
function CouleurModele()
{
  pid('ButMeteoAROME').style.backgroundColor  = (gModel == "AROME"?"#AFA":"#FFF");
  pid('ButMeteoARPEGE').style.backgroundColor = (gModel == "ARPEGE"?"#AFA":"#FFF");
  pid('ButMeteoICON').style.backgroundColor   = (gModel == "ICON"?"#AFA":"#FFF");
  pid('ButMeteoECMWF').style.backgroundColor  = (gModel == "ECMWF"?"#AFA":"#FFF");
}

//-------------------------------------------------------
// Choix du modèle météo
//-------------------------------------------------------
function ButMeteoAROMEClick()
{
  if (gModel != "AROME")
  {
    gModel = "AROME";
    DisplayLastBulletin();
  }
}
function ButMeteoARPEGEClick()
{
  if (gModel != "ARPEGE")
  {
    gModel = "ARPEGE";
    DisplayLastBulletin();
  }
}
function ButMeteoICONClick()
{
  if (gModel != "ICON")
  {
    gModel = "ICON";
    DisplayLastBulletin();
  }
}
function ButMeteoECMWFClick()
{
  if (gModel != "ECMWF")
  {
    gModel = "ECMWF";
    DisplayLastBulletin();
  }
}