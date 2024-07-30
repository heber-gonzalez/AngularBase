export class ConfirmationDto {
    title: string;
    message: string;
    accept: () => void;
    reject?: () => void;
    acceptLabel?: string;
    rejectLabel?: string;
}