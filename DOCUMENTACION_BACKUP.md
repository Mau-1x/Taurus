# Copias locales de Taurus

Este paquete crea una copia local de:

- La base de datos Azure SQL en formato `.bacpac`.
- Las imágenes originales almacenadas en Cloudinary.
- Un `manifest.json` con fecha, tamaño y SHA-256 del BACPAC.
- Un manifiesto de las imágenes de Cloudinary.

La copia se guarda por defecto en:

```text
Documentos\TaurusBackups
```

Cada ejecución crea una carpeta como:

```text
Taurus_20260715_213000
├── database
│   └── NombreBase.bacpac
├── cloudinary
│   ├── assets
│   └── manifest.json
├── logs
│   └── sqlpackage-export.log
└── manifest.json
```

## 1. Copiar los archivos

Copia las carpetas `scripts` y `backend` del ZIP dentro de la raíz del proyecto Taurus.

Los scripts nuevos de Cloudinary deben quedar en:

```text
Taurus\backend\scripts\backup-cloudinary.js
Taurus\backend\scripts\restore-cloudinary.js
```

## 2. Instalar SqlPackage una sola vez

Abre PowerShell en la raíz de Taurus:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backups\instalar-sqlpackage.ps1
```

Se necesita .NET SDK 8 o posterior.

## 3. Ejecutar la primera copia manual

Haz doble clic en:

```text
scripts\backups\EJECUTAR_BACKUP.bat
```

También puedes usar PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backups\backup-taurus.ps1
```

No se guarda el archivo `.env` dentro de las copias.

## 4. Programar una copia diaria

El horario predeterminado es 9:30 p. m.:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backups\programar-backup-diario.ps1
```

Otro horario:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backups\programar-backup-diario.ps1 -Hora "22:00"
```

La PC debe estar encendida. Si estaba apagada, Windows intentará ejecutar la tarea cuando vuelva a estar disponible.

Las copias de más de 30 días se eliminan automáticamente. Para conservar 60 días:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backups\backup-taurus.ps1 -RetentionDays 60
```

## 5. Probar una restauración de la base de datos

Nunca importes directamente sobre la base de producción.

Ejemplo:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backups\restaurar-base-datos.ps1 `
  -BacpacPath "$HOME\Documents\TaurusBackups\Taurus_20260715_213000\database\Taurus.bacpac" `
  -TargetDatabase "Taurus_Restore_Prueba"
```

El usuario SQL configurado debe tener permisos para crear una base nueva. También puedes crear primero una base vacía desde Azure y usar su nombre.

## 6. Restaurar imágenes de Cloudinary

Restauración sin sobrescribir archivos existentes:

```powershell
node .\backend\scripts\restore-cloudinary.js `
  --backup "$HOME\Documents\TaurusBackups\Taurus_20260715_213000" `
  --confirm RESTAURAR
```

Para sobrescribir recursos con el mismo `public_id`:

```powershell
node .\backend\scripts\restore-cloudinary.js `
  --backup "$HOME\Documents\TaurusBackups\Taurus_20260715_213000" `
  --confirm RESTAURAR `
  --overwrite
```

Usa `--overwrite` únicamente durante una recuperación controlada.

## 7. Recomendaciones

- Ejecuta la exportación cuando no se estén registrando ventas o reparaciones.
- Conserva al menos una copia mensual en otro disco físico.
- Prueba la restauración una vez al mes en una base distinta.
- No compartas archivos `.bacpac`: contienen los datos de la base y no están cifrados.
- No subas las copias al repositorio Git.
- Agrega a `.gitignore` si decides guardar copias dentro del proyecto:

```gitignore
TaurusBackups/
*.bacpac
```

## 8. Subir los scripts a Git

Los scripts no contienen contraseñas:

```powershell
git add .
git commit -m "Agrega copias locales y restauracion"
git push
```

## Nota importante

El BACPAC es una exportación lógica de esquema y datos para archivo y portabilidad. No sustituye las copias automáticas ni la restauración a un momento determinado que ofrece Azure SQL.
