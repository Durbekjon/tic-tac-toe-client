import { BadRequestException, Injectable } from '@nestjs/common';
import { SupportRepository } from './support.repository';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { Prisma, TicketStatus } from '@prisma/client';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupportService {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async createSupportTicket(appKey: string, body: CreateSupportTicketDto) {
    const user = await this.userRepository.findByChatId(body.userId);

    if (!user) throw new BadRequestException('User not found');

    const data: Prisma.SupportTicketCreateInput = {
      text: body.text,
      imageUrl: body.imageUrl,
      user: {
        connect: {
          id: user.chatId,
        },
      },
      status: TicketStatus.PENDING,
    };

    return {
      success: true,
      data: await this.supportRepository.createSupportTicket(data),
    };
  }

  private validateAppKey(appKey: string) {
    if (appKey !== this.configService.get('APP_KEY')) {
      throw new BadRequestException('Invalid app key');
    }
  }
}