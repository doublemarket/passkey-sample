import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Button} from '../components/Button';
import {API_BASE_URL} from '../services/api';
import {useTranslation} from '../localization';

type CheckStatus = 'idle' | 'running' | 'ok' | 'error';

interface CheckResult {
  status: CheckStatus;
  message: string;
  details?: string;
}

interface DiagnosticAdvice {
  title: string;
  summary: string;
  hints: string[];
}

export const DiagnosticsScreen: React.FC = () => {
  const {t} = useTranslation();
  const rpId = useMemo(() => {
    try {
      return new URL(API_BASE_URL).hostname;
    } catch {
      return '';
    }
  }, []);

  const createInitialResult = () => ({
    status: 'idle' as const,
    message: t('diagnosticsResultNotRun'),
  });

  const [assetlinksResult, setAssetlinksResult] = useState<CheckResult>(
    createInitialResult(),
  );
  const [dalResult, setDalResult] = useState<CheckResult>(
    createInitialResult(),
  );
  const [advice, setAdvice] = useState<DiagnosticAdvice | null>(null);

  useEffect(() => {
    setAssetlinksResult(prev =>
      prev.status === 'idle' ? createInitialResult() : prev,
    );
    setDalResult(prev =>
      prev.status === 'idle' ? createInitialResult() : prev,
    );
  }, [t]);

  const runAssetlinksCheck = async () => {
    if (!rpId) {
      setAssetlinksResult({
        status: 'error',
        message: t('diagnosticsRpIdError'),
      });
      return;
    }

    setAssetlinksResult({status: 'running', message: t('diagnosticsResultRunning')});
    try {
      const response = await fetch(
        `https://${rpId}/.well-known/assetlinks.json`,
      );
      const body = await response.text();
      const ok = response.ok;
      setAssetlinksResult({
        status: ok ? 'ok' : 'error',
        message: ok ? 'OK' : `HTTP ${response.status}`,
        details: body,
      });
      setAdvice(null);
    } catch (error: any) {
      setAssetlinksResult({
        status: 'error',
        message: t('diagnosticsAssetlinksFetchError'),
        details: error.message,
      });
      setAdvice(null);
    }
  };

  const runDalCheck = async () => {
    if (!rpId) {
      setDalResult({
        status: 'error',
        message: t('diagnosticsRpIdError'),
      });
      return;
    }

    setDalResult({status: 'running', message: t('diagnosticsResultRunning')});
    try {
      const url =
        'https://digitalassetlinks.googleapis.com/v1/statements:list' +
        `?source.web.site=https://${rpId}` +
        '&relation=delegate_permission/common.get_login_creds';
      const response = await fetch(url);
      const body = await response.text();
      const ok = response.ok;
      setDalResult({
        status: ok ? 'ok' : 'error',
        message: ok ? 'OK' : `HTTP ${response.status}`,
        details: body,
      });
      setAdvice(null);
    } catch (error: any) {
      setDalResult({
        status: 'error',
        message: t('diagnosticsDalCheckError'),
        details: error.message,
      });
      setAdvice(null);
    }
  };

  const makeAdvice = (): DiagnosticAdvice => {
    if (!rpId) {
      return {
        title: t('diagnosticsRpIdUnavailableTitle'),
        summary: t('diagnosticsRpIdUnavailableSummary'),
        hints: [t('diagnosticsRpIdUnavailableHint1')],
      };
    }

    if (assetlinksResult.status === 'error') {
      return {
        title: t('diagnosticsAssetlinksFetchFailedTitle'),
        summary: t('diagnosticsAssetlinksFetchFailedSummary'),
        hints: [
          t('diagnosticsAssetlinksFetchFailedHint1', {rpId}),
          t('diagnosticsAssetlinksFetchFailedHint2'),
          t('diagnosticsAssetlinksFetchFailedHint3'),
        ],
      };
    }

    if (dalResult.status === 'error') {
      return {
        title: t('diagnosticsDalFailedTitle'),
        summary: t('diagnosticsDalFailedSummary'),
        hints: [
          t('diagnosticsDalFailedHint1'),
          t('diagnosticsDalFailedHint2'),
        ],
      };
    }

    if (assetlinksResult.status === 'ok' && dalResult.status === 'ok') {
      return {
        title: t('diagnosticsServerOkTitle'),
        summary: t('diagnosticsServerOkSummary'),
        hints: [
          t('diagnosticsServerOkHint1'),
          t('diagnosticsServerOkHint2'),
          t('diagnosticsServerOkHint3'),
        ],
      };
    }

    return {
      title: t('diagnosticsNeedsRunTitle'),
      summary: t('diagnosticsNeedsRunSummary'),
      hints: [t('diagnosticsNeedsRunHint1')],
    };
  };

  const handleAutoDiagnose = () => {
    setAdvice(makeAdvice());
  };

  const renderAdvice = () => {
    if (!advice) {
      return null;
    }
    return (
      <View style={styles.adviceCard}>
        <Text style={styles.adviceTitle}>{advice.title}</Text>
        <Text style={styles.adviceSummary}>{advice.summary}</Text>
        {advice.hints.map(hint => (
          <Text key={hint} style={styles.adviceHint}>
            • {hint}
          </Text>
        ))}
      </View>
    );
  };

  const renderResult = (label: string, result: CheckResult) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>{label}</Text>
      <Text style={styles.resultStatus}>
        {result.status === 'running' ? t('diagnosticsResultRunning') : result.message}
      </Text>
      {result.details ? (
        <Text style={styles.resultDetails}>{result.details}</Text>
      ) : null}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('diagnosticsTitle')}</Text>
      <Text style={styles.subtitle}>
        {t('diagnosticsSubtitle', {
          rpId: rpId || t('diagnosticsRpIdUnavailable'),
        })}
      </Text>

      <View style={styles.buttonRow}>
        <Button
          title={t('diagnosticsAssetlinksButton')}
          onPress={runAssetlinksCheck}
        />
        <Button
          title={t('diagnosticsDalButton')}
          onPress={runDalCheck}
          variant="secondary"
        />
        <Button
          title={t('diagnosticsAutoButton')}
          onPress={handleAutoDiagnose}
          variant="secondary"
        />
      </View>

      {renderResult('assetlinks.json', assetlinksResult)}
      {renderResult('Digital Asset Links API', dalResult)}
      {renderAdvice()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonRow: {
    gap: 12,
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  resultStatus: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: '#444',
  },
  adviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#333',
  },
  adviceSummary: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  adviceHint: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
});
