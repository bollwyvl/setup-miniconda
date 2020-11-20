import * as path from "path";
import * as fs from "fs";

import * as yaml from "js-yaml";

import * as core from "@actions/core";

import * as types from "../_types";
import * as conda from "../conda";

import { ensureExplicit } from "./explicit";

const providers: types.IEnvProvider[] = [ensureExplicit];

/**
 * Create test environment, or update the base environment
 */
export async function ensureEnvironment(
  inputs: types.IActionInputs,
  options: types.IDynamicOptions
): Promise<void> {
  for (const provider of providers) {
    if (await provider.provides(inputs, options)) {
      const args = await provider.condaArgs(inputs, options);
      return await core.group(`Updating env from ${provider.label}...`, () =>
        // TODO: not sure why we need to cast, here...
        conda.condaCommand(args, options)
      );
    }
    break;
  }

  throw Error(
    `Environment ${inputs.activateEnvironment} could not be updated with the provided action inputs`
  );
}

/**
 * Check if a given conda environment exists
 */
export function environmentExists(
  inputs: types.IActionInputs,
  options: types.IDynamicOptions
): boolean {
  const condaMetaPath = path.join(
    conda.condaBasePath(options),
    "envs",
    inputs.activateEnvironment,
    "conda-meta"
  );
  return fs.existsSync(condaMetaPath);
}

/**
 * Read the environment yaml to use channels if provided and avoid conda solver conflicts
 */
export async function getEnvSpec(
  inputs: types.IActionInputs
): Promise<types.IEnvSpec> {
  if (!inputs.environmentFile) {
    return {};
  }

  const sourceEnvironmentPath: string = path.join(
    process.env["GITHUB_WORKSPACE"] || "",
    inputs.environmentFile
  );

  const source = fs.readFileSync(sourceEnvironmentPath, "utf8");

  if (source.match(/^@EXPLICIT/m)) {
    return { explicit: source, yaml: {} };
  }

  return { yaml: yaml.safeLoad(source) as types.IEnvironment };
}
