import db from '../../db/models';

export default {
  getProfile: async (req, res) => {
    const { userId } = req.query;
    let isFollowed = null;
    const include = userId ? [
      {
        model: db.MemberShip,
        as: 'followers',
        where: { followerId: userId },
        required: false,
      }
    ] : [];
    try {
      const user = await db.User.findOne({
        where: { username: req.params.username },
        attributes: ['id',
          'username',
          'email',
          'firstName',
          'lastName',
          'image',
          'bio',
        ],
        include
      });

      if (!user) {
        return res.status(404).send({
          error: 'User does not exist',
        });
      }

      if (userId) {
        isFollowed = (user.dataValues.followers.length > 0);
      }

      const followingNo = await db.MemberShip.count({
        where: { followerId: user.id },
      });

      const followersNo = await db.MemberShip.count({
        where: { followId: user.id },
      });

      return res.status(200).json({
        user: {
          ...user.dataValues,
          isFollowed,
          followersNo,
          followingNo,
        }
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
      });
    }
  },
};
