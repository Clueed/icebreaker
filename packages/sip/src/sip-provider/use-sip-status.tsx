import type { SessionManagerOptions } from "sip.js/lib/platform/web";
import { useMemo, useState } from "react";

import { ErrorMessageLevel1, ErrorMessageLevel2 } from "../enums/error";
import { CONNECT_STATUS, RegisterStatus } from "../type";

export const useSIPStatus = () => {
  const [connectStatus, setStatus] = useState<CONNECT_STATUS>(
    CONNECT_STATUS.WAIT_REQUEST_CONNECT,
  );
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus>(
    RegisterStatus.UNREGISTERED,
  );

  const statusPartialDelegate: SessionManagerOptions["delegate"] = useMemo(
    () => ({
      onRegistered: () => {
        setRegisterStatus(RegisterStatus.REGISTERED);
      },
      onUnregistered: () => {
        setRegisterStatus(RegisterStatus.UNREGISTERED);
      },
      onServerConnect() {
        setStatus(CONNECT_STATUS.CONNECTED);
      },
      onServerDisconnect(error) {
        console.error(
          ErrorMessageLevel1.SIP_PROVIDER,
          ErrorMessageLevel2.FAILED_CONNECT_SIP_USER,
          error,
        );
        setStatus(CONNECT_STATUS.DISCONNECTED);
      },
    }),
    [setRegisterStatus, setStatus],
  );

  return {
    statusPartialDelegate,
    connectStatus,
    registerStatus,
  };
};
