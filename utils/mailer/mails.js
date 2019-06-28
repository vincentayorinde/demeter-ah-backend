require('dotenv').config();

export const resetPasswordMessage = (email, resetToken) => {
  const url = `${process.env.APP_URL}/change-password?resetToken=${resetToken}`;
  return `Hello <b>${email}</b>, <br>
  Please click on this <b><a href="${url}">Link</a></b> to reset your password. <br> <br>
  Regards,<br>
  The Support Team.`;
};

export const activationMessage = (email, token) => {
  const url = `${process.env.APP_URL}/verify?activate=${token}`;
  return `Hello <b>${email}</b>, <br><br> Welcome to Authors Haven! <br>
    Please click on this <b><a href="${url}">Link</a></b> to verify your account. <br> <br>
    Regards,<br>
    The Support Team.
    `;
};
