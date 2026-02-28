//==================================================================================================
// Partie Choix d'un emplacement
//==================================================================================================
let HTMLJ = "";

//-------------------------------------------------------
// Affiche l'écran pour le choix de l'emplacement
//-------------------------------------------------------
function AfficheEcranChoixEmplacement()
{
  pid('scrMeteo').style.display = 'none';
  CreeListeEmplacements(0);
  pid('DivChoixEmplacement').innerHTML = HTMLJ;
  pid('scrChoixEmplacement').style.display = 'block';
}

//-------------------------------------------------------
// Retour à l'écran météo
//-------------------------------------------------------
function ButChoixEmplacementRetourClick()
{
  pid('scrChoixEmplacement').style.display = 'none';
  pid('scrMeteo').style.display = 'block';
}


//-------------------------------------------------------
// Sélection d'un emplacement dans la liste
//-------------------------------------------------------
function SelectionnerEmplacement(nom, lat, lon)
{
  // Mémorisation dans les paramètres globaux
  gEmplacementMeteo = nom;
  gLatitudeMeteo = lat;
  gLongitudeMeteo = lon;

  // Efface les autres écrans pour montrer la prise en compte
  pid('scrChoixEmplacement').style.display = 'none';
  pid('TxtMeteoInfos').innerHTML = "";
  pid('TxtMeteo').innerHTML = "";
  pid('TxtResume').innerHTML = "";

  // Download le bulletin et l'affiche
  DownloadBulletin(true);
  pid('scrMeteo').style.display = 'block';
}



//==================================================================================================
// Partie Commune aux 2
//==================================================================================================


//-------------------------------------------------------
// Création d'une liste d'emplacements
// choix=0 pour une sélection (cliquable)
// choix=1 pour la gestion (non cliquable)
//-------------------------------------------------------
function CreeListeEmplacements(choix)
{
  // Récupération de la liste stockée
  let lListeEmplacementsJSON = localStorage.getItem("ListeEmplacements");
  let lListeEmplacements = [];

  // Si elle existe, conversion en tableau
  if (lListeEmplacementsJSON !== null)
  {
      lListeEmplacements = JSON.parse(lListeEmplacementsJSON);
  }

  HTMLJ = "";

  if (choix==0)
  {
    HTMLJ += "<b>Cliquer sur un emplacement pré-enregistré</b><br>";
  }
  HTMLJ += "<div style='height: 6px;'></div>";

  // Coordonnées GPS mémorisées uniquement pour un choix
  if (choix==0)
  {
    gLatitudeMeteo = localStorage.getItem('LatitudeMemo');
    gLongitudeMeteo = localStorage.getItem('LongitudeMemo');
    HTMLJ += "<div ";
    if (choix==0)
      HTMLJ += "onclick='SelectionnerEmplacement(\"📡GPS\"," + gLatitudeMeteo + "," + gLongitudeMeteo + ")' ";
    HTMLJ += "class='Emplacement' ";
    HTMLJ += "style='background: #F0F0FF;'>";
    HTMLJ += "📡<b> " + "GPS" + "</b> <small>(" + gLatitudeMeteo + "," + gLongitudeMeteo + ")</small>";
    HTMLJ += "</div>";
    HTMLJ += "<div style='height: 2px;'></div>";
  }

  // Création de la liste cliquable (si choix=0)
  lListeEmplacements.forEach((emplacement, index) =>
  {
    HTMLJ += "<div style='display: flex; align-items: center; margin-bottom: 2px;'>";

    // Zone du nom (cliquable pour sélectionner)
    HTMLJ += "<div ";
    if (choix==0)
      HTMLJ += "onclick='SelectionnerEmplacement(\"" + emplacement.nom + "\"," + emplacement.lat + "," + emplacement.lon + ")' ";
    HTMLJ += "class='Emplacement' style='background: #EFE; flex-grow: 1;'>";
    HTMLJ += "<b> " + emplacement.nom + "</b> <small>(" + emplacement.lat + "," + emplacement.lon + ")</small>";
    HTMLJ += "</div>";

    if (choix==1)
    {
      HTMLJ += "  <div class='ButDelEmplacement' style='background:#ddd; color:black;' onclick='DeplacerEmplacementHaut(" + index + ")'>▲</div>";
      HTMLJ += "  <div class='ButDelEmplacement' style='background:#ddd; color:black;' onclick='DeplacerEmplacementBas(" + index + ")'>▼</div>";
      HTMLJ += "  <div class='ButDelEmplacement' onclick='SupprimerEmplacement(" + index + ")'>-</div>";
    }

    HTMLJ += "</div>";
  });

  if (choix==1)
  {
    // Ajout d'un champ de saisie
    HTMLJ += "<div style='height: 30px;'></div>";
    HTMLJ += "<b>Ajouter un nouvel emplacement</b>";
    HTMLJ += "<div style='height: 4px;'></div>";
    HTMLJ += "<div>";
    HTMLJ += "  <input type='text' class='InputEmplacement' id='NewNom' placeholder='Paris Tour Eiffel'>";
    HTMLJ += "  <input type='text' class='InputEmplacement' id='NewLatLon' placeholder='48.8583, 2.2944'> ";
    HTMLJ += "  <button class='ButAddEmplacement' onclick='AjouterNouvelEmplacement()'>+</button>";
    HTMLJ += "</div>";
  }
}



//==================================================================================================
// Partie Gestion des emplacements
//==================================================================================================


//-------------------------------------------------------
// Affichage d'une liste d'emplacements
//-------------------------------------------------------
function AfficheEcranGestionEmplacements()
{
  pid('scrHome').style.display = 'none';
  pid('scrChoixEmplacement').style.display = 'none';
  pid('scrGestionEmplacements').style.display = 'block';
  CreeTexteEmplacements();
}

//-------------------------------------------------------
// Création d'une liste d'emplacements au format Texte
// compatible zone-area
//-------------------------------------------------------
function CreeTexteEmplacements()
{
  let lTXT = "";

  // Récupération de la liste stockée
  let lListeEmplacementsJSON = localStorage.getItem("ListeEmplacements");
  let lListeEmplacements = [];

  // Si elle existe, conversion en tableau
  if (lListeEmplacementsJSON !== null)
  {
      lListeEmplacements = JSON.parse(lListeEmplacementsJSON);
  }

  // Texte emplacement par emplacement
  lListeEmplacements.forEach((emplacement, index) =>
  {
    lTXT += emplacement.nom + " : " + emplacement.lat + ", " + emplacement.lon + "\r\n";
  });

  pid('TxtEmplacements').value = lTXT;
}

//-------------------------------------------------------
// Annulation des modifications, fermeture de cet écran
//-------------------------------------------------------
function ButGestionEmplacementsAnnulerClick()
{
  pid('scrGestionEmplacements').style.display = 'none';
  AfficheEcranChoixEmplacement();
}


//-------------------------------------------------------
// Analyse le texte de la zone de saisie pour créer
// le tableau d'objets lListeEmplacements
//-------------------------------------------------------
function AnalyseTexteVersTableau()
{
  let lTXT = pid('TxtEmplacements').value;
  let lListeEmplacements = [];

  // On sépare le texte par ligne
  let lignes = lTXT.split(/\r?\n/);

  lignes.forEach(ligne => {
    // On vérifie que la ligne n'est pas vide
    if (ligne.trim() !== "") {
      // Format attendu : "Nom : Lat, Lon"
      // On sépare d'abord le nom du reste par le ":"
      let parties = ligne.split(':');

      if (parties.length >= 2) {
        let nom = parties[0].trim();

        // On sépare ensuite la latitude et la longitude par la ","
        let coords = parties[1].split(',');

        if (coords.length >= 2) {
          let lat = parseFloat(coords[0].trim());
          let lon = parseFloat(coords[1].trim());

          // Ajout à la liste si les nombres sont valides
          if (!isNaN(lat) && !isNaN(lon)) {
            lListeEmplacements.push({
              nom: nom,
              lat: lat,
              lon: lon
            });
          }
        }
      }
    }
  });
  return (lListeEmplacements);
}

//-------------------------------------------------------
// Validation des modifications
//-------------------------------------------------------
function ButGestionEmplacementsValiderClick()
{
  let nouvelleListe = AnalyseTexteVersTableau();
  localStorage.setItem("ListeEmplacements", JSON.stringify(nouvelleListe));
  pid('scrGestionEmplacements').style.display = 'none';
  AfficheEcranChoixEmplacement();
}