import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  categoryIds?: number[];
}
