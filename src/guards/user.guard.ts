import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_MODEL } from 'src/constants';
import { IUser } from 'src/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<IUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const username = this.extractUsernameFromHeader(request);

    console.log('username', username);

    if (!username)
      throw new UnauthorizedException('Authorization header not found');

    const user = await this.userModel.findOne({ apiKey: username });

    if (!user) throw new UnauthorizedException('Invalid API key');

    request.user = user;

    return true;
  }

  private extractUsernameFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];

    if (!authHeader) return undefined;

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [username, _] = credentials.split(':');

    return username;
  }
}
