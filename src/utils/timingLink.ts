// timingLink.js
import { ApolloLink } from '@apollo/client';
import { consoleLog } from './helpers';

export const timingLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();

  // forward(operation) returns an Observable
  return forward(operation).map((result) => {
    
    if (process.env.NODE_ENV === 'development') {
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      consoleLog(`Operation ${operation.operationName} took ${timeTaken} ms`);
      const { query, variables, operationName } = operation;
      consoleLog("==================================================");
      consoleLog(`🚀 [GraphQL Request] ${operationName || 'Anonymous'}`);
      //consoleLog(" GQL:", print(query).replace(/\s+/g, ' ')); // `print` converts the query AST to a string
      consoleLog(" Variables:", JSON.stringify(variables, null, 2));
      consoleLog("==================================================");
    }
    return result;
  });
});
