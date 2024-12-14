import type { ReactNode } from "react";
import React, { useRef } from "react";

import type {
  SIPProviderDependencies,
  SIPProviderOptions,
} from "./use-create-sip-provider-context";
import { ProviderContext } from "./sip-provider-context";
import { useCreateSipProviderContext } from "./use-create-sip-provider-context";

export const SIPProvider = (props: {
  options: SIPProviderOptions;
  dependencies: SIPProviderDependencies;
  children: ReactNode;
}): React.ReactNode => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const context = useCreateSipProviderContext({
    options: props.options,
    audioRef: audioRef.current,
    dependencies: props.dependencies,
  });

  return (
    <>
      <ProviderContext.Provider value={context}>
        {props.children}
      </ProviderContext.Provider>
      <audio ref={audioRef} />
    </>
  );
};
