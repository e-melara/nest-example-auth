import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { User } from './entities/user.entity';
import { LoginUserDTO, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createUserDto;
      const user = this.userRespository.create({
        ...userDate,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRespository.save(user);
      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (e) {
      this.handleDBErrors(e);
    }
  }

  async login(loginUserDTO: LoginUserDTO) {
    try {
      const { email, password } = loginUserDTO;
      const user = await this.userRespository.findOne({
        where: { email },
        select: { email: true, password: true, id:true },
      });

      if (!user) {
        throw new UnauthorizedException('Credeciales no son validas(email)');
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Credeciales no son validas(password)');
      }

      return { email: user.email, token: this.getJwtToken({ id: user.id }) };
    } catch (e) {
      this.handleDBErrors(e);
    }
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error?.response) {
      throw new InternalServerErrorException(error.response);
    }
    throw new InternalServerErrorException('Por favor verifique sus logs');
  }
}
