import * as types from "../_types";

import * as core from "@actions/core";

export const ensureSimple: types.IEnvProvider = {
  label: "Simple Environment",
  provides: async (inputs, options) => {
    core.info(JSON.stringify(options));
    return !(
      options.envSpec?.explicit?.length || options.envSpec?.yaml == null
    );
  },
  condaArgs: async (inputs, options) => {
    const args = ["create", "--name", inputs.activateEnvironment];

    if (inputs.pythonVersion) {
      args.push(`python ${inputs.pythonVersion}`);
    }

    return args;
  },
};
