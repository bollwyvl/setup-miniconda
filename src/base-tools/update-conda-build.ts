import * as types from "../_types";

export const updateCondaBuild: types.IToolProvider = {
  label: "Update conda-build",
  provides: async (inputs, options) => inputs.condaBuildVersion !== "",
  toolPackages: async (inputs, options) => {
    return {
      tools: [`conda-build ${inputs.condaBuildVersion}`],
      options,
    };
  },
};
