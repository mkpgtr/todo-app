const nodemailer = require("nodemailer");



// async..await is not allowed in global scope, must use a wrapper
const sendEmail =  async(email,data)=> {

    let testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.ETHEREAL_EMAIL,
          pass: process.env.ETHEREAL_PASSWORD,
        },
      });
    console.log(process.env.ETHEREAL_EMAIL)
  // send mail with defined transport object

  const {subject,text,html} = data
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}


module.exports = sendEmail;