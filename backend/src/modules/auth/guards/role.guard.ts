import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "src/decorator/role";
import { ROLE } from "src/enum/role";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector){}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY,[
            context.getHandler(),
            context.getClass(),
        ]);

    if(!requiredRoles) return true

    const user = context.switchToHttp().getRequest().user

    console.log(user)

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    
    return hasRequiredRole

    }
}