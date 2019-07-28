import AWS from 'aws-sdk';
import './auth';
import db from '../../db/models';

export const polly = new AWS.Polly();

const textToSpeech = async (articleId, articleBody, articleTitle) => {
  const s3 = new AWS.S3();
  const title = articleTitle;
  const text = articleBody;
  const TextType = 'text';
  const voiceId = 'Matthew';

  const params = {
    LanguageCode: 'en-US',
    OutputFormat: 'mp3',
    Text: text,
    TextType,
    VoiceId: voiceId
  };

  const article = await db.Article.findOne({
    where: {
      id: articleId
    }
  });

  const synchCB = (err, data) => {
    if (err) {
      console.log('error  berfore', err);
    } else if (data) {
      const s3params = {
        Body: data.AudioStream,
        Bucket: 'authors-haven',
        Key: `${title}.mp3`,
        ACL: 'public-read'
      };

      s3.upload(s3params, (err, result) => {
        if (err) {
          throw err.message;
        } else {
          const url = result.Location;
          article.update({
            audiourl: url
          });
        }
      });
    }
  };
  try {
    polly.synthesizeSpeech(params, synchCB);
  } catch (error) {
    throw error.message;
  }
};

export default textToSpeech;
