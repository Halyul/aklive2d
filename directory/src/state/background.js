import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';

const backgroundsAtom = atom([]);

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useAtom(backgroundsAtom);

  const fetchBackgrounds = useCallback(async () => {
    const res = await fetch('/_assets/backgrounds.json')
    const data = await res.json()
    setBackgrounds(data)
  }, [setBackgrounds])

  return {
    backgrounds,
    fetchBackgrounds
  };
}