import * as path from "path";
import * as core from "@actions/core";
import * as constants from "./_constants";
import * as types from "./_types";

interface IRule {
  (inputs: types.IActionInputs, condaConfig: types.ICondaConfig):
    | string
    | false;
}

const urlExt = (url: string) => path.posix.extname(new URL(url).pathname);

/**
 *
 */
const RULES: IRule[] = [
  (i, c) =>
    !!(i.condaVersion && c.auto_update_conda === "true") &&
    `only one of 'conda-version: ${i.condaVersion}' or 'auto-update-conda: true' may be provided`,
  (i) =>
    !!(i.pythonVersion && !i.activateEnvironment) &&
    `'python-version: ${i.pythonVersion}' requires 'activate-environment: true'`,
  (i, c) =>
    !!(i.mambaVersion && !c.channels.includes("conda-forge")) &&
    `'mamba-version: ${i.mambaVersion}' requires 'conda-forge' to be included in 'channels'`,
  (i) =>
    !!(i.installerUrl && i.minicondaVersion) &&
    `only one of 'installer-url' and 'miniconda-version' may be provided`,
  (i) =>
    !!(
      i.installerUrl &&
      !constants.KNOWN_EXTENSIONS.includes(urlExt(i.installerUrl))
    ) &&
    `'installer-url' extension '${urlExt(i.installerUrl)}' must be one of: ${
      constants.KNOWN_EXTENSIONS
    }`,
  (i) =>
    !!(i.minicondaVersion && i.architecture !== "x64") &&
    `'architecture: ${i.architecture}' requires "miniconda-version"`,
  (i) =>
    !!(i.architecture === "x86" && constants.IS_LINUX) &&
    `'architecture: ${i.architecture}' is not supported by recent versions of Miniconda`,
];

/*
 * Parse, validate, and normalize string-ish inputs from `with`
 */
export async function parseInputs(): Promise<types.IActionInputs> {
  const inputs: types.IActionInputs = {
    activateEnvironment: core.getInput("activate-environment"),
    architecture: core.getInput("architecture"),
    condaBuildVersion: core.getInput("conda-build-version"),
    condaConfigFile: core.getInput("condarc-file"),
    condaVersion: core.getInput("conda-version"),
    environmentFile: core.getInput("environment-file"),
    installerUrl: core.getInput("installer-url"),
    mambaVersion: core.getInput("mamba-version"),
    minicondaVersion: core.getInput("miniconda-version"),
    pythonVersion: core.getInput("python-version"),
    removeProfiles: core.getInput("remove-profiles"),
    condaConfig: {
      add_anaconda_token: core.getInput("add-anaconda-token"),
      add_pip_as_python_dependency: core.getInput(
        "add-pip-as-python-dependency"
      ),
      allow_softlinks: core.getInput("allow-softlinks"),
      auto_activate_base: core.getInput("auto-activate-base"),
      auto_update_conda: core.getInput("auto-update-conda"),
      channel_alias: core.getInput("channel-alias"),
      channel_priority: core.getInput("channel-priority"),
      channels: core.getInput("channels"),
      show_channel_urls: core.getInput("show-channel-urls"),
      use_only_tar_bz2: core.getInput("use-only-tar-bz2"),
      // these are always set to avoid terminal issues
      always_yes: "true",
      changeps1: "false",
    },
  };

  const errors = RULES.reduce((errors, rule) => {
    const msg = rule(inputs, inputs.condaConfig);
    if (msg) {
      core.error(msg);
      errors.push(msg);
    }
    return errors;
  }, [] as string[]);

  // TODO: remove
  core.info(JSON.stringify(inputs));

  if (errors.length) {
    throw Error(`${errors.length} errors found in action inputs`);
  }

  return inputs;
}
