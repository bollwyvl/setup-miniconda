import * as types from "../_types";

import * as core from "@actions/core";
/**
 * The map
 */
const providers = new Map<string, types.IToolProvider>();

export async function getToolUpdates(
  inputs: types.IActionInputs,
  options: types.IDynamicOptions
): Promise<types.IToolUpdates> {
  let updates: types.IToolUpdates = {
    tools: [],
    options,
  };
  for (const [key, provider] of providers.entries()) {
    if (provider.provides(inputs, options)) {
      core.info(key);
      const toolUpdates = await provider.toolPackages(inputs, options);
      updates = {
        tools: [...updates.tools, ...toolUpdates.tools],
        options: { ...updates.options, ...toolUpdates.options },
      };
    }
  }

  return updates;
}
