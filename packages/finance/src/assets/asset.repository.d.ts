import type { CrudRepository } from "../repositories/repository.types.js";
import type { AssetListQuery, CreateAssetInput, UpdateAssetInput } from "./asset.contracts.js";
import type { Asset, AssetId } from "./asset.types.js";
export interface AssetRepository extends CrudRepository<Asset, AssetId, CreateAssetInput, UpdateAssetInput, AssetListQuery> {}
