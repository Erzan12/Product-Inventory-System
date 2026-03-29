import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserProfileDto } from './dto/user.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { ApiPostResponse } from '../../shared/helpers/swagger-api-response.helper';
import { RequestUser } from '../../shared/types/request-user.interface';
import { SessionUser } from '../../shared/types/session-user.decorator';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Put(':userId')
    @ApiBody({
        type: CreateUserProfileDto,
        description: 'Payload to add user profile to a user',
    })
    @ApiOperation({
        summary: 'Create/Add user profile data for a user',
    })
    @ApiPostResponse('User profile added successfully')
    createUserProfile (
        @Body() dto: CreateUserProfileDto,
        @Param('userId') userId: number,
        @SessionUser() requestUser: RequestUser,
    ) {
        return this.userService.createUserProfile(requestUser, userId, dto)
    }
}
