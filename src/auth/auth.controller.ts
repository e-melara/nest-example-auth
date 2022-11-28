import { Controller, Post, Body, Get, UseGuards, SetMetadata } from '@nestjs/common';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Auth } from './decorators/auth.decorator';
import { CreateUserDto, LoginUserDTO } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }

  @Get('private')
  // @SetMetadata('roles', ['admin', 'super-user'])
  // @UseGuards(AuthGuard(), UserRoleGuard)
  @Auth(ValidRoles.admin)
  testingPrivateRoute(
    @GetUser() user:  User
  ) {
    return {
      ok: true,
      user
    }
  }
}
