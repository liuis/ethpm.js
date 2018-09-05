import { Maybe } from "types";
import { PackageQuery } from "ethpm/package/query";
import * as manifest from "ethpm/manifest";
import * as pkg from "ethpm/package/package";
import * as storage from "ethpm/storage";

export interface Options {
  package: pkg.Package;
  storage: storage.Service;
  manifest: manifest.Service;
}

export class WorkspaceQuery implements PackageQuery {
  package: pkg.Package;

  private storage: storage.Service;
  private manifest: manifest.Service;

  constructor (options: Options) {
    this.package = options.package;
    this.storage = options.storage;
    this.manifest = options.manifest;
  }

  async scope (dependencyName: pkg.PackageName): Promise<PackageQuery> {
    const dependency = await this.buildDependency(dependencyName);

    const resolver = new WorkspaceQuery({
      package: dependency,
      storage: this.storage,
      manifest: this.manifest
    });

    return resolver;
  }

  async contractType(ref: pkg.ContractTypeReference)
    : Promise<pkg.ContractType>
  {
    const terms = ref.split(":");

    const packages = terms.slice(0, -1);
    const type = terms.slice(-1);

    const [ dependencyName, ...rest ] = packages;

    if (dependencyName) {
      const subquery = await this.scope(dependencyName);
      const innerRef = [...rest, type].join(":");

      return await subquery.contractType(innerRef);
    }

    // plain type reference
    return this.package.contractTypes[ref];
  }

  async contractInstance(
    chain: pkg.ChainURI,
    name: pkg.ContractInstanceName
  )
    : Promise<pkg.ContractInstance>
  {
    const deployment = this.package.deployments.get(chain)
    if (deployment === undefined) {
      throw new Error(`Could not find deployment at chain ${chain.href}`);
    }

    const instance = deployment[name];
    if (instance === undefined) {
      throw new Error(`Could not find instance "${name}" on chain ${chain.href}`);
    }

    return instance;
  }

  async buildDependency(name: pkg.PackageName)
    : Promise<pkg.Package>
  {
    const uri = this.package.buildDependencies[name];
    const contents = await this.storage.read(uri);
    if (contents !== undefined) {
      return this.manifest.read(contents);
    }

    throw new Error(`Could not find build dependency "${name}"`);
  }

}
