import * as types from "../_types";

export const ensureSimple: types.IEnvProvider = {
  label: "Simple Environment",
  provides: async (inputs, options) =>
    !(options.envSpec?.explicit?.length || options.envSpec?.yaml == null),
  condaArgs: async (inputs, options) => {
    const args = ["create", "--name", inputs.activateEnvironment];

    if (inputs.pythonVersion) {
      args.push(`python ${inputs.pythonVersion}`);
    }

    return args;
  },
};
