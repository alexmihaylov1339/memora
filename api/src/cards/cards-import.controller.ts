import {
  BadRequestException,
  Body,
  Controller,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { CardsImportService } from './cards-import.service';
import type { CsvParseResult } from './csv/csv-parser';
import { parseCsv } from './csv/csv-parser';
import type { ImportCardsResponseDto } from './dto/import-cards.dto';
import { serializeImportCardsResponse } from './dto/import-cards.dto';

interface UploadedCsvFile {
  buffer: Buffer;
  size: number;
}

const CSV_IMPORT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const CSV_IMPORT_ERRORS = {
  noFile: 'No file uploaded',
  fileTooLarge: 'File exceeds 5 MB limit',
  invalidCsv: 'Could not parse CSV file',
  noValidRows: 'No valid rows found in CSV',
} as const;

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsImportController {
  constructor(private readonly cardsImport: CardsImportService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: UploadedCsvFile | undefined,
    @Body('deckId') deckId?: string,
  ): Promise<ImportCardsResponseDto> {
    if (!file) {
      throw new BadRequestException(CSV_IMPORT_ERRORS.noFile);
    }

    if (file.size > CSV_IMPORT_MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(CSV_IMPORT_ERRORS.fileTooLarge);
    }

    let parseResult: CsvParseResult;
    try {
      parseResult = parseCsv(file.buffer);
    } catch {
      throw new BadRequestException(CSV_IMPORT_ERRORS.invalidCsv);
    }

    if (parseResult.rows.length === 0) {
      throw new BadRequestException(CSV_IMPORT_ERRORS.noValidRows);
    }

    const { created } = await this.cardsImport.bulkImportFromCsv(
      user.id,
      parseResult.rows,
      deckId?.trim() || undefined,
    );

    return serializeImportCardsResponse(created, parseResult.skipped);
  }
}
