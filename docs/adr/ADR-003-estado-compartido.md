# ADR-003: Compartir el estado mediante React Context

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R1, R3 y R9

## Contexto
Las pantallas de AquaCampo necesitan compartir la sesión del técnico, la conectividad, las lecturas almacenadas y el estado de sincronización.

## Alternativas consideradas

### Alternativa A: React Context
- Ventajas: está integrado en React, no requiere otra dependencia y permite compartir información entre componentes.
- Desventajas: los cambios del contexto pueden provocar renderizados adicionales.

### Alternativa B: Biblioteca externa de estado global
- Ventajas: puede ofrecer herramientas especializadas y actualizaciones selectivas.
- Desventajas: añade dependencias y complejidad al proyecto.

## Decisión
Utilizar React Context mediante `AquaProvider` y `useAqua` para compartir el estado principal de AquaCampo.

La implementación se encuentra en `src/context/AquaContext.tsx`.

El proveedor administra la sesión, las lecturas, la conectividad y la sincronización. También recupera los envíos interrumpidos al iniciar la aplicación.

## Consecuencias
- Las pantallas comparten información consistente.
- La sincronización se coordina desde un punto central.
- Se evita duplicar innecesariamente el estado de sesión.
- Es necesario controlar los renderizados y las operaciones simultáneas.

## Verificación
- Iniciar sesión y navegar entre pantallas.
- Cerrar y abrir la aplicación.
- Guardar una lectura sin internet.
- Recuperar la conexión y verificar la sincronización.
- Comprobar la actualización del contador de pendientes.

## Uso de IA
Se utilizó inteligencia artificial como herramienta de apoyo para organizar la documentación técnica y revisar la claridad de la redacción. Las decisiones descritas corresponden a la implementación existente y se contrastaron con el código fuente.
