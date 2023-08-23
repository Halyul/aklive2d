import CONFIG from '@/_directory.json';

let operators = []
CONFIG.operators.forEach((item) => {
  operators = [...operators, ...item]
});
const OPERATORS = operators;

export function useConfig() {
  const config = CONFIG;
  const operators = OPERATORS;
  
  return { config, operators };
}
