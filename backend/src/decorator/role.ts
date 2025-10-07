import { SetMetadata } from "@nestjs/common"
import { ROLE } from "src/enum/role"


export const ROLES_KEY = 'roles'
export const Roles = (...roles: [ROLE,...ROLE[]]) => SetMetadata(ROLES_KEY,roles)