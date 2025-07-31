import { ApolloLink, Observable } from '@apollo/client';
import { notify } from './notificationServices';
import { t } from 'i18next';

export const timeoutLink = (warnAfter: number, timeoutAfter: number) =>
  new ApolloLink((operation, forward) =>
    new Observable(observer => {
      // 1) warning timer
      const warnTimer = setTimeout(() => {
        notify(t('taking_longer'))
        console.warn(
          `⚠️ GraphQL operation "${operation.operationName}" still running after ${warnAfter}ms`
        );
      }, warnAfter);

      // 2) hard timeout timer
      const timeoutTimer = setTimeout(() => {
        notify(t('request_timeout'))
        observer.error(new Error(`⏱ Request timed out after ${timeoutAfter}ms`));
      }, timeoutAfter);

      const sub = forward(operation).subscribe({
        next: result => {
          clearTimeout(warnTimer);
          clearTimeout(timeoutTimer);
          observer.next(result);
        },
        error: err => {
          clearTimeout(warnTimer);
          clearTimeout(timeoutTimer);
          observer.error(err);
        },
        complete: () => {
          clearTimeout(warnTimer);
          clearTimeout(timeoutTimer);
          observer.complete();
        },
      });

      // clean up if unsubscribed
      return () => {
        clearTimeout(warnTimer);
        clearTimeout(timeoutTimer);
        sub.unsubscribe();
      };
    })
  );
