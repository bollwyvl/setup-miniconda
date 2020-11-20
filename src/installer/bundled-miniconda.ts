import { providers } from "./_base";

providers.set("Use Bundled Miniconda", {
  provides: async (inputs, options) => {
    return inputs.minicondaVersion !== "" && inputs.architecture === "x64";
  },
  installerPath: async (inputs, options) => {
    return {
      localInstallerPath: "",
      options: {
        ...options,
        useBundled: true,
      },
    };
  },
});
