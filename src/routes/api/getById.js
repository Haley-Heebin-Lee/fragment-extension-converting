const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

const path = require('path');

module.exports = async (req, res) => {
  try {
    let fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    let contentType = fragment.type;

    //fragment = await fragment.getData();
    const rawData = await fragment.getData();

    //if there is extension(wanna convert to) and fragment's type is markdown, convert it
    const extension = path.extname(req.params.id);
    if (extension) {
      const { convertedF, convertedType } = await fragment.convertType(rawData, extension);

      if (!convertedF) {
        logger.warn('Error converting content type');
        res.status(415).json(createErrorResponse(415, 'Error converting content type'));
      } else {
        res.contentType(convertedType);
        logger.info('successfully converted type');

        res.status(200).send(convertedF);
      }
    } else {
      res.contentType(contentType);
      logger.info('successfully get fragment with user and id');
      res.status(200).send(rawData);
    }
  } catch (error) {
    logger.error({ error }, 'error getting a fragment with id');
    res.status(404).json(createErrorResponse(404, error));
  }
};
