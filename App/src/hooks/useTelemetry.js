/**
 * Hook personalizado para manejar métricas de telemetría
 * SIN actualización automática - solo actualización manual por el usuario
 */
import { useState, useCallback } from 'react';
import { telemetryAPI } from '../services/telemetryApi';

export const useTelemetry = () => {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener métricas (solo manual)
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Actualizando métricas de telemetría...');
      console.log('🌐 URL base de telemetría:', telemetryAPI.baseUrl);
      
      // Obtener todas las métricas en paralelo
      const [metricsData, healthData] = await Promise.all([
        telemetryAPI.getAllMetrics(),
        telemetryAPI.getHealthStatus()
      ]);
      
      console.log('📊 Métricas obtenidas:', metricsData);
      console.log('💚 Estado de salud obtenido:', healthData);
      
      setMetrics(metricsData);
      setHealth(healthData);
      
      console.log('✅ Datos actualizados correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching telemetry data:', err);
      
      // Mostrar datos dummy si hay error de conexión
      if (errorMessage.includes('fetch') || errorMessage.includes('Network')) {
        setMetrics({
          systemMetrics: {
            totalRequests: 14,
            totalErrors: 4, // 4 errores 401
            averageResponseTime: 168.29,
            timestamp: new Date().toISOString()
          },
          eventCounters: [
            { eventType: 'api_request', count: 15 },
            { eventType: 'user_login_success', count: 1 },
            { eventType: 'user_login_failed', count: 4 } // 4 fallos de login
          ],
          responseMetrics: [
            {
              endpoint: '/login',
              method: 'POST',
              averageTime: 1061.50,
              minTime: 422,
              maxTime: 1700,
              requestCount: 5 // 5 intentos de login
            },
            {
              endpoint: '/health',
              method: 'GET',
              averageTime: 16.00,
              minTime: 1,
              maxTime: 52,
              requestCount: 6
            },
            {
              endpoint: '/metrics',
              method: 'GET',
              averageTime: 22.83,
              minTime: 6,
              maxTime: 60,
              requestCount: 6
            }
          ],
          errorMetrics: [
            {
              statusCode: 401,
              count: 4, // 4 errores 401
              lastError: 'Invalid credentials',
              lastUpdated: new Date().toISOString()
            }
          ]
        });
        setHealth({
          status: 'warning',
          uptime: 205000, // 3m 25s
          errorRate: 28.57 // 4 errores de 14 requests = 28.57%
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Función manual de refresh (única forma de actualizar)
  const refresh = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Función para resetear métricas
  const resetMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await telemetryAPI.resetMetrics();
      
      // Actualizar datos después del reset
      await fetchMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear métricas');
      console.error('Error resetting metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  return {
    metrics,
    health,
    loading,
    error,
    refresh,
    resetMetrics
  };
};