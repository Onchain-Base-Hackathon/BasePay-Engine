import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PAYMENT_MODEL } from 'src/constants';
import { Model } from 'mongoose';
import { IPayment, PaymentPageStatus } from 'src/schemas/payment.schema';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PAYMENT_MODEL)
    private readonly paymentModel: Model<IPayment>,
  ) {}

  async createPaymentLink(dto: CreatePaymentDto, user: string) {
    const { slug, amount, description } = dto;
    const newSlug = slug.replaceAll(' ', '-');
    let paymentLink = await this.paymentModel.findOne({
      slug: newSlug,
    });
    if (paymentLink) {
      throw new BadRequestException('Invalid slug');
    }
    paymentLink = await this.paymentModel.create({
      user,
      slug: newSlug,
      amount,
      description,
      status: PaymentPageStatus.PUBLISHED,
    });
    return {
      message: 'Payment link created successfully',
      success: true,
      data: paymentLink,
    };
  }

  async paymentLinkDetails(slug: string) {
    const paymentLink = await this.paymentModel.findOne({
      slug,
    });
    return {
      message: 'Payment link fetched successfully',
      success: true,
      data: paymentLink,
    };
  }

  async userPaymentLinks(user: string) {
    const paymentLinks = await this.paymentModel.find({
      user,
    });
    return {
      message: 'Payment links fetched successfully',
      success: true,
      data: paymentLinks,
    };
  }
}
