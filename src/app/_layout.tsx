import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AquaColores } from "../constants/aquaTheme";
import { AquaProvider } from "../context/AquaContext";

export default function RootLayout() {
  return (
    <AquaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: AquaColores.marino },
          headerTintColor: AquaColores.blanco,
          headerTitleStyle: { fontWeight: "800" },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: AquaColores.fondo },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="medidores" options={{ headerShown: false }} />
        <Stack.Screen name="detalle" options={{ title: "Detalle del medidor" }} />
        <Stack.Screen name="registro" options={{ title: "Registrar lectura" }} />
        <Stack.Screen name="pendientes" options={{ title: "Lecturas y sincronización" }} />
      </Stack>
    </AquaProvider>
  );
}
