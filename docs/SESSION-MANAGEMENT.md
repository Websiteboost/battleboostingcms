# Sistema de Gestión de Sesión

## 🎯 Características Implementadas

### 1. **Monitoreo Automático de Sesión**
- Detecta cuando la sesión expira (15 minutos de inactividad)
- Muestra notificación toast antes de redirigir
- Redirección automática al login

### 2. **Notificaciones Toast (react-hot-toast)**
- **Login exitoso**: Mensaje de bienvenida con estilo cyberpunk
- **Sesión expirada**: Aviso antes de redirigir
- **Errores de autenticación**: Alertas visuales

### 3. **Hook Personalizado**
- `useAuthErrorHandler`: Para manejar errores de auth en componentes individuales

## 📁 Archivos Creados

### `/src/components/providers/SessionProvider.tsx`
Componente que monitorea el estado de la sesión y redirige automáticamente cuando expira.

```tsx
<SessionMonitor>
  {children}
</SessionMonitor>
```

### `/src/hooks/useAuthErrorHandler.ts`
Hook para manejar errores de autenticación en acciones del servidor.

```tsx
const { handleError } = useAuthErrorHandler();

try {
  const result = await someAction();
  if (!result.success) {
    if (!handleError(result)) {
      // Manejar otros errores
    }
  }
} catch (error) {
  handleError(error);
}
```

## 🚀 Uso

El sistema funciona automáticamente en todo el dashboard. No necesitas hacer cambios en las páginas individuales.

### Configuración de Sesión (lib/auth.ts)
```typescript
session: {
  strategy: 'jwt',
  maxAge: 15 * 60, // 15 minutos
  updateAge: 5 * 60, // Renovar cada 5 minutos si está activo
}
```

### Estilos de Toast Personalizados
Todos los toasts usan el tema cyberpunk:
- Fondo: `#1e293b`
- Bordes con colores según tipo (purple para éxito, red para error)
- Posición: `top-center`

## 🎨 Personalización

Para cambiar los estilos de los toasts, edita los objetos `style` en:
- `SessionProvider.tsx` (toast de sesión expirada)
- `useAuthErrorHandler.ts` (toast de errores de auth)
- `login/page.tsx` (toast de bienvenida)

## 📝 Notas

- El sistema detecta cambios de estado de `authenticated` a `unauthenticated`
- Previene múltiples toasts con un sistema de flags
- Compatible con todas las páginas del dashboard sin configuración adicional
