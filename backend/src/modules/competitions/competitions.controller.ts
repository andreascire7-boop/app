import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';

@Controller('athletes/:athleteId/competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  list(@Param('athleteId') athleteId: string) {
    return this.competitionsService.listForAthlete(athleteId);
  }

  @Post()
  create(@Param('athleteId') athleteId: string, @Body() dto: CreateCompetitionDto) {
    return this.competitionsService.create(athleteId, dto);
  }

  // Import calendario competitivo da file (PDF/Excel/CSV) — estrae automaticamente
  // nome torneo, data, importanza e numero partite previste, poi applica lo stesso
  // calcolo di tapering di un inserimento manuale per ciascun torneo trovato.
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importFromFile(@Param('athleteId') athleteId: string, @UploadedFile() file: Express.Multer.File) {
    return this.competitionsService.importFromFile(athleteId, file);
  }

  @Patch(':competitionId/cancel')
  cancel(@Param('athleteId') athleteId: string, @Param('competitionId') competitionId: string) {
    return this.competitionsService.cancel(athleteId, competitionId);
  }
}
