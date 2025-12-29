import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Button} from '../components/Button';
import {API_BASE_URL} from '../services/api';

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

const initialResult: CheckResult = {
  status: 'idle',
  message: '未実行',
};

export const DiagnosticsScreen: React.FC = () => {
  const rpId = useMemo(() => {
    try {
      return new URL(API_BASE_URL).hostname;
    } catch {
      return '';
    }
  }, []);

  const [assetlinksResult, setAssetlinksResult] =
    useState<CheckResult>(initialResult);
  const [dalResult, setDalResult] = useState<CheckResult>(initialResult);
  const [advice, setAdvice] = useState<DiagnosticAdvice | null>(null);

  const runAssetlinksCheck = async () => {
    if (!rpId) {
      setAssetlinksResult({
        status: 'error',
        message: 'RP ID が取得できません',
      });
      return;
    }

    setAssetlinksResult({status: 'running', message: '取得中...'});
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
        message: '取得に失敗しました',
        details: error.message,
      });
      setAdvice(null);
    }
  };

  const runDalCheck = async () => {
    if (!rpId) {
      setDalResult({
        status: 'error',
        message: 'RP ID が取得できません',
      });
      return;
    }

    setDalResult({status: 'running', message: '検証中...'});
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
        message: '検証に失敗しました',
        details: error.message,
      });
      setAdvice(null);
    }
  };

  const makeAdvice = (): DiagnosticAdvice => {
    if (!rpId) {
      return {
        title: 'RP ID を取得できません',
        summary: 'API_BASE_URL の設定を見直してください。',
        hints: ['API_BASE_URL が https:// で始まっているか確認してください。'],
      };
    }

    if (assetlinksResult.status === 'error') {
      return {
        title: 'assetlinks.json の取得失敗',
        summary: 'RP ID のドメインで assetlinks.json が取得できていません。',
        hints: [
          `https://${rpId}/.well-known/assetlinks.json が 200 で返るか確認してください。`,
          'リダイレクトがある場合は直配信にしてください。',
          'DNS 解決や証明書が正しいか確認してください。',
        ],
      };
    }

    if (dalResult.status === 'error') {
      return {
        title: 'Digital Asset Links の検証失敗',
        summary: 'Google の検証 API が assetlinks.json を正しく認識できていません。',
        hints: [
          'assetlinks.json の JSON 形式が正しいか確認してください。',
          'package_name と SHA-256 が実機インストール済み APK と一致するか確認してください。',
        ],
      };
    }

    if (assetlinksResult.status === 'ok' && dalResult.status === 'ok') {
      return {
        title: 'サーバー側の検証はOK',
        summary:
          '端末側のキャッシュや Google Play Services の状態が原因の可能性が高いです。',
        hints: [
          'Play Services / Play Store / Chrome のデータ削除を試してください。',
          '端末の Private DNS をオフにしてください。',
          'アプリをアンインストールして再インストールしてください。',
        ],
      };
    }

    return {
      title: '診断の実行が必要です',
      summary: 'assetlinks と DAL の両方を実行してください。',
      hints: ['両方のボタンを実行後に結果が表示されます。'],
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
        {result.status === 'running' ? '実行中...' : result.message}
      </Text>
      {result.details ? (
        <Text style={styles.resultDetails}>{result.details}</Text>
      ) : null}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>診断ツール</Text>
      <Text style={styles.subtitle}>
        RP ID: {rpId || '取得できません'}
      </Text>

      <View style={styles.buttonRow}>
        <Button title="assetlinks.json を確認" onPress={runAssetlinksCheck} />
        <Button
          title="Digital Asset Links を確認"
          onPress={runDalCheck}
          variant="secondary"
        />
        <Button
          title="自動判定"
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
