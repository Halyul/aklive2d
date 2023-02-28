import Dexie from 'dexie';

const db = new Dexie('aklive2dDatabase');
db.version(2).stores({
    image: '++key, blob',
    voice: '++key, blob',
    config: '++key, value',
});

export default db;