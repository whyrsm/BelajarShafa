import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        // process.env should be loaded by main.ts before app initialization
        // This factory runs at runtime, so env vars should be available
        return {
          secret: process.env.JWT_SECRET || 'secretKey',
          signOptions: { expiresIn: '60m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule { }
