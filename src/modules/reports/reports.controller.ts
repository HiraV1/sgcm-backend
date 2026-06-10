import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateReportResponseDto } from './dto/response/validate-report-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from '../users/enums/user-type.enum';
import { RevokeReportDto } from './dto/revoke-report.dto';
import { ReportResponseDto } from './dto/response/report-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Public()
  @Get('validate/:code')
  @ApiOperation({
    summary: 'Validate report by validation code',
  })
  @ApiParam({
    name: 'code',
    example: '493ef749-5cab-4732-848e-89f4cdc84019',
  })
  @ApiResponse({
    status: 200,
    description: 'Report validated successfully',
    type: ValidateReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  validate(@Param('code') code: string) {
    return this.reportsService.validate(code);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Patch(':id/revoke')
  @ApiOperation({
    summary: 'Revoke a report',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({
    type: RevokeReportDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Report revoked successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Report is already revoked or revokedReason is missing',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only revoke reports from your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  revoke(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RevokeReportDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.reportsService.revoke(id, dto, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Download report as PDF',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF report file',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtPayload,
    @Res() response: Response,
  ): Promise<void> {
    const pdf = await this.reportsService.downloadPdf(id, currentUser);

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laudo-${pdf.validationCode}.pdf"`,
    });

    response.send(pdf.buffer);
  }
}
