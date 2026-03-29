import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, CreateUserProfileDto } from './dto/user.dto';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RESPONSE_MESSAGES } from '../../common/constants/response-messages.constant';
import { RequestUser } from '../../shared/types/request-user.interface';

@Injectable()
export class UserService {
    constructor( private prisma: PrismaService ) {}

    // async createUser(dto: CreateUserDto) {
    //     const existingUser = await this.prisma.user.findUnique({
    //         where: { email: dto.email }
    //     })

    //     if (existingUser) {
    //         throw new ConflictException ('User already exist!')
    //     }

    //     const hashedPassword = await bcrypt.hash(dto.password, 10)

    //     const user = await this.prisma.user.create({
    //         data: {
    //             email: dto.email,
    //             password: hashedPassword,
    //             userProfile: {
    //                 create: {},     //create an empty user profile object for user to update later if user account is created
    //             }
    //         },
    //     })

    //     return {
    //         status: 'success',
    //         messsage: 'User created successfully',
    //         user,
    //     }
    // }

    async createUserProfile(requestUser: RequestUser, userId: number, dto: CreateUserProfileDto) {
        const { firstName, middleName, lastName, avatarURL, address, city, country, bio, phone, dateOfBirth } = dto;
        
        const existingUser = await this.prisma.user.findUnique({
            where: { id: requestUser.id }
        })

        if (!existingUser) {
            throw new NotFoundException('User not found')
        }

        const userProfile = await this.prisma.userProfile.update({
            where: { userId: requestUser.id },
            data: {
                firstName,
                middleName,
                lastName,
                avatarURL,
                address,
                city,
                country,
                bio,
                phone,
                dateOfBirth: new Date(),
            },
        })

        return {
            status: 'success',
            message: `User ${userProfile.firstName} ${userProfile.lastName} profile has been added`,
            userProfile,
        }
    }
}
