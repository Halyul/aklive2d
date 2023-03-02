import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';

const fetcher = (...args) => fetch(...args).then(res => res.json())
const backgroundsAtom = atom([]);
const currentBackgroundAtom = atom(null);

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useAtom(backgroundsAtom);
  const [currentBackground, setCurrentBackground] = useAtom(currentBackgroundAtom)

  useEffect(() => {
    fetcher('/_assets/backgrounds.json').then(data => {
      setBackgrounds(data)
      setCurrentBackground(data[0])
    })
  }, []);

  return { backgrounds, currentBackground, setCurrentBackground };
}