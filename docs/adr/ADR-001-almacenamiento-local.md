# ADR-001: Utilizar AsyncStorage para la persistencia local

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R1, R3, R8, R9 y R10

## Contexto
AquaCampo necesita conservar la sesión del técnico, los medidores consultados, las lecturas pendientes y los borradores, incluso cuando no existe conexión a internet o se cierra la aplicación.

## Alternativas consideradas

### Alternativa A: AsyncStorage
- Ventajas: almacenamiento persistente, implementación sencilla y compatibilidad con datos JSON.
- Desventajas: no proporciona consultas relacionales ni transacciones de base de datos.

### Alternativa B: SQLite
- Ventajas: permite consultas estructuradas, relaciones y transacciones.
- Desventajas: requiere definir tablas, consultas y posibles migraciones.

## Decisión
Utilizar AsyncStorage para almacenar localmente la sesión, los medidores, las lecturas y los borradores.

La implementación se encuentra en `src/storage/local.ts` y `src/storage/repository.ts`. El repositorio utiliza claves diferenciadas y una cola de operaciones para organizar las escrituras.

## Consecuencias
- La aplicación funciona con información previamente almacenada cuando no hay internet.
- Los datos se conservan después de cerrar la aplicación.
- Los borradores se almacenan por técnico.
- Es necesario serializar y recuperar los datos en formato JSON.
- AsyncStorage no debe utilizarse para almacenar contraseñas u otros secretos.

## Verificación
- Mantener la sesión después de cerrar y abrir AquaCampo.
- Consultar medidores sin conexión.
- Guardar una lectura sin internet y comprobar que permanece almacenada.
- Recuperar un borrador.
- Comprobar que no se registren duplicados locales del mismo medidor y mes.

## Uso de IA
Se utilizó inteligencia artificial como herramienta de apoyo para organizar la documentación técnica y revisar la claridad de la redacción. Las decisiones descritas corresponden a la implementación existente y se contrastaron con el código fuente.
