// Variaveis globais
let map;
let infoWindow;
// Chamada da API Google maps
((g) => {
  var h,
    a,
    k,
    p = "The Google Maps JavaScript API",
    c = "google",
    l = "importLibrary",
    q = "__ib__",
    m = document,
    b = window;
  b = b[c] || (b[c] = {});
  var d = b.maps || (b.maps = {}),
    r = new Set(),
    e = new URLSearchParams(),
    u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        await (a = m.createElement("script"));
        e.set("libraries", [...r] + "");
        for (k in g)
          e.set(
            k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
            g[k]
          );
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
  d[l]
    ? console.warn(p + " only loads once. Ignoring:", g)
    : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
})({
  key: apikey,
  v: "weekly",
});
//Função de iniciação do mapa
async function initMap() {
  const inicial = { lat: 0, lng: 0 };
  //Bibliotecas
  const { Map } = await google.maps.importLibrary("maps");
  const { Geocoder } = await google.maps.importLibrary("geocoding");
  // Mapa inicial
  map = new Map(document.getElementById("map"), {
    zoom: 3,
    center: inicial,
    mapId: "6033e179cc2326dc",
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  });
  //Modificação no mapa baseado em pais
  estiloPais = map.getFeatureLayer("COUNTRY");
  //Info window inicial
  infoWindow = new google.maps.InfoWindow({
    content: "Clique em um pais para receber suas informações",
    position: inicial,
  });
  infoWindow.open(map);
  //Iniciailização do objeto da biblioteca geocoding
  let geocoder = new google.maps.Geocoder();

  //Inicialização de funções
  navBarCountries(); //gera paises no navbar
  searchCountries(); //gera barra de pesquisa
  searchButton(); //gera botao de search

  //Leitor de eventos do mapa
  map.addListener("mousemove", (mapsMouseEvent) => {
    // Leitura do evento de movimento do mouse
    countrieHover(geocoder, mapsMouseEvent.latLng); // geocoder e a latitude/longitude de onde o mouse esta se movendo
  });

  map.addListener("mouseout", (mapsMouseEvent) => {
    // leitura de saida do mouse do mapa
    window.setTimeout(() => {
      estiloPais.style = null; //limpa qualquer efeito no mapa
    }, 550);
  });

  map.addListener("click", (mapsMouseEvent) => {
    //leitura de click do mouse
    infoWindow.close(); // fecha a infowindow inicial
    clickCountrie(geocoder, mapsMouseEvent.latLng); //geocoder e latitude/longitude do click
  });
}



function clickCountrie(geocoder, cord) {
//Função de click no país
/*
Recebe geocoder para adquirir código cca2 do país (Não contém place id do país)
Chama a função getName para descobrir o nome do pais conforme o código cca2
Chama outro geocoder agora com o nome em ingles adquirido pela função getName -> Recebe o place id do país
Efeito de seleção do pais com fill e border
getCountrie devolve valores da API restcountries.com/v3.1/all
Estabelece os parametros da infowindow e do mapa
*/
  const estiloPaisOptions = {
    strokeColor: "#000F20",
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: "#000F20",
    fillOpacity: 1,
  };

  let getPais = new google.maps.Geocoder();

  geocoder
    .geocode({ location: cord })
    .then(async (response) => {
      if (response.results[0]) {
        let num = null;
        if (response.results.at(-1).address_components.at(-1).types[0] =="country") {
          num = -1;
        } else {
          num = -2;
        }

        const nomePais = await getName(response.results.at(-1).address_components.at(num).short_name);

        getPais.geocode({ address: nomePais }).then((response) => {
          if (response.results[0]) {
            estiloPais.style = (options) => {
              if (options.feature.placeId == response.results[0].place_id) {
                return estiloPaisOptions;
              } else {
              }
            };
            map.fitBounds(response.results[0].geometry.viewport, 155);
            var lat = response.results[0].geometry.location.lat();
            var lng = response.results[0].geometry.location.lng();
            var coord = { lat: lat, lng: lng };
            let cca2 = response.results[0].address_components[0].short_name;
            getCountrie(cca2)
              .then((result) => {
                if (result) {
                  infoWindow.setContent(
                    "<div>" +
                      "<img src=" +
                      result[1] +
                      ' alt="" width="75px" height="50px" style="padding: 5px; float: left;">' +
                      '<h1 id="firstHeading" class="firstHeading" >' +
                      result[4] +
                      "</h1>" +
                      '<div id="bodyContent">' +
                      "<h2>Visão Geral</h2>" +
                      "<ul>" +
                      "<li><b>Nome do País:</b> " +
                      result[6] +
                      "</li>" +
                      "<li><b>Continente:</b> " +
                      result[5] +
                      "</li>" +
                      "<li><b>Subregião:</b> " +
                      result[8] +
                      "</li>" +
                      "<li><b>População:</b> " +
                      formatNumber(result[3]) +
                      " habitantes</li>" +
                      "<li><b>Área Total:</b> " +
                      formatArea(result[7]) +
                      "</li>" +
                      "<li><b>Capital:</b> " +
                      result[0] +
                      "</li>" +
                      "<li><b>Língua Oficial:</b> " +
                      result[2] +
                      "</li>" +
                      "<li><b>Moedas:</b> " +
                      result[9] +
                      "</li>" +
                      "</ul>" +
                      "<h2>Informações Adicionais</h2>" +
                      "<p>" +
                      texto(
                        result[6],
                        result[5],
                        result[8],
                        result[0],
                        result[3],
                        result[2],
                        result[7],
                        result[9]
                      ) +
                      "</p>" +
                      "<p>Para saber mais sobre " +
                      result[4] +
                      ', confira a <a href="https://pt.wikipedia.org/wiki/' +
                      result[4] +
                      '" target="_blank">Wikipedia</a>.</p>' +
                      "</div>" +
                      "</div>"
                  );
                  infoWindow.setPosition(coord);
                  infoWindow.open(map);
                } else {
                  window.alert(
                    "Erro na api google maps: Short_name incorrect -> " + cca2  //irlanda e outros geram esse problema(Short_Name recebe Long_name)
                  );
                }
              })
              .catch((error) => {
                console.error("Erro na requisição:", error);
              });
          } else {
            window.alert("Sem resultado");
          }
        });
      } else {
        window.alert("Sem resultado");
      }
    })
    .catch((e) => {
      map.setZoom(3);
      map.setCenter(cord);
      infoWindow.setContent(
        "Aqui provavelmente não seja um país ou não é reconhecido"
      );
      infoWindow.setPosition(cord);
      infoWindow.open(map);
    });
}

const getName = async (paiscca2) => {
  //Função de get da api restcountries para receber nome em ingles do pais
  /*
  recebe codigo cca2 do pais e faz uma varredura na api para fazer um match
  retorna o nome em ingles -> Granada por exemplo gera um erro em pt-br pois o geocoder abre a cidade Espanhola ao inves do país
  */
    try {
      let baseUrl = "https://restcountries.com/v3.1/all";
      const response = await fetch(baseUrl);
      const data = await response.json();
  
      for (let i in data) {
        if (paiscca2 === data[i].cca2) {
          return data[i].name.common;
        }
      }
  
      return null;
    } catch (error) {
      console.error("Erro ao buscar o país:", error);
      throw error;
    }
  };

const getCountrie = async (paiscca2) => {
  //Função de get api
  /*
  Recebe um código cca2 e faz uma varredura pela api, encontrar o código retorna parametros
  */

  try {
    let baseUrl = "https://restcountries.com/v3.1/all";
    const response = await fetch(baseUrl);
    const data = await response.json();

    for (let i in data) {
      if (paiscca2 === data[i].cca2) {
        const capital = getCapitals(data[i].capital);
        const continente = await traduzirTexto(data[i].region);
        const idiomas = await traduzirTexto(getLanguages(data[i].languages));
        const subregiao = await traduzirTexto(data[i].subregion);
        const currencies = getMoedas(data[i].currencies);
        return [
          capital,
          data[i].flags.png,
          idiomas,
          data[i].population,
          data[i].translations.por.official,
          continente,
          data[i].translations.por.common,
          data[i].area,
          subregiao,
          currencies,
        ];
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar o país:", error);
    throw error;
  }
};

function getCapitals(capitalsData) {
  /*
  Estabelece gerenciamento para países com mais de uma capital (Africa do sul tem 3)
  */
  try {
    if (capitalsData && capitalsData.length > 0) {
      if (capitalsData.length === 1) {
        return capitalsData[0];
      } else if (capitalsData.length === 2) {
        return capitalsData.join(" e ");
      } else {
        const ateUltimo = capitalsData.slice(0, capitalsData.length - 1);
        const ultimo = capitalsData[capitalsData.length - 1];
        return ateUltimo.join(", ") + " e " + ultimo;
      }
    }
    return "Desconhecido"; // Caso não haja informações de capital
  } catch (error) {
    console.error("Erro ao obter informações de capitais:", error);
    throw error;
  }
}

function getLanguages(languagesData) {
  /*
  Estabelece gerenciamento para países com mais de um idioma
  */
  try {
    if (languagesData) {
      const languagesLista = Object.values(languagesData);
      if (languagesLista.length === 1) {
        return languagesLista[0];
      } else if (languagesLista.length === 2) {
        return languagesLista.join(" and ");
      } else if (languagesLista.length <= 3) {
        return (
          languagesLista.slice(0, -1).join(", ") +
          " and " +
          languagesLista.slice(-1)
        );
      } else {
        return languagesLista.slice(0, 2).join(", ") + ", and others";
      }
    }
    return "Desconhecido";
  } catch (error) {
    console.error("Erro ao obter idiomas oficiais:", error);
    throw error;
  }
}

function getMoedas(moedasData) {
  /*
  Estabelece gerenciamento para países com mais de uma moeda
  */
  try {
    if (moedasData) {
      const moedasLista = Object.values(moedasData);
      if (moedasLista.length === 1) {
        return moedasLista[0].name;
      } else if (moedasLista.length === 2) {
        return moedasLista.map((moeda) => moeda.name).join(" e ");
      } else {
        const ateUltimo = moedasLista.slice(0, 3);
        const ultimo = moedasLista[moedasLista.length - 1];
        return (
          ateUltimo.map((moeda) => moeda.name).join(", ") +
          " e " +
          ultimo.name
        );
      }
    }
    return "Desconhecido"; 
  } catch (error) {
    console.error("Erro ao obter informações de moedas:", error);
    throw error;
  }
}

function formatNumber(num) {
  //Adiona pontos ao numeral
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

function formatArea(area) {
  //Muda formato da area dependendo do tamanho
  if (area >= 1000000) {
    return (area / 1000000).toFixed(2) + " milhões de quilômetros quadrados";
  } else {
    return formatNumber(area) + " quilômetros quadrados";
  }
}

function texto(country,continent,subregion,capital,population,language,area,moedas) {
  /*
  Texto e gerenciamento de informações do continente 
  */
  const continentes = {
    Europa: "Europeu",
    África: "Africano",
    Ásia: "Asiático",
    Américas: "Americano",
    Oceânia: "Oceânico",
  };

  const changedContinent = continentes[continent] || continent;

  return (
    `O país ${country} está localizado na subregião ${subregion} do continente ${changedContinent}. ` +
    `É conhecido por ser ${getCountrySize(area)}. ` +
    `Possui uma população de cerca de ${formatNumber(
      population
    )} habitantes, que residem em várias cidades, incluindo a capital ${capital}. ` +
    `A língua oficial falada é ${language}. ` +
    `A moeda utilizada inclui ${moedas}.`
  );
}

function getCountrySize(area) {
  /**
   * estabelece diferentes textos para cada pais dependendo do tamanho do pais
   */
  if (area > 1000000) {
    return "um país bastante extenso";
  } else if (area > 500000) {
    return "um país de tamanho médio";
  } else {
    return "um país não muito grande";
  }
}




function countrieHover(geocoder, cord) {
//Função de hover no país
/*
Recebe geocoder para adquirir código cca2 do país (Não contém place id do país)
Chama outro geocoder -> Recebe o place id do país
Efeito de hover do pais com border
*/
  const estiloPaisOptions = {
    strokeColor: "#000F20",
    strokeOpacity: 1.0,
    strokeWeight: 3.0,
  };

  let getPais = new google.maps.Geocoder();
  geocoder 
    .geocode({ location: cord }) 
    .then(async (response) => {
      if (response.results[0]) {
        let num = null;
        if (response.results.at(-1).address_components.at(-1).types[0] =="country") {
          num = -1;
        } else {
          num = -2;
        }

        const strControle = await getName(response.results.at(-1).address_components.at(num).short_name);
        getPais
          .geocode({ address: strControle })
          .then((response) => {
            if (response.results[0]) {
              let id = response.results[0].place_id;
              estiloPais.style = (options) => {
                if (options.feature.placeId == id) {
                  return estiloPaisOptions;
                } else {
                }
              };
            } 
            })
            .catch((e) => {
              estiloPais.style = null;
            });
      } 
    })
    .catch((e) => {
      console.log("mar");
      estiloPais.style = null;
    });
}



function navBarCountries() {
//Função de criação da navbar
/*
Cria navbar com relação a api restcountries
Faz uma ordenação por ordem de população (Não sei pq não esta funcionando sempre)
Confirma funcionamento do pais com um geocoder(match)
createDropdownItem estabelece as funções de funcionamento e 
*/
  let baseUrl = "https://restcountries.com/v3.1/all";
  let match = new google.maps.Geocoder();

  fetch(baseUrl)
    .then((response) => response.json())
    .then((response) => {
      response.sort((a, b) => b.population - a.population);

      // Mapeamento de regiões para IDs de elementos HTML
      const regionMappings = {
        Asia: "Asia",
        Europe: "Europa",
        Americas: "Americas",
        Oceania: "Oceania",
        Africa: "Africa",
      };

      response.forEach((country) => {
        const regionId = regionMappings[country.region];

        if (regionId) {
          match.geocode({ address: country.name.common }).then((response) => {
            if (response.results[0]) {
              const countryDropdown = document.getElementById(regionId);
              const listItem = createDropdownItem(country);
              countryDropdown.appendChild(listItem);
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error("Erro ao buscar países:", error);
    });
}
function createDropdownItem(country) {
//Função criação de itens do menu dropdown
  
  const listItem = document.createElement("li");
  listItem.classList.add("dropdown-item", "d-flex", "align-items-center");
  const link = document.createElement("a");
  link.classList.add("dropdown-item");
  link.href = "#";
  link.textContent = country.translations.por.common;
  const flagImg = document.createElement("img");
  flagImg.src = country.flags.png;
  flagImg.classList.add("flag");
  link.addEventListener("click", function () {
    navbarSelection(country.name.common);  // função de click no pais
  });

  link.addEventListener("mouseenter", function () {
    navbarHover(country.name.common); // função de hover no pais
  });
  link.addEventListener("mouseleave", function () {
    estiloPais.style = null; //função de saida do hover
  });
  listItem.appendChild(flagImg);
  listItem.appendChild(link);
  return listItem;
}
function navbarSelection(pais) {
//Função de seleção do pais no navbar e search
/*
funcionamento igual ao clickCountrie() porém utiliza o nome do pais para fazer a primeira procura
clcikCountrie() usa cordenada pois não consegue receber nome de pais pelo evento, é necessario primeiro uma reversegeocoding
*/
  const estiloPaisOptions = {
    strokeColor: "#000F20",
    strokeOpacity: 1.0,
    strokeWeight: 3.0,
    fillColor: "#000F20",
    fillOpacity: 1,
  };
  let geocoder = new google.maps.Geocoder();
  geocoder
    .geocode({ address: pais })
    .then((response) => {
      if (response.results[0]) {
        let id = response.results[0].place_id;
        estiloPais.style = (options) => {
          if (options.feature.placeId == id) {
            return estiloPaisOptions;
          } else {
          }
        };
        map.fitBounds(response.results[0].geometry.viewport, 155);
        var lat = response.results[0].geometry.location.lat();
        var lng = response.results[0].geometry.location.lng();
        var coord = { lat: lat, lng: lng };
        let cca2 = response.results[0].address_components[0].short_name;
        console.log(cca2);
        getCountrie(cca2)
          .then((result) => {
            if (result) {
              infoWindow.setContent(
                "<div>" +
                  "<img src=" +
                  result[1] +
                  ' alt="" width="75px" height="50px" style="padding: 5px; float: left;">' +
                  '<h1 id="firstHeading" class="firstHeading" >' +
                  result[4] +
                  "</h1>" +
                  '<div id="bodyContent">' +
                  "<h2>Visão Geral</h2>" +
                  "<ul>" +
                  "<li><b>Nome do País:</b> " +
                  result[6] +
                  "</li>" +
                  "<li><b>Continente:</b> " +
                  result[5] +
                  "</li>" +
                  "<li><b>Subregião:</b> " +
                  result[8] +
                  "</li>" +
                  "<li><b>População:</b> " +
                  formatNumber(result[3]) +
                  " habitantes</li>" +
                  "<li><b>Área Total:</b> " +
                  formatArea(result[7]) +
                  "</li>" +
                  "<li><b>Capital:</b> " +
                  result[0] +
                  "</li>" +
                  "<li><b>Língua Oficial:</b> " +
                  result[2] +
                  "</li>" +
                  "<li><b>Moedas:</b> " +
                  result[9] +
                  "</li>" +
                  "</ul>" +
                  "<h2>Informações Adicionais</h2>" +
                  "<p>" +
                  texto(
                    result[6],
                    result[5],
                    result[8],
                    result[0],
                    result[3],
                    result[2],
                    result[7],
                    result[9]
                  ) +
                  "</p>" +
                  "<p>Para saber mais sobre " +
                  result[4] +
                  ', confira a <a href="https://pt.wikipedia.org/wiki/' +
                  result[4] +
                  '" target="_blank">Wikipedia</a>.</p>' +
                  "</div>" +
                  "</div>"
              );
              infoWindow.setPosition(coord);
              infoWindow.open(map);
            } else {
              window.alert(
                "Erro na api google maps: Short_name incorrect -> " + cca2
              );
            }
          })
          .catch((error) => {
            console.error("Erro na requisição:", error);
          });
      }
    })
    .catch((e) => {
      console.log(e);
    });
}
function navbarHover(pais) {
//Função de hover no país na navbar
/*
funcionamento igual ao countrieHover() porém utiliza o nome do pais para fazer a primeira procura
countrieHover() usa cordenada pois não consegue receber nome de pais pelo evento, é necessario primeiro uma reversegeocoding
*/
  const estiloPaisOptions = {
    strokeColor: "#000F20",
    strokeOpacity: 1.0,
    strokeWeight: 3.0,
  };

  let geocoder = new google.maps.Geocoder();
  geocoder
    .geocode({ address: pais })
    .then((response) => {
      if (response.results[0]) {
        let id = response.results[0].place_id;
        estiloPais.style = (options) => {
          if (options.feature.placeId == id) {
            return estiloPaisOptions;
          } else {
          }
        };
        map.fitBounds(response.results[0].geometry.viewport, 155);
      }
    })
    .catch((e) => {
      console.log(e);
    });
}
async function searchCountries(query) {
//Função da barra de search
/*
Faz a criação do container de sugestões. Quando escrito alguma letra ele faz uma varredura
na api restcountries.com/v3.1/all. Estabelece as funções de clique e hover iguais ao do navmenu
*/
  const suggestionsContainer = document.getElementById("suggestions");
  suggestionsContainer.style.display = "none";
  const countryInput = document.getElementById("countryInput");
  countryInput.addEventListener("input", function () {
    suggestionsContainer.innerHTML = "";
    const query = countryInput.value.trim(); // Obtenha o valor do campo de pesquisa removendo espaços em branco
    console.log(query.length);
  });

  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const data = await response.json();
    const countries = data.filter((country) =>
      country.translations.por.common
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    countries.slice(0, 5).forEach((country) => {
      const suggestionItem = document.createElement("a");
      suggestionItem.classList.add("dropdown-item","d-flex","align-items-center");

      const flagImg = document.createElement("img");
      flagImg.src = country.flags.png;
      flagImg.classList.add("flag","me-2");

      suggestionItem.appendChild(flagImg);

      const countryName = document.createElement("span");
      countryName.textContent = country.translations.por.common;

      suggestionItem.appendChild(countryName);

      suggestionItem.addEventListener("click", function () {
        document.getElementById("countryInput").value =
          country.translations.por.common;
        navbarSelection(country.name.common);// Igual ao menu Nav
        suggestionsContainer.style.display = "none";
      });
      suggestionItem.addEventListener("mouseenter", function () {
        navbarHover(country.name.common); // igual ao menu nav
      });
      suggestionItem.addEventListener("mouseleave", function () {
        estiloPais.style = null; // limpas estilo dos paises ao tirar do pais
      });

      suggestionsContainer.appendChild(suggestionItem);
    });

    if (countries.length === 0) {
      const noResultsItem = document.createElement("div");
      noResultsItem.classList.add("dropdown-item");
      noResultsItem.textContent = "Nenhum resultado encontrado";// Para países que não existem
      suggestionsContainer.appendChild(noResultsItem);
    }
    suggestionsContainer.style.display = "block";
  } catch (error) {
    console.error("Erro ao buscar países:", error);
  }
  if (query.length === 0) {
    // Se a consulta estiver vazia, oculte o contêiner de sugestões
    suggestionsContainer.style.display = "none";
    return;
  }

  document.addEventListener("click", function (event) {
    if (event.target !== countryInput && event.target !== suggestionsContainer) {
      suggestionsContainer.style.display = "none"; // Oculta as sugestões quando clicar fora do campo ou das sugestões
    }
  });
}


async function traduzirTexto(texto) {
//Função de post da api google translation
/*
recebe algum texto e retorna traduzido
*/
  const targetLanguage = "pt-br"; // Código de idioma para português
  const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apikey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: texto,
        target: targetLanguage,
      }),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Erro na tradução:", error);
    throw error;
  }
}

function searchButton() {
//Função do botão de search
/*
recebe pelo id do html e cria um evento de click igual ao de navbarseletion()
*/
  const searchButton = document.getElementById("searchB");
  searchButton.addEventListener("click", function () {
    try {
      navbarSelection(document.getElementById("countryInput").value);
    } catch (error) {
      //alert("País não encontrado ou ocorreu um erro ao selecionar o país.");
    }
  });
}

initMap();
