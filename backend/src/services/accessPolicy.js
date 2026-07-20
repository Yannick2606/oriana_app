function sameReference(left, right) {
  return left !== undefined && left !== null && (Array.isArray(right)
    ? right.some((value) => String(left) === String(value)) : String(left) === String(right));
}

export function resourceMatchesScope(resource, accessScope) {
  const fields = resource?.fields ?? resource;
  if (!fields || !accessScope) {
    return false;
  }

  return Object.entries(accessScope)
    .every(([field, expected]) => sameReference(fields[field], expected));
}
