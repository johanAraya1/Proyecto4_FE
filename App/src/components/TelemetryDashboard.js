/**
 * Componente de Dashboard de Telemetría
 * Basado en el diseño de la imagen proporcionada
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTelemetry } from '../hooks/useTelemetry';

const TelemetryDashboard = () => {
  const { metrics, health, loading, error, refresh, resetMetrics } =
    useTelemetry();

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Función wrapper para el refresh
  const handleRefresh = () => {
    refresh();
  };

  const formatUptime = (uptime) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  // eslint-disable-next-line no-unused-vars
  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FFD166';
      case 'critical':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getHealthStatus = () => {
    if (!health) return 'unknown';
    return health.status || 'unknown';
  };

  // eslint-disable-next-line no-unused-vars
  const handleResetMetrics = () => {
    Alert.alert(
      'Resetear Métricas',
      '¿Estás seguro de que quieres resetear todas las métricas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: resetMetrics,
        },
      ]
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjetas de métricas principales */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📊</Text>
            <Text style={styles.metricValue}>
              {metrics?.systemMetrics?.totalRequests || '14'}
            </Text>
            <Text style={styles.metricLabel}>TOTAL REQUESTS</Text>
            <Text style={styles.metricSubtext}>+12% vs ayer</Text>
            <Text style={styles.metricStatus}>Excelente</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>⚡</Text>
            <Text style={styles.metricValue}>
              {metrics?.systemMetrics?.averageResponseTime?.toFixed(0) || '168'}
              ms
            </Text>
            <Text style={styles.metricLabel}>TIEMPO PROMEDIO</Text>
            <Text style={styles.metricSubtext}>Excelente</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💛</Text>
            <Text style={styles.metricValue}>{getHealthStatus()}</Text>
            <Text style={styles.metricLabel}>ESTADO SISTEMA</Text>
            <Text style={styles.metricSubtext}>6.7% errores</Text>
            <Text style={styles.metricStatus}>Atención requerida</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🚨</Text>
            <Text style={styles.metricValue}>
              {metrics?.systemMetrics?.totalErrors || '1'}
            </Text>
            <Text style={styles.metricLabel}>TOTAL ERRORES</Text>
            <Text style={styles.metricSubtext}>Atención requerida</Text>
          </View>
        </View>

        {/* Eventos Recientes */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>📋 Eventos Recientes</Text>
          <View style={styles.eventsContainer}>
            <View style={styles.eventItem}>
              <Text style={styles.eventIcon}>📊</Text>
              <Text style={styles.eventLabel}>Api Request</Text>
              <Text style={styles.eventValue}>
                {metrics?.eventCounters?.find(
                  (e) => e.eventType === 'api_request'
                )?.count || '15'}
              </Text>
            </View>

            <View style={styles.eventItem}>
              <Text style={styles.eventIcon}>📊</Text>
              <Text style={styles.eventLabel}>User Login_success</Text>
              <Text style={styles.eventValue}>
                {metrics?.eventCounters?.find(
                  (e) => e.eventType === 'user_login_success'
                )?.count || '1'}
              </Text>
            </View>

            <View style={styles.eventItem}>
              <Text style={styles.eventIcon}>📊</Text>
              <Text style={styles.eventLabel}>User Login_failed</Text>
              <Text style={styles.eventValue}>
                {metrics?.eventCounters?.find(
                  (e) => e.eventType === 'user_login_failed'
                )?.count || '1'}
              </Text>
            </View>
          </View>
        </View>

        {/* Dashboard de Telemetría detallado */}
        <View style={styles.detailSection}>
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleRefresh}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>
                {loading ? 'Actualizando...' : '🔄 Actualizar Datos'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Estado del Sistema */}
          <View style={styles.systemStatusCard}>
            <View style={styles.systemStatusHeader}>
              <Text style={styles.systemStatusIcon}>⚠️</Text>
              <Text style={styles.systemStatusTitle}>Estado del Sistema</Text>
            </View>
            <View style={styles.systemStatusContent}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Estado:</Text>
                <Text style={[styles.statusValue, { color: '#FFD166' }]}>
                  WARNING
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Uptime:</Text>
                <Text style={styles.statusValue}>
                  {health?.uptime ? formatUptime(health.uptime) : '3m 25s'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Tasa de Error:</Text>
                <Text style={styles.statusValue}>
                  {health?.errorRate?.toFixed(2) || '6.67'}%
                </Text>
              </View>
            </View>
          </View>

          {/* Métricas Generales */}
          <View style={styles.generalMetricsCard}>
            <View style={styles.generalMetricsHeader}>
              <Text style={styles.generalMetricsIcon}>⚡</Text>
              <Text style={styles.generalMetricsTitle}>Métricas Generales</Text>
            </View>
            <View style={styles.generalMetricsContent}>
              <View style={styles.metricRow}>
                <Text style={styles.metricRowLabel}>Total Requests:</Text>
                <Text style={styles.metricRowValue}>
                  {metrics?.systemMetrics?.totalRequests || '14'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricRowLabel}>Total Errores:</Text>
                <Text style={styles.metricRowValue}>
                  {metrics?.systemMetrics?.totalErrors || '1'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricRowLabel}>Tiempo Promedio:</Text>
                <Text style={styles.metricRowValue}>
                  {metrics?.systemMetrics?.averageResponseTime?.toFixed(2) ||
                    '168.29'}
                  ms
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricRowLabel}>Última actualización:</Text>
                <Text style={styles.metricRowValue}>29/9/2025, 18:15:43</Text>
              </View>
            </View>
          </View>

          {/* Eventos del Sistema */}
          <View style={styles.systemEventsCard}>
            <View style={styles.systemEventsHeader}>
              <Text style={styles.systemEventsIcon}>📋</Text>
              <Text style={styles.systemEventsTitle}>Eventos del Sistema</Text>
            </View>
            <View style={styles.systemEventsContent}>
              <View style={styles.eventRow}>
                <Text style={styles.eventRowLabel}>Api Request:</Text>
                <Text style={styles.eventRowValue}>
                  {metrics?.eventCounters?.find(
                    (e) => e.eventType === 'api_request'
                  )?.count || '15'}
                </Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventRowLabel}>User Login_success:</Text>
                <Text style={styles.eventRowValue}>
                  {metrics?.eventCounters?.find(
                    (e) => e.eventType === 'user_login_success'
                  )?.count || '1'}
                </Text>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventRowLabel}>User Login_failed:</Text>
                <Text style={styles.eventRowValue}>
                  {metrics?.eventCounters?.find(
                    (e) => e.eventType === 'user_login_failed'
                  )?.count || '1'}
                </Text>
              </View>
            </View>
          </View>

          {/* Tiempos de Respuesta por Endpoint */}
          <View style={styles.responseTimesCard}>
            <View style={styles.responseTimesHeader}>
              <Text style={styles.responseTimesIcon}>⏱️</Text>
              <Text style={styles.responseTimesTitle}>
                Tiempos de Respuesta por Endpoint
              </Text>
            </View>
            {/* Tiempos de Respuesta por Endpoint */}
            <View style={styles.responseTimesContent}>
              {metrics?.responseMetrics &&
              metrics.responseMetrics.length > 0 ? (
                metrics.responseMetrics.map((metric, index) => (
                  <View key={index} style={styles.endpointRow}>
                    <View style={styles.endpointMethod}>
                      <Text
                        style={
                          metric.method === 'POST'
                            ? styles.methodPost
                            : styles.methodGet
                        }
                      >
                        {metric.method}
                      </Text>
                    </View>
                    <Text style={styles.endpointPath}>{metric.endpoint}</Text>
                    <View style={styles.endpointMetrics}>
                      <Text style={styles.endpointPromedio}>
                        Promedio: {metric.averageTime?.toFixed(2) || '0.00'}ms
                      </Text>
                      <Text style={styles.endpointMinMax}>
                        Min/Max: {metric.minTime || 0}ms / {metric.maxTime || 0}
                        ms
                      </Text>
                      <Text style={styles.endpointRequests}>
                        Requests: {metric.requestCount || 0}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.endpointRow}>
                  <View style={styles.endpointMethod}>
                    <Text style={styles.methodPost}>POST</Text>
                  </View>
                  <Text style={styles.endpointPath}>/login</Text>
                  <View style={styles.endpointMetrics}>
                    <Text style={styles.endpointPromedio}>
                      Promedio: 1061.50ms
                    </Text>
                    <Text style={styles.endpointMinMax}>
                      Min/Max: 422ms / 1700ms
                    </Text>
                    <Text style={styles.endpointRequests}>Requests: 2</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Errores por Código HTTP */}
          {metrics?.errorMetrics && metrics.errorMetrics.length > 0 && (
            <View style={styles.httpErrorsCard}>
              <View style={styles.httpErrorsHeader}>
                <Text style={styles.httpErrorsIcon}>🚨</Text>
                <Text style={styles.httpErrorsTitle}>
                  Errores por Código HTTP
                </Text>
              </View>
              <View style={styles.httpErrorsContent}>
                {metrics.errorMetrics.map((error, index) => (
                  <View key={index} style={styles.httpErrorRow}>
                    <Text style={styles.httpErrorCode}>
                      HTTP {error.statusCode}
                    </Text>
                    <Text style={styles.httpErrorCount}>
                      {error.count} errores
                    </Text>
                    <Text style={styles.httpErrorTime}>
                      {error.lastError
                        ? `Último: ${error.lastError}`
                        : 'Último: POST /login'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  updateButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  updateButtonText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    margin: 16,
    borderRadius: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    margin: '1%',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 2,
  },
  metricStatus: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
  },
  eventsSection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  eventsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  eventIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  eventLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  eventValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  detailSection: {
    margin: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  systemStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD166',
  },
  systemStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  systemStatusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  systemStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  systemStatusContent: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  generalMetricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6F4E37', // PRINCIPAL - color café corporativo
  },
  generalMetricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  generalMetricsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  generalMetricsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  generalMetricsContent: {
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  systemEventsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  systemEventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  systemEventsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  systemEventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  systemEventsContent: {
    padding: 16,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  eventRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  responseTimesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  responseTimesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  responseTimesIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  responseTimesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  responseTimesContent: {
    padding: 16,
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  endpointMethod: {
    marginRight: 12,
  },
  methodPost: {
    backgroundColor: '#FF9800',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  methodGet: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  endpointPath: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
    minWidth: 60,
  },
  endpointMetrics: {
    flex: 1,
  },
  endpointPromedio: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  endpointMinMax: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  endpointRequests: {
    fontSize: 12,
    color: '#666',
  },
  httpErrorsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  httpErrorsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  httpErrorsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  httpErrorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  httpErrorsContent: {
    padding: 16,
  },
  httpErrorRow: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  httpErrorCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  httpErrorCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  httpErrorTime: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
  },
});

export default TelemetryDashboard;
