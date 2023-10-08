import CONFIG from '@/_directory.json';
import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';

const officalUpdateAtom = atom({});

let operators = []
CONFIG.operators.forEach((item) => {
  operators = [...operators, ...item]
});
const OPERATORS = operators;

export function useConfig() {
  const config = CONFIG;
  const operators = OPERATORS;
  const [officalUpdate, setOfficalUpdate] = useAtom(officalUpdateAtom);
  
  const fetchOfficalUpdate = useCallback(async () => {
    const res = await fetch('https://raw.githubusercontent.com/Halyul/aklive2d/main/offical_update.json')
    const data = await res.json().catch((e) => {
      console.error(e)
      return {
        length: 0
      }
    })
    setOfficalUpdate(data);
  }, [setOfficalUpdate])
  
  return { config, operators, officalUpdate, fetchOfficalUpdate };
}
