import  Jwt  from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const hashPassword = async (password :string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId:number, role:string) => {
    return Jwt.sign( { userId, role}, JWT_SECRET, { expiresIn: '1d' } );
}

export const verifyToken = (token: string) => {
    return Jwt.verify(token, JWT_SECRET);
}