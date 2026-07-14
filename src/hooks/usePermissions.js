import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function usePermissions() {
    const { user } = useContext(AuthContext);

    // Os papéis e permissões vêm do backend na chave 'roles' e 'permissions'
    const roles = user?.roles || [];
    const permissions = user?.permissions || [];

    const hasRole = (roleName) => {
        return roles.includes(roleName);
    };

    const hasPermission = (permissionName) => {
        // Se for admin, pode tudo
        if (roles.includes('admin')) {
            return true;
        }
        return permissions.includes(permissionName);
    };

    const hasAnyPermission = (permissionNames) => {
        if (roles.includes('admin')) return true;
        return permissionNames.some(p => permissions.includes(p));
    };

    return {
        roles,
        permissions,
        hasRole,
        hasPermission,
        hasAnyPermission,
    };
}
