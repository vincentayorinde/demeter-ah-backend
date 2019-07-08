export default {
  createArticle: async (req, res) => {
    const {
      description, body, title, image
    } = req.body;
    try {
      const article = await req.user.createArticle({
        description,
        body,
        title,
        images: image || 'defaultImgUrl',
      });

      return res.status(201).json({
        message: 'Article created successful',
        article,
      });
    } catch (e) {
      /* istanbul ignore next */
      return res.status(500).json({
        message: 'Something went wrong',
        error: e.message,
      });
    }
  },
};
