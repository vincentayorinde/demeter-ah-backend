import consola from 'consola';
import db from '../db/models';
import mailer from '../utils/mailer/mailer';
import token from '../utils/jwt/token';

let activationToken;
const send = (email) => {
  const url = `http://localhost:5000/activate/${activationToken}`;
  const data = {
    from: '"Authors Haven" <activate@authorshaven.com>',
    to: email,
    subject: 'Activate Account',
    html: `
      Hello <b>${email}</b>, <br><br> Welcome to Authors Haven! <br>
      Please click on this <b><a href="${url}">Link</a></b> to verify your account. <br> <br>
      Regards,<br>
      The Support Team.
      `
  };
  mailer.transporter.sendMail(data, (err, res) => {
    if (err) {
      consola(err);
    }
    return res.status(200).json({
      message: 'Activation Email successfully sent'
    });
  });
};
const signup = async (req, res) => {
  const { name, password, email } = req.body;
  activationToken = token.getActivationToken(email);
  try {
    await db.tempUsers.create({
      name,
      password,
      email,
      activationToken
    });
    await send(email);
    return res.status(201).json({
      message: 'Registration successfull, Please check email to activate account!'
    });
  } catch (e) {
    return res.status(500).json({
      error: 'Something went wrong'
    });
  }
};

const activate = async (req, res) => {
  try {
    const user = await db.tempUsers
      .findOne({ where: { activationToken: req.params.token, activated: false } })
      .then((active) => {
        if (active) {
          active.update({ activated: true });
          return res.status(200).json({
            message: 'Activation successful, You can now login'
          });
        }
      });
    if (!user) {
      return res.status(400).json({
        error: 'Invalid activation Link'
      });
    }
  } catch (e) {
    return res.status(400).json({
      message: 'Bad request'
    });
  }
};

export default { signup, activate };
