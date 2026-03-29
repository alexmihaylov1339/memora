import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
