import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import db from "@/lib/db"
import { v4 as uuidv4 } from 'uuid';
const transporter = nodemailer.createTransport({
            host: 'mail.diamondraja.com',
            port: 465,
            secure: true, // true for 465
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS,         // your cPanel password
            },
        });



export const POST = async (req) => {
    try {
        const { email } = await req.json();
    if (!email) {
        return NextResponse.json({ success: false, message: "email is required" }, { status: 401 })
    }

    const [rows] = await db.query("select *from users where email=?", [email]);
    if (rows.length === 0) {
        return NextResponse.json({ success: false, message: "user not found" }, { status: 401 })
    }

    
    const resetToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 3600000)  
    const userId=rows[0].id

    await db.query("insert into password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",[userId,resetToken,tokenExpiry])
 const resetLink = `${process.env.NEXT_PUBLIC_PRODUCTION_URL}${process.env.NEXT_PUBLIC_BASE_PATH}/auth/resetpassword?token=${resetToken}`;


       await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset</h2>
          <p>Hello ${rows[0].name},</p>
          <p>You requested to reset your password. Click below:</p>
          <a href="${resetLink}" style="display:inline-block; padding:12px 24px; background:#2563eb; color:white; text-decoration:none; border-radius:6px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });
    

    return NextResponse.json({success:true,message:"Reset link send success"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({success:false,message:"unable to send reset link"},{status:500})
    }



}