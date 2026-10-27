
import { Stack } from "expo-router";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#102C46"
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold"
          },
          contentStyle: {
            backgroundColor: "#EAF7F9"
          }
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            title: "Explorar"
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
