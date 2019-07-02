require('dotenv').config();

const resetPasswordMessage = (email, resetToken) => {
  const url = `${process.env.APP_URL}/change-password?resetToken=${resetToken}`;
  return `Hello <b>${email}</b>, <br>
  Please click on this <b><a href="${url}">Link</a></b> to reset your password. <br> <br>
  Regards,<br>
  The Support Team.`;
};
export default resetPasswordMessage;
