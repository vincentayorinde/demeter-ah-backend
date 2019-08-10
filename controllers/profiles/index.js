import db from '../../db/models';

export default {
  getProfile: async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: { username: req.params.username },
      });

      if (!user) {
        return res.status(404).send({
          error: 'User does not exist',
        });
      }

      const followingNo = await db.MemberShip.count({
        where: { followerId: user.id },
      });

      const followersNo = await db.MemberShip.count({
        where: { followId: user.id },
      });

      const data = user.response(false);
      return res.status(200).json({
        user: {
          ...data,
          followersNo,
          followingNo,
        },
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
      });
    }
  },
};
