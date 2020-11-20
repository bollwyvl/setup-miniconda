import { ensureLocalInstaller, providers } from "./_base";

providers.set("Download Installer from Custom URL", {
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
});
