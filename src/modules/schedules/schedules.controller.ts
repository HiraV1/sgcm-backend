import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { FindSchedulesQueryDto } from './dto/query/find-schedules-query.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

import { ScheduleType } from './enums/schedule-type.enum';
import { ScheduleStatus } from './enums/schedule-status.enum';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new schedule',
  })
  @ApiBody({
    description: 'Create schedules based on their type',
    examples: {
      inPerson: {
        summary: 'Create in-person schedule',
        value: {
          scheduledAt: '2026-01-15T14:00:00Z',
          doctorId: 1,
          patientId: 2,
          type: 'IN_PERSON',
          room: 'Room 204',
          unit: 'Main Clinic Unit',
        },
      },

      online: {
        summary: 'Create online schedule',
        value: {
          scheduledAt: '2026-01-15T16:00:00Z',
          doctorId: 1,
          patientId: 2,
          type: 'ONLINE',
          accessLink: 'https://meet.google.com/abc-defg',
          platform: 'Google Meet',
        },
      },

      home: {
        summary: 'Create home schedule',
        value: {
          scheduledAt: '2026-01-16T10:00:00Z',
          doctorId: 1,
          patientId: 2,
          type: 'HOME',
          fullAddress: '123 Main Street, Apartment 45',
          accessNotes: 'Ring the bell twice',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor or patient not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Schedule conflict detected',
  })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List schedules with filters and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    example: 2,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ScheduleStatus,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ScheduleType,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2026-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-01-31T23:59:59Z',
  })
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find schedule by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(+id);
  }

  @Put(':id')
  @ApiBody({
    description: 'Update schedule data',
    examples: {
      updateDate: {
        summary: 'Update scheduled date',
        value: {
          scheduledAt: '2026-01-20T14:00:00Z',
        },
      },

      updateOnline: {
        summary: 'Update online schedule data',
        value: {
          accessLink: 'https://meet.google.com/new-link',
          platform: 'Zoom',
        },
      },

      updateHome: {
        summary: 'Update home schedule data',
        value: {
          fullAddress: '456 New Avenue, House 12',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Patch(':id/status')
  @ApiBody({
    description: 'Update schedule status respecting allowed transitions',
    examples: {
      confirm: {
        summary: 'Confirm schedule',
        value: {
          status: 'CONFIRMED',
        },
      },

      cancel: {
        summary: 'Cancel schedule',
        value: {
          status: 'CANCELLED',
          cancellationReason: 'Patient requested cancellation',
        },
      },
    },
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleStatusDto: UpdateScheduleStatusDto,
  ) {
    return this.schedulesService.updateStatus(id, updateScheduleStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete schedule by id',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Schedule deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Completed schedules cannot be deleted because they already originated a clinical appointment',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}
