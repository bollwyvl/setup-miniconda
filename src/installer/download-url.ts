import * as types from "../_types";

import { ensureLocalInstaller } from "./_base";

export const urlDownloader: types.IInstallerProvider = {
  label: "Download URL",
  provides: async (inputs, options) => {
    return inputs.minicondaVersion !== "" && inputs.architecture !== "x64";
  },
  installerPath: async (inputs, options) => {
    return {
      localInstallerPath: await ensureLocalInstaller({
        url: inputs.installerUrl,
      }),
      options: {
        ...options,
        useBundled: false,
      },
    };
  },
};
