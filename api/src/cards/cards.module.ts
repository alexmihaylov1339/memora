import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';
import { CardAssetsController } from './card-assets.controller';
import { CardAssetsService } from './card-assets.service';
import { CardsImportController } from './cards-import.controller';
import { CardsImportService } from './cards-import.service';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [AuthModule, PrismaModule, MulterModule.register()],
  controllers: [CardAssetsController, CardsController, CardsImportController],
  providers: [CardAssetsService, CardsService, CardsImportService],
})
export class CardsModule {}
