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
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
//import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateInPersonScheduleDto } from './dto/create/create-in-person-schedule.dto';
import { CreateOnlineScheduleDto } from './dto/create/create-online-schedule.dto';
import { CreateHomeScheduleDto } from './dto/create/create-home-schedule.dto';
import { FindSchedulesQueryDto } from './dto/query/find-schedules-query.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('in-person')
  createInPerson(@Body() createInPersonScheduleDto: CreateInPersonScheduleDto) {
    return this.schedulesService.createInPerson(createInPersonScheduleDto);
  }

  @Post('online')
  createOnline(@Body() createOnlineScheduleDto: CreateOnlineScheduleDto) {
    return this.schedulesService.createOnline(createOnlineScheduleDto);
  }

  @Post('home')
  createHome(@Body() createHomeScheduleDto: CreateHomeScheduleDto) {
    return this.schedulesService.createHome(createHomeScheduleDto);
  }

  @Get()
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(+id);
  }

  /*@Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }*/

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(+id);
  }
}
