const nodemailer = require("nodemailer");

module.exports.sendMail = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, //
          pass: process.env.EMAIL_PASSWORD //
        }
      });
      
      // send mail with defined transport object
      const mail = {
        from: "damduytien2003@gmail.com", // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: html // html body
      };
      
      transporter.sendMail(mail, function(error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + response.message);
        }
      
        transporter.close();
      });
}