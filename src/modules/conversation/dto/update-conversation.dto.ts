import { IsNotEmpty } from "class-validator";

export class UpdateConversationDto {

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly content: string;
}
