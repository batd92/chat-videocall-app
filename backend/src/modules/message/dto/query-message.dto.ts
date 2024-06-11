import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ParseFloatPipe } from '@nestjs/common';
export class QueryMessageDto {

    @IsString()
    @IsOptional()
    next_cursor: string = "";

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsNumber()
    limit: number = 20;

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    @IsNumber()
    skip: number = 20;

    @IsOptional()
    @IsString()
    keyword: string = "";

    // @IsBoolean()
    // isJumpToMessages: boolean;
}