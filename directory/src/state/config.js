import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';

const fetcher = (...args) => fetch(...args).then(res => res.json())
const configAtom = atom([]);
const operatorsAtom = atom([]);
const versionAtom = atom({});

export function useConfig() {
  const [config, setConfig] = useAtom(configAtom);
  const [version, setVersion] = useAtom(versionAtom);
  const [operators, setOperators] = useAtom(operatorsAtom);


  useEffect(() => {
    fetcher('/_assets/directory.json').then(data => {
      setConfig(data);
      let operatorsList = []
      data.operators.forEach((item) => {
        operatorsList = [...operatorsList, ...item]
      })
      setOperators(operatorsList)
    })
    fetcher('/_assets/version.json').then(data => {
      setVersion(data);
    })
  }, []);

  return { config, version, operators };
}