import {Request, Response, NextFunction} from 'express';

const errorHandler = (err:any, req:Request, res:Response, next:NextFunction) => {
    console.log(err);
    res.status(500).json({message:'internal server error'});
}

export default errorHandler;