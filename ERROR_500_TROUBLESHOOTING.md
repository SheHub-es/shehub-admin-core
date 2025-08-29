# Error 500 - Troubleshooting Guide

## Problema
Error 500: "An unexpected error occurred" al intentar conectar con el backend de Spring Boot.

## Causa Principal
El error 500 indica que hay un problema interno en el servidor backend (Spring Boot), no en el frontend.

## Posibles Causas y Soluciones

### 1. Servidor Backend No Está Ejecutándose
**Síntoma**: El servidor Spring Boot no está corriendo.
**Solución**: 
- Inicia el servidor Spring Boot
- Verifica que está ejecutándose en el puerto correcto (por defecto 8080)
- Revisa los logs del servidor para errores de inicio

### 2. Configuración de Base de Datos
**Síntoma**: Error de conexión a la base de datos.
**Solución**: 
- Verifica que la base de datos está ejecutándose
- Revisa la configuración en `application.properties` o `application.yml`
- Verifica credenciales de conexión a la base de datos

### 3. Problemas de CORS
**Síntoma**: Error de CORS en el navegador.
**Solución**: 
- Verifica configuración de CORS en el backend
- Asegúrate de que `http://localhost:3002` esté permitido en la configuración de CORS

### 4. Variable de Entorno Incorrecta
**Síntoma**: Frontend no puede encontrar el backend.
**Solución**: 
- Verifica que `.env.local` existe y tiene `NEXT_PUBLIC_API_URL=http://localhost:8080`
- Reinicia el servidor de desarrollo después de cambiar variables de entorno

### 5. Puerto Incorrecto
**Síntoma**: Conexión rechazada.
**Solución**: 
- Verifica que el backend está corriendo en el puerto especificado en `NEXT_PUBLIC_API_URL`
- Si el backend usa un puerto diferente, actualiza `.env.local`

## Herramientas de Diagnóstico

### 1. Usando el Diagnóstico Integrado
- Cuando aparezca un error 500, haz clic en "Diagnóstico"
- Ejecuta las pruebas automáticas para identificar el problema específico

### 2. Revisión Manual
```bash
# Verifica que el backend está ejecutándose
curl http://localhost:8080/actuator/health

# Verifica conectividad básica
curl http://localhost:8080/api/applicants -H "Authorization: Basic $(echo -n 'admin@shehub.com:admin123' | base64)"
```

### 3. Logs del Servidor
- Revisa los logs del servidor Spring Boot para errores detallados
- Busca excepciones de base de datos, errores de configuración, etc.

## Configuración Recomendada

### Backend (Spring Boot)
```properties
# application.properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/shehub_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# CORS Configuration
cors.allowed-origins=http://localhost:3000,http://localhost:3002,http://localhost:3001
```

### Frontend (Next.js)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

## Checklist de Resolución

- [ ] ✅ Backend Spring Boot está ejecutándose
- [ ] ✅ Base de datos está conectada y accesible
- [ ] ✅ Variables de entorno están configuradas correctamente
- [ ] ✅ CORS está configurado para permitir el frontend
- [ ] ✅ Credenciales de autenticación son válidas
- [ ] ✅ Puertos están correctos en la configuración
- [ ] ✅ No hay errores en los logs del servidor

## Contacto
Si el problema persiste después de seguir esta guía, revisa los logs completos del servidor Spring Boot para obtener más detalles específicos del error.
