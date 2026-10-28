# ADR-007: Detectar conectividad y sincronizar lecturas con control de conflictos

- **Estado:** Documentación retrospectiva
- **Fecha:** 2026-10-28
- **Requisitos relacionados:** R4, R6, R9 y R10

## Contexto
AquaCampo permite registrar lecturas sin internet. Cuando vuelve la conexión, debe intentar enviarlas al servidor, evitar duplicados y conservar la información si ocurre una interrupción durante el envío.

## Alternativas consideradas

### Alternativa A: Sincronización controlada desde la aplicación
- Ventajas: permite administrar estados locales, detectar conflictos y comprobar registros remotos antes de enviar.
- Desventajas: requiere implementar lógica de reintentos, recuperación y prevención de duplicados.

### Alternativa B: Enviar cada lectura únicamente al momento de guardarla
- Ventajas: flujo más sencillo cuando existe conexión estable.
- Desventajas: no resuelve adecuadamente el trabajo sin internet ni las interrupciones durante el envío.

## Decisión
Utilizar `expo-network` para detectar cambios de conectividad y un sincronizador propio para procesar las lecturas almacenadas.

La implementación se encuentra en:
- `src/hooks/useConnectivity.ts`
- `src/context/AquaContext.tsx`
- `src/services/sync.ts`
- `src/services/syncCore.ts`

El sincronizador consulta las lecturas remotas, identifica coincidencias mediante `idLocal` y revisa si existe otra lectura del mismo medidor y mes.

Antes de enviar, marca el registro como `enviando`. Si ocurre un error de resultado incierto, conserva ese estado para su posterior revisión o recuperación.

Cuando detecta datos incompatibles o duplicados, registra un conflicto en lugar de crear otra lectura.

El proveedor de estado coordina los intentos de sincronización cuando existe conexión y una sesión activa.

## Consecuencias
- Las lecturas pueden registrarse sin conexión.
- La aplicación intenta sincronizarlas al recuperar internet.
- Los registros enviados pueden bloquearse para evitar modificaciones posteriores.
- Los conflictos se conservan para revisión.
- Una interrupción durante el envío requiere comprobar el estado remoto antes de decidir si corresponde reintentar.
- La detección de conectividad no garantiza que el servidor esté disponible.
- La protección depende también de la respuesta y de los datos que entregue el servidor.

## Verificación
- Crear una lectura sin internet y comprobar que queda pendiente.
- Recuperar la conexión y verificar el envío automático.
- Comprobar la actualización del contador de pendientes.
- Revisar que una lectura enviada quede bloqueada.
- Comprobar que no se genere un segundo registro remoto para el mismo medidor y mes.
- Interrumpir la conexión durante un envío y revisar el estado resultante.

## Uso de IA
Se utilizó inteligencia artificial como herramienta de apoyo para organizar la documentación técnica y revisar la claridad de la redacción. El contenido se contrastó con la implementación existente.
