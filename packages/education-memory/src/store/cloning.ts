export function cloneValue<TValue>(value: TValue, enabled: boolean): TValue {
  return enabled ? structuredClone(value) : value;
}
