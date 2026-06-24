import './commands';

const browserErrors: string[] = [];

Cypress.on('window:before:load', (win) => {
  win.addEventListener('error', (event) => {
    browserErrors.push(`[UNCAUGHT ERROR] ${event.message} at ${event.filename}:${event.lineno}`);
  });

  const originalError = win.console.error;
  win.console.error = (...args) => {
    const msg = args.map(a => {
      if (a && typeof a === 'object') {
        if (a instanceof Error) {
          return `${a.name}: ${a.message}\n${a.stack}`;
        }
        if ('message' in a && 'name' in a) {
          return `${a.name}: ${a.message}`;
        }
        return JSON.stringify(a);
      }
      return String(a);
    }).join(' ');
    browserErrors.push(`[CONSOLE ERROR] ${msg}`);
    originalError.apply(win.console, args);
  };
});

afterEach(() => {
  if (browserErrors.length > 0) {
    cy.task('log', `--- Browser Errors for "${Cypress.currentTest.title}" ---`);
    browserErrors.forEach((err) => {
      cy.task('log', err);
    });
    browserErrors.length = 0;
  }
});
