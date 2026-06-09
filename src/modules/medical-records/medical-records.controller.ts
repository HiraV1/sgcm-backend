import { Body, Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from '../users/enums/user-type.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { MedicalRecordResponseDto } from './dto/response/medical-record-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiBearerAuth('JWT-auth')
@Controller('records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Put(':id')
  @ApiOperation({
    summary: 'Update a medical record',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Medical record ID',
  })
  @ApiBody({
    description: 'Update medical record data',
    examples: {
      medicalRecord: {
        summary: 'Update medical record',
        value: {
          diagnosis: 'Updated diagnosis',
          prescription: 'Updated prescription for 60 days',
          notes: 'Patient showing improvement after treatment',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update records from your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.medicalRecordsService.update(id, dto, currentUser);
  }
}
