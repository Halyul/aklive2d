import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';

const configAtom = atom([]);
const operatorsAtom = atom([]);
const versionAtom = atom({});

export function useConfig() {
  const [config, setConfig] = useAtom(configAtom);
  const [version, setVersion] = useAtom(versionAtom);
  const [operators, setOperators] = useAtom(operatorsAtom);

  const fetchConfig = useCallback(async () => {
    const res = await fetch('/_assets/directory.json')
    const data = await res.json()
    setConfig(data);
    let operatorsList = []
    data.operators.forEach((item) => {
      operatorsList = [...operatorsList, ...item]
    })
    setOperators(operatorsList)
  }, [setConfig, setOperators])

  const fetchVersion = useCallback(async () => {
    const res = await fetch('/_assets/version.json')
    const data = await res.json()
    setVersion(data);
  }, [setVersion])

  return { config, version, operators, fetchConfig, fetchVersion };
}
