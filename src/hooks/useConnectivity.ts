
import { useEffect, useState } from "react";
import * as Network from "expo-network";

export function useConnectivity() {
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    Network.getNetworkStateAsync().then(estado => {
      setConectado(
        !!estado.isConnected &&
        estado.isInternetReachable !== false
      );
    }).catch(() => setConectado(false));

    const suscripcion = Network.addNetworkStateListener(estado => {
      setConectado(
        !!estado.isConnected &&
        estado.isInternetReachable !== false
      );
    });

    return () => suscripcion.remove();
  }, []);

  return conectado;
}
