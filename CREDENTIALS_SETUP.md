# Configuración de Credenciales - SheHub Admin

## Problema Actual
El frontend está mostrando "Error del servidor. Usando datos de respaldo" porque:

1. ✅ **Servidor Spring Boot está ejecutándose** (Puerto 8080, PID 15404)
2. ✅ **Endpoints están disponibles** (/api/applicants existe)
3. ❌ **Credenciales de autenticación incorrectas** (Error 401)

## Credenciales por Defecto del Frontend

El frontend actualmente está configurado para usar:
```
Email: admin@shehub.com
Password: admin123
```

## Verificar Credenciales del Backend

### Opción 1: Revisar la configuración del backend
Busca en tu proyecto Spring Boot:
- `application.properties` o `application.yml`
- Clases de configuración de seguridad
- DataSQL o scripts de inicialización

### Opción 2: Usar el Diagnóstico Integrado
1. Ve al dashboard: http://localhost:3002/dashboard
2. Si ves error, haz clic en **"Diagnóstico"**
3. Ejecuta las pruebas para ver detalles específicos

### Opción 3: Probar credenciales manualmente
Usa PowerShell para probar diferentes credenciales:

```powershell
# Probar credenciales por defecto
$headers = @{ 'Authorization' = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin@shehub.com:admin123')) }
Invoke-RestMethod -Uri 'http://localhost:8080/api/applicants' -Method GET -Headers $headers

# Probar credenciales alternativas
$headers = @{ 'Authorization' = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:admin')) }
Invoke-RestMethod -Uri 'http://localhost:8080/api/applicants' -Method GET -Headers $headers
```

## Credenciales Comunes en Spring Boot

Las credenciales más comunes suelen ser:
- `admin` / `admin`
- `admin@example.com` / `password`
- `user` / `password`
- `admin` / `password`

## Actualizar Credenciales en el Frontend

Una vez que identifiques las credenciales correctas, actualízalas en:
- La página de login (sessionStorage)
- O configura las credenciales por defecto en el código

## Verificar Estado Actual

**Servidor Backend**: ✅ Corriendo en puerto 8080
**Frontend**: ✅ Corriendo en puerto 3002
**Conectividad**: ✅ Red funcional
**Problema**: ❌ Credenciales de autenticación

## Próximos Pasos

1. **Identifica las credenciales correctas** del backend
2. **Actualiza el login** con las credenciales correctas
3. **Prueba el diagnóstico** para confirmar la conexión
4. **¡Disfruta del dashboard funcionando!**
