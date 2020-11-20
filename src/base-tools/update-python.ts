import * as types from "../_types";
import { isBaseEnv } from "../_utils";

export const updatePython: types.IToolProvider = {
  label: "Update python",
  provides: async (inputs, options) =>
    !!(inputs.pythonVersion && isBaseEnv(inputs.activateEnvironment)),
  toolPackages: async (inputs, options) => {
    let updates: types.IToolUpdates = {
      tools: [],
      options,
    };

    updates.tools.push(`python ${inputs.pythonVersion}`);

    return updates;
  },
};
