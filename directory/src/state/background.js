import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';

const fetcher = (...args) => fetch(...args).then(res => res.json())
const backgroundsAtom = atom([]);
const currentBackgroundAtom = atom(null);

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useAtom(backgroundsAtom);
  const [currentBackground, setCurrentBackground] = useAtom(currentBackgroundAtom)

  const fetchBackgrounds = useCallback(async () => {
    const res = await fetch('/_assets/backgrounds.json')
    const data = await res.json()
    setBackgrounds(data)
    setCurrentBackground(data[0])
  }, [])

  return {
    backgrounds,
    currentBackground,
    setCurrentBackground,
    fetchBackgrounds
  };
}