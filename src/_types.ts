/**
 * A subset of the .condarc file options available as action inputs
 * https://docs.conda.io/projects/conda/en/latest/user-guide/configuration/use-condarc.html
 */

export interface ICondaConfig {
  add_anaconda_token: string;
  add_pip_as_python_dependency: string;
  allow_softlinks: string;
  auto_activate_base: string;
  auto_update_conda: string;
  channel_alias: string;
  channel_priority: string;
  channels: string;
  show_channel_urls: string;
  use_only_tar_bz2: string;
  always_yes: string;
  changeps1: string;
}

/**
 * The action inputs, as defined in `action.yml`
 */
export interface IActionInputs {
  activateEnvironment: string;
  architecture: string;
  condaBuildVersion: string;
  condaConfig: ICondaConfig;
  condaConfigFile: string;
  condaVersion: string;
  environmentFile: string;
  installerUrl: string;
  mambaVersion: string;
  minicondaVersion: string;
  pythonVersion: string;
  removeProfiles: string;
}

interface ISucceedResult {
  ok: true;
  data: string;
}
interface IFailedResult {
  ok: false;
  error: Error;
}
export type Result = ISucceedResult | IFailedResult;

export interface IArchitectures {
  [key: string]: string;
}

export interface IOperatingSystems {
  [key: string]: string;
}

export interface IShells {
  [key: string]: string;
}

export interface IPipSpec {
  pip: string[];
}

export type TYamlDependencies = (string | IPipSpec)[];

/**
 * An environment.yml
 */
export interface IEnvironment {
  name?: string;
  channels?: string[];
  dependencies?: TYamlDependencies;
}

/**
 * Options that may change during the course of discovery/installation/configuration
 */
export interface IDynamicOptions {
  useBundled: boolean;
  useMamba?: boolean;
  envSpec?: IEnvSpec;
}

/**
 * Metadata needed to attempt retrieving an installer from, or to update, the tool cache
 */
export interface ILocalInstallerOpts {
  url: string;
  tool?: string;
  version?: string;
  arch?: string;
}

/**
 * File contents describing an environment
 */
export interface IEnvSpec {
  yaml?: IEnvironment;
  explicit?: string;
}

/**
 * The output of an installer: may update the dynamic options
 */
export interface IInstallerResult {
  options: IDynamicOptions;
  localInstallerPath: string;
}

/**
 * A strategy for ensuring a locally-runnable provider (or no-op, if bundled)
 */
export interface IInstallerProvider {
  provides: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<boolean>;
  installerPath: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<IInstallerResult>;
}

export interface IToolUpdates {
  options: IDynamicOptions;
  tools: string[];
}

/**
 * A strategy for ensuring a tool is available in the conda 'base'
 */
export interface IToolProvider {
  label: string;
  /**
   * Whether this provider is requested by action inputs
   */
  provides: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<boolean>;
  /**
   * Conda package specs for tools to install after updating
   */
  toolPackages: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<IToolUpdates>;
  /**
   * Steps to peform after the env is updated, and potentially reconfigured
   */
  postInstall?: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<void>;
}

/**
 * A strategy for ensure an environment is up-to-date vs the action inputs
 */
export interface IEnvProvider {
  label: string;
  /**
   * Whether this provider is requested by action inputs
   */
  provides: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<boolean>;
  /**
   * The args to conda/mamba, e.g. create, update
   */
  condaArgs: (
    inputs: IActionInputs,
    options: IDynamicOptions
  ) => Promise<string[]>;
}
