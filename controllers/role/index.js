import db from '../../db/models';

export default {
  changeRole: async (req, res) => {
    const { params: { username }, body: { role } } = req;
    try {
      const foundUser = await db.User.findOne({
        where: { username },
        attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName']
      });
      if (!foundUser) {
        return res.status(404).send({
          error: 'User does not exist'
        });
      }
      const user = await foundUser.update({ role }, { returning: true, where: { username } });
      return res.status(200).json({
        message: 'User role updated successfully',
        user
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong'
      });
    }
  },
};
