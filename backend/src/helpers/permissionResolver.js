export function resolvePermissionKeys(user) {
  const allowed = new Set();
  const denied = new Set((user.deniedPermissions ?? []).map((permission) => permission.key ?? permission));

  for (const role of user.roles ?? []) {
    if (!role.isActive) continue;
    for (const permission of role.permissions ?? []) {
      const key = permission.key ?? permission;
      if (!denied.has(key)) allowed.add(key);
    }
  }

  for (const permission of user.directPermissions ?? []) {
    const key = permission.key ?? permission;
    if (!denied.has(key)) allowed.add(key);
  }

  return [...allowed];
}
