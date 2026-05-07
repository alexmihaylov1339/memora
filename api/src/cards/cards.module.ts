import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';
import { CardsImportController } from './cards-import.controller';
import { CardsImportService } from './cards-import.service';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [AuthModule, PrismaModule, MulterModule.register()],
  controllers: [CardsController, CardsImportController],
  providers: [CardsService, CardsImportService],
})
export class CardsModule {}
