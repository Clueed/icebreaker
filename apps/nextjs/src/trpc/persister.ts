import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export const createIDBPersister = (idbValidKey: IDBValidKey = "reactQuery") => {
  return {
    persistClient: async (client: PersistedClient) => {
      const strippedClient = stripClient(client);
      try {
        await set(idbValidKey, strippedClient);
      } catch (e) {
        console.error("Error persisting client: ", e);
        console.error("Client: ", strippedClient);
      }
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
};

const stripClient = (client: PersistedClient): PersistedClient => ({
  ...client,
  clientState: {
    ...client.clientState,
    queries: removeWithPromises(client.clientState.queries),
  },
});

const removeWithPromises = (
  querries: PersistedClient["clientState"]["queries"],
) => querries.filter((q) => q.promise === undefined);
