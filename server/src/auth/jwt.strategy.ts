import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
    }

    async validate(payload: any) {
        // Support both roles array and single role (backward compatibility)
        const roles = payload.roles || (payload.role ? [payload.role] : []);
        return { 
            userId: payload.sub, 
            email: payload.email, 
            roles: roles,
            role: roles[0] // Keep for backward compatibility
        };
    }
}
