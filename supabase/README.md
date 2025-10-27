# Supabase: esquema y pasos rápidos

Archivos:
- `friends_schema.sql`: crea `friend_requests` y `friends`.

Instrucciones rápidas:

1. Entra a tu proyecto en Supabase.
2. Abre SQL Editor y revisa la primera parte de `friends_schema.sql` para elegir la variante adecuada:
	- Si `users.id` es UUID, ejecuta la sección "Variante A" (tablas con sufijo `_uuid`).
	- Si `users.id` es integer/serial/bigint, ejecuta la sección "Variante B" (tablas con sufijo `_int`).
3. Ejecuta la sección correspondiente para crear las tablas.

Notas:
- El proyecto que me indicaste no tiene `profiles`, y por eso el SQL original falló con `relation "profiles" does not exist`.
- Si prefieres, puedes renombrar las tablas resultantes (por ejemplo eliminar el sufijo) una vez verificado el tipo y las relaciones.
- Después de crear las tablas, actualiza el backend para usar las tablas con sufijo `_uuid` o `_int` según corresponda.
