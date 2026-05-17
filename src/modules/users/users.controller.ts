import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

import { UserResponseDto } from './dto/response/user-response.dto';

import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'Create users based on their type',
    examples: {
      admin: {
        summary: 'Create ADMIN user',
        value: {
          name: 'Admin User',
          email: 'admin@email.com',
          password: '123456',
          type: 'ADMIN',
          accessLevel: 10,
        },
      },

      doctor: {
        summary: 'Create DOCTOR user',
        value: {
          name: 'Dr. House',
          email: 'doctor@email.com',
          password: '123456',
          type: 'DOCTOR',
          crm: 'CRM12345',
        },
      },

      patient: {
        summary: 'Create PATIENT user',
        value: {
          name: 'John Doe',
          email: 'patient@email.com',
          password: '123456',
          type: 'PATIENT',
          cpf: '99999999999',
          birthDate: '2000-05-10',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Email/CPF/CRM already in use',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, example: 'name:asc' })
  @ApiQuery({ name: 'search', required: false, example: 'higor' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.usersService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by id' })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiBody({
    description: 'Partial user update',
    examples: {
      updateName: {
        summary: 'Update user name',
        value: {
          name: 'Updated Name',
        },
      },

      updateEmail: {
        summary: 'Update email',
        value: {
          email: 'newemail@email.com',
        },
      },

      updateDoctor: {
        summary: 'Update doctor data',
        value: {
          name: 'Dr. House',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user by id' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(+id);
  }
}
