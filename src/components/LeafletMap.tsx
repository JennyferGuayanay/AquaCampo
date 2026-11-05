import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { AquaColores } from "../constants/aquaTheme";
import { sonCoordenadasValidas } from "../utils/rules";
import type { Coordenadas } from "../types/models";

interface LeafletMapProps {
  coordenadas: Coordenadas | null;
  editable?: boolean;
  conectado: boolean;
  altura?: number;
  onCambiarCoordenadas?(coordenadas: Coordenadas): void;
}

function crearHtml(coordenadas: Coordenadas | null, editable: boolean) {
  const ubicacionInicial = JSON.stringify(coordenadas);

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; background: #e9f8fa; }
      .leaflet-container { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        function enviar(mensaje) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(mensaje));
          }
        }

        function iniciar() {
          if (!window.L) {
            enviar({ type: "error" });
            return;
          }

          var editable = ${JSON.stringify(editable)};
          var inicial = ${ubicacionInicial};
          var mapa = L.map("map", { zoomControl: true }).setView(
            inicial ? [inicial.latitude, inicial.longitude] : [0, 0],
            inicial ? 16 : 2
          );
          var marcador = null;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapa);

          function publicar(latitud, longitud) {
            enviar({
              type: "location",
              latitude: latitud,
              longitude: longitud
            });
          }

          function colocarMarcador(latitud, longitud, notificar) {
            if (!marcador) {
              marcador = L.marker([latitud, longitud], {
                draggable: editable
              }).addTo(mapa);
              if (editable) {
                marcador.on("dragend", function () {
                  var punto = marcador.getLatLng();
                  publicar(punto.lat, punto.lng);
                });
              }
            } else {
              marcador.setLatLng([latitud, longitud]);
            }
            if (notificar) publicar(latitud, longitud);
          }

          window.actualizarUbicacion = function (latitud, longitud) {
            if (latitud === null || longitud === null) {
              if (marcador) {
                mapa.removeLayer(marcador);
                marcador = null;
              }
              return;
            }
            colocarMarcador(latitud, longitud, false);
          };

          if (editable) {
            mapa.on("click", function (evento) {
              colocarMarcador(evento.latlng.lat, evento.latlng.lng, true);
            });
          }

          if (inicial) {
            colocarMarcador(inicial.latitude, inicial.longitude, false);
          }
          enviar({ type: "ready" });
        }

        if (document.readyState === "complete") iniciar();
        else window.addEventListener("load", iniciar);
      })();
    </script>
  </body>
</html>`;
}

export function LeafletMap({
  coordenadas,
  editable = false,
  conectado,
  altura = 230,
  onCambiarCoordenadas,
}: LeafletMapProps) {
  const webView = useRef<WebView>(null);
  const [mapaListoEn, setMapaListoEn] = useState<boolean | null>(null);
  const [errorMapaEn, setErrorMapaEn] = useState<boolean | null>(null);
  const mapaListo = mapaListoEn === conectado;
  const errorMapa = errorMapaEn === conectado;
  const ubicacionValida = sonCoordenadasValidas(coordenadas)
    ? coordenadas
    : null;

  useEffect(() => {
    if (!mapaListo) return;
    const latitud = ubicacionValida?.latitude ?? null;
    const longitud = ubicacionValida?.longitude ?? null;
    webView.current?.injectJavaScript(
      `window.actualizarUbicacion(${latitud}, ${longitud}); true;`,
    );
  }, [ubicacionValida?.latitude, ubicacionValida?.longitude, mapaListo]);

  function recibirMensaje(datos: string) {
    let mensaje: unknown;
    try {
      mensaje = JSON.parse(datos);
    } catch {
      setErrorMapaEn(conectado);
      return;
    }

    if (!mensaje || typeof mensaje !== "object") return;
    const contenido = mensaje as Record<string, unknown>;

    if (contenido.type === "ready") {
      setMapaListoEn(conectado);
      setErrorMapaEn(null);
      return;
    }
    if (contenido.type === "error") {
      setErrorMapaEn(conectado);
      return;
    }
    if (
      contenido.type === "location" &&
      sonCoordenadasValidas({
        latitude: Number(contenido.latitude),
        longitude: Number(contenido.longitude),
      })
    ) {
      onCambiarCoordenadas?.({
        latitude: Number(contenido.latitude),
        longitude: Number(contenido.longitude),
      });
    }
  }

  const etiquetaCoordenadas = ubicacionValida
    ? `${ubicacionValida.latitude.toFixed(6)}, ${ubicacionValida.longitude.toFixed(6)}`
    : "Sin ubicación seleccionada";

  return (
    <View style={estilos.contenedor}>
      <View style={[estilos.mapa, { height: altura }]}>
        {Platform.OS === "web" ? (
          <Text style={estilos.avisoMapa}>
            El mapa interactivo está disponible en la aplicación móvil.
          </Text>
        ) : errorMapa ? (
          <Text style={estilos.avisoMapa}>
            No se pudo cargar el mapa. Comprueba la conexión e inténtalo de nuevo.
          </Text>
        ) : (
          <WebView
            key={`${editable ? "editable" : "lectura"}-${conectado ? "online" : "offline"}`}
            ref={webView}
            originWhitelist={["*"]}
            source={{ html: crearHtml(ubicacionValida, editable) }}
            javaScriptEnabled
            scrollEnabled={false}
            onMessage={(evento) => recibirMensaje(evento.nativeEvent.data)}
            onError={() => setErrorMapaEn(conectado)}
            style={estilos.webView}
          />
        )}
      </View>
      <Text style={estilos.coordenadas}>
        Latitud y longitud: {etiquetaCoordenadas}
      </Text>
      {editable && (
        <Text style={estilos.instruccion}>
          Toca el mapa para colocar el marcador o arrástralo para moverlo.
        </Text>
      )}
      {!conectado && (
        <Text style={estilos.avisoSinConexion}>
          Sin conexión: los mosaicos del mapa pueden no estar disponibles. La
          ubicación se conserva en el dispositivo.
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 8 },
  mapa: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: AquaColores.celesteSuave,
  },
  webView: { flex: 1, backgroundColor: "transparent" },
  coordenadas: { color: AquaColores.marino, fontSize: 13, fontWeight: "800" },
  instruccion: { color: AquaColores.textoSuave, fontSize: 12, lineHeight: 18 },
  avisoMapa: {
    color: AquaColores.textoSuave,
    padding: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
  avisoSinConexion: {
    color: AquaColores.avisoTexto,
    backgroundColor: AquaColores.aviso,
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    lineHeight: 17,
  },
});
