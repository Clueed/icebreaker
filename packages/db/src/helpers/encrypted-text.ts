import { AES, enc } from "crypto-js";
import { customType } from "drizzle-orm/pg-core";

import { env } from "../../env";

export const encryptedText = customType<{ data: string; driverData: string }>({
  dataType() {
    return "varchar(256)";
  },
  fromDriver(value: unknown) {
    return AES.decrypt(String(value), env.CRYPTO_SECRET).toString(enc.Utf8);
  },
  toDriver(value: string) {
    return AES.encrypt(value, env.CRYPTO_SECRET).toString();
  },
});
