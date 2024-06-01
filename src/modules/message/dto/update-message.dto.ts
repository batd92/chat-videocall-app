import { IsNotEmpty } from "class-validator";

export class UpdateMessageDto {

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly content: string;
}
