import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from '../users/enums/user-type.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProcedureAuthorizationDto } from './dto/procedure-authorization.dto';

@ApiTags('Procedures')
@ApiBearerAuth('JWT-auth')
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id')
  @ApiOperation({
    summary: 'Find a procedure by id',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Procedure found successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only access your procedures',
  })
  @ApiResponse({
    status: 404,
    description: 'Procedure not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.proceduresService.findOne(id, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Put(':id')
  @ApiOperation({
    summary: 'Update a procedure',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Procedure ID',
  })
  @ApiBody({
    description:
      'Update procedure data. Available fields depend on the procedure type.',
    examples: {
      simpleProcedure: {
        summary: 'Update simple procedure',
        value: {
          name: 'Updated Blood Collection',
          description: 'Routine blood collection for laboratory analysis',
          estimatedDuration: 20,
        },
      },

      specializedProcedure: {
        summary: 'Update specialized procedure',
        value: {
          name: 'Cardiac MRI',
          description: 'Magnetic resonance imaging of the heart',
          requiredEquipment: [
            'MRI Scanner',
            'Contrast Injector',
            'Heart Monitor',
          ],
          complexityLevel: 'HIGH',
          requiresAuthorization: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Procedure updated successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Procedure cannot be updated because the appointment is finished or the procedure authorization has already been decided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update procedures from your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Procedure not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProcedureDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.proceduresService.update(id, dto, currentUser);
  }

  @Auth(UserType.ADMIN)
  @Patch(':id/authorization')
  @ApiOperation({
    summary: 'Authorize or deny a specialized procedure',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Procedure ID',
  })
  @ApiBody({
    description:
      'Update procedure data. Available fields depend on the procedure type.',
    examples: {
      authorize: {
        summary: 'Authorize procedure',
        value: {
          status: 'AUTHORIZED',
        },
      },

      deny: {
        summary: 'Deny procedure',
        value: {
          status: 'DENIED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Procedure authorization updated successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Procedure does not require authorization or authorization has already been decided',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Procedure not found',
  })
  authorization(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcedureAuthorizationDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.proceduresService.authorization(id, dto, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a procedure',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Procedure ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Procedure deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete procedures from your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Procedure not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Procedure cannot be deleted due to its current state',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    currentUser: JwtPayload,
  ): Promise<void> {
    await this.proceduresService.remove(id, currentUser);
  }
}
