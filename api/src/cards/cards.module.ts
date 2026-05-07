import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma.module';
import { CardsController } from './cards.controller';
import { CardsImportService } from './cards-import.service';
import { CardsService } from './cards.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CardsController],
  providers: [CardsService, CardsImportService],
})
export class CardsModule {}
