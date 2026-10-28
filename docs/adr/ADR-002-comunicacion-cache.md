# ADR-002: Consultar medidores remotamente y conservar una caché local

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R2, R3, R4 y R9

## Contexto
Los técnicos necesitan consultar medidores registrados en MockAPI, pero pueden perder la conexión durante el trabajo de campo. La aplicación debe aprovechar los datos descargados previamente.

## Alternativas consideradas

### Alternativa A: Consultas HTTP con fetch y caché local
- Ventajas: no requiere una biblioteca HTTP adicional, permite controlar errores y utilizar datos previamente almacenados.
- Desventajas: requiere implementar manualmente la actualización de la caché y el manejo de errores.

### Alternativa B: Consultar siempre el servidor
- Ventajas: permite obtener los datos remotos más recientes cuando existe conexión.
- Desventajas: impide consultar medidores cuando no hay internet y depende constantemente del servidor.

## Decisión
Utilizar `fetch` para consultar los recursos de MockAPI y almacenar los medidores recuperados mediante el repositorio local.

En `src/services/api.ts` se implementan las solicitudes HTTP con un tiempo máximo de espera de diez segundos. En `src/hooks/useMedidor.ts` se consulta primero la caché, se utiliza cuando no hay conexión y se permite solicitar una actualización remota.

## Consecuencias
- Los medidores previamente consultados pueden utilizarse sin conexión.
- Se reducen las solicitudes remotas innecesarias.
- La información local puede quedar desactualizada.
- Un medidor que nunca se descargó puede no estar disponible sin internet.

## Verificación
- Consultar un medidor con internet.
- Desactivar internet y volver a consultarlo.
- Buscar un medidor no almacenado sin conexión.
- Recuperar internet y actualizar la información remota.

## Uso de IA
Se utilizó inteligencia artificial como apoyo para organizar la documentación técnica y revisar la claridad de la redacción. El contenido se contrastó con la implementación existente.
