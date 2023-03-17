import { atom, useAtom } from 'jotai';

const extraAreaAtom = atom([]);

export function useAppbar() {
    const [extraArea, setExtraArea] = useAtom(extraAreaAtom);
    return {
        extraArea, setExtraArea
    }
}
