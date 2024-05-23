import { z, ZodError } from 'zod'
import { MessageType } from '../types/message-types'
import { Request, Response, NextFunction } from 'express'

export function validateData(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: any) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))

                req.flash(MessageType.Warning, 'Invalid data', errorMessages)
                next()
                return
            } 

            req.flash(MessageType.Error, 'Internal Server Error')
            next()
        }
    }
}