import * as path from "path";
import * as fs from "fs";

import * as yaml from "js-yaml";

import * as core from "@actions/core";

import * as types from "../_types";
import * as conda from "../conda";

import { ensureExplicit } from "./explicit";
import { ensureYaml } from "./yaml";
import { ensureSimple } from "./simple";

const providers: types.IEnvProvider[] = [
  ensureExplicit,
  ensureSimple,
  ensureYaml,
];

/**
 * Create test environment, or update the base environment
 */
export async function ensureEnvironment(
  inputs: types.IActionInputs,
  options: types.IDynamicOptions
): Promise<void> {
  for (const provider of providers) {
    core.info(`Trying ${provider.label}...`);
    if (await provider.provides(inputs, options)) {
      core.info(`... will create with ${provider.label}`);
      const args = await provider.condaArgs(inputs, options);
      return await core.group(`Updating env from ${provider.label}...`, () =>
        conda.condaCommand(args, options)
      );
    }
  }

  throw Error(
    `'activate-environment: ${
      inputs.activateEnvironment
    }' could not be created with any of ${providers
      .map((x) => `- ${x.label}`)
      .join("")}`
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
