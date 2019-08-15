import db from '../../db/models';
import { getMembers } from '../../utils';
import Notification from '../../utils/notifications';

export default {
  createFollowing: async (req, res) => {
    const { id } = req.user;
    const { followId } = req.body;
    const followerId = id;

    if (followId === id) {
      return res.status(400).send({
        error: "you can't follow yourself",
      });
    }

    try {
      const userExist = await db.User.findOne({
        where: { id: followId },
      });

      if (!userExist) {
        return res.status(404).send({
          error: 'user not found',
        });
      }
      const following = await db.MemberShip.findOne({
        where: {
          followerId,
          followId,
        },
      });
      if (following) {
        // unfollow user
        await following.destroy();
        return res.status(200).send({
          message: 'unfollow successful',
        });
      }
      const result = await db.MemberShip.create({
        followerId,
        followId,
      });

      Notification.followNotification({
        userId: followerId,
        followedUserId: followId,
      });

      return res.status(200).send({
        user: result,
        message: 'Follow successful',
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).send({
        error: 'something went wrong',
      });
    }
  },

  getFollowing: async (req, res) => {
    const { id } = req.user;

    const user = await getMembers('following', 'followed', id);

    return res.status(200).send({
      user,
    });
  },

  getFollowers: async (req, res) => {
    const { id } = req.user;

    const user = await getMembers('followers', 'follower', id);
    return res.status(200).send({
      user,
    });
  },

  getFollowingByUsername: async (req, res) => {
    const { id } = req.user;
    const { username } = req.params;
    const include = id
      ? [
        {
          model: db.MemberShip,
          as: 'followers',
          where: { followerId: id },
          required: false,
        },
      ]
      : [];

    const user = await db.User.findOne({
      where: {
        username,
      },
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'image'],
      include: [
        {
          model: db.MemberShip,
          as: 'following',
          include: [
            {
              model: db.User,
              as: 'followed',
              include,
              attributes: [
                'id',
                'username',
                'email',
                'firstName',
                'lastName',
                'image',
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).send({
      user,
    });
  },

  getFollowersByUsername: async (req, res) => {
    const { id } = req.user;
    const { username } = req.params;

    const include = id
      ? [
        {
          model: db.MemberShip,
          as: 'followers',
          where: { followerId: id },
          required: false,
        },
      ]
      : [];

    const user = await db.User.findOne({
      where: {
        username,
      },
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'image'],
      include: [
        {
          model: db.MemberShip,
          as: 'followers',
          include: [
            {
              model: db.User,
              as: 'follower',
              include,
              attributes: [
                'id',
                'username',
                'email',
                'firstName',
                'lastName',
                'image',
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).send({
      user,
    });
  },
};
