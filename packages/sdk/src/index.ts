// Point d'entrée du package SDK
export const VERSION = '0.0.1';

// Export des types
export * from './types';

// Export des fonctions utilitaires
export * from './utils';

// Export des fonctions core
export * from './core';

// Garder pour compatibilité
export function helloWorld() {
  return 'Hello World in watch mode from SDK with tsc or not';
}
