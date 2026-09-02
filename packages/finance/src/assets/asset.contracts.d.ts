import type { FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { Asset, AssetId, AssetType } from "./asset.types.js";
export interface CreateAssetInput { readonly ownerId: OwnerId; readonly name: string; readonly assetType: AssetType; readonly currentValue: Money; readonly valuedOn: IsoDate; }
export interface UpdateAssetInput { readonly name?: string; readonly currentValue?: Money; readonly valuedOn?: IsoDate; readonly status?: FinancialStatus; }
export interface AssetListQuery extends OwnerQuery { readonly assetType?: AssetType; }
export declare function createAsset(input: CreateAssetInput): Promise<Asset>;
export declare function updateAsset(id: AssetId, ownerId: OwnerId, input: UpdateAssetInput): Promise<Asset>;
export declare function archiveAsset(id: AssetId, ownerId: OwnerId): Promise<Asset>;
export declare function getAsset(id: AssetId, ownerId: OwnerId): Promise<Asset | null>;
export declare function listAssets(query: AssetListQuery): Promise<PageResult<Asset>>;
