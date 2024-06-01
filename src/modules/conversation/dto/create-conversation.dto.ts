import { IsNotEmpty } from 'class-validator';
export class CreateConversationDto {

    @IsNotEmpty()
    readonly content: string;
}
