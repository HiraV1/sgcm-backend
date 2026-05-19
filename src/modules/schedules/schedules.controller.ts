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
//import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { FindSchedulesQueryDto } from './dto/query/find-schedules-query.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ScheduleType } from './enums/schedule-type.enum';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    switch (createScheduleDto.type) {
      case ScheduleType.IN_PERSON:
        return this.schedulesService.createInPerson(createScheduleDto);
      case ScheduleType.ONLINE:
        return this.schedulesService.createOnline(createScheduleDto);
      case ScheduleType.HOME:
        return this.schedulesService.createHome(createScheduleDto);
    }
  }

  @Get()
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleStatusDto: UpdateScheduleStatusDto,
  ) {
    return this.schedulesService.updateStatus(id, updateScheduleStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}
