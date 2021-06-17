export const PROJECT_REVISION = '{{PROJECT_REVISION}}';

let SUCCESS_HANDLERS = [];
let ERROR_HANDLERS = [];

if ('serviceWorker' in navigator) {
  console.log('que lo que?');
}


export function addSuccessHandler(func) {
  SUCCESS_HANDLERS.push(func);
}

export function addErrorHandler(func) {
  ERROR_HANDLERS.push(func);
}
