import { MessageType } from "../types/message-types"

export class Result {
    type: MessageType
    message: string
    constructor(type: MessageType = MessageType.Info, message: string = '') {
        this.type = type
        this.message = message
    }

    static setSuccess(message: string) {
        return new Result(MessageType.Success, message)
    }

    static setError(message: string) {
        return new Result(MessageType.Error, message)
    }

    static setWarning(message: string) {
        return new Result(MessageType.Warning, message)
    }

    get success(): boolean {
        return this.type === MessageType.Success
    }
}