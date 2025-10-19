<<<<<<< Updated upstream
import { SetMetadata } from "@nestjs/common"
import { ROLE } from "src/enum/role"


export const ROLES_KEY = 'roles'
=======
import { SetMetadata } from "@nestjs/common"
import { ROLE } from "src/enum/role"


export const ROLES_KEY = 'roles'
>>>>>>> Stashed changes
export const Roles = (...roles: [ROLE,...ROLE[]]) => SetMetadata(ROLES_KEY,roles)