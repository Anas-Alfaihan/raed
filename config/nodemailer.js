import nodemailer from 'nodemailer'

export default nodemailer.createTransport({
    service:process.env.MAILER_HOST,
    secure: true,
 
    debug:true,
    port:process.env.MAILER_PORT,
    secureConnection:true,

    auth: {
        user: process.env.EMAIL,
        pass: process.env.MAILER_PASS,
    },
    tls:{rejectUnAuthorized:true}
})
