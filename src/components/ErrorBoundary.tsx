import React, { Component, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Ici vous pouvez envoyer l’erreur à un service (Sentry, etc.)
    console.error('Error boundary caught an error :', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    const { t, children } = this.props;
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{t('something_wrong')}</Text>
          <Text style={styles.message}>{t('notified_try_again')}</Text>
          <Button title={t('tryAgain')} onPress={this.handleRetry} />
        </View>
      );
    }
    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
});

// Injection du HOC de traduction
export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
